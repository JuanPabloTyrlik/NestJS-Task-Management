import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ErrorCodesEnum } from './errors/error-codes.enum';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import {
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';

const mockCredentialsDto: AuthCredentialsDto = {
    username: 'TestUsername',
    password: 'TestPassword',
};

describe('UserRepository', () => {
    let userRepository: UserRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [UserRepository],
        }).compile();

        userRepository = module.get<UserRepository>(UserRepository);
    });

    describe('signUp', () => {
        let save: jest.Mock;

        beforeEach(() => {
            save = jest.fn();
            userRepository.create = jest.fn().mockReturnValue({ save });
        });

        it('should sign up an user', () => {
            save.mockResolvedValue(undefined);
            return expect(
                userRepository.signUp(mockCredentialsDto),
            ).resolves.not.toThrow();
        });

        it('should throw a conflict exception as user already exists', () => {
            save.mockRejectedValue({ code: ErrorCodesEnum.UNIQUE_VIOLATION });
            return expect(
                userRepository.signUp(mockCredentialsDto),
            ).rejects.toThrow(ConflictException);
        });

        it('should throw Internal Server Error', () => {
            save.mockRejectedValue({});
            return expect(
                userRepository.signUp(mockCredentialsDto),
            ).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('validateUserPassword', () => {
        let user: User;

        beforeEach(() => {
            userRepository.findOne = jest.fn();
            user = new User();
            user.username = 'TestUsername';
            user.validatePassword = jest.fn();
        });

        it('should return the username if validation is successful', async () => {
            (<jest.Mock>user.validatePassword).mockResolvedValue(true);
            (<jest.Mock>userRepository.findOne).mockResolvedValue(user);
            const username = await userRepository.validateUserPassword(
                mockCredentialsDto,
            );
            expect(user.validatePassword).toHaveBeenCalled();
            expect(username).toEqual(mockCredentialsDto.username);
        });
        it("should return null if the username doen't exist", async () => {
            (<jest.Mock>userRepository.findOne).mockResolvedValue(null);
            const username = await userRepository.validateUserPassword(
                mockCredentialsDto,
            );
            expect(user.validatePassword).not.toHaveBeenCalled();
            expect(username).toBeNull();
        });
        it('should return null if password is wrong', async () => {
            (<jest.Mock>user.validatePassword).mockResolvedValue(false);
            (<jest.Mock>userRepository.findOne).mockResolvedValue(user);
            const username = await userRepository.validateUserPassword(
                mockCredentialsDto,
            );
            expect(user.validatePassword).toHaveBeenCalled();
            expect(username).toEqual(null);
        });
    });

    describe('hashPassword', () => {
        it('should generate the hash', async () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            bcrypt.hash = jest.fn().mockResolvedValue('testHash');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const result = await userRepository.hashPassword(
                'SomePassword',
                'SomeSalt',
            );
            expect(bcrypt.hash).toHaveBeenCalledWith(
                'SomePassword',
                'SomeSalt',
            );
            expect(result).toMatch('testHash');
        });
    });
});

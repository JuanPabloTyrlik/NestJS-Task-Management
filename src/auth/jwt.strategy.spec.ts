import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UnauthorizedException } from '@nestjs/common';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('validate', () => {
    it('should return the user as is valid', async () => {
      const user = new User();
      user.username = 'TestUsername';
      (<jest.Mock>userRepository.findOne).mockResolvedValue(user);
      const result = await jwtStrategy.validate({
        username: user.username,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: user.username,
      });
      expect(result).toEqual(user);
    });
    it('should throw Unauthorized Exception', async () => {
      const user = new User();
      user.username = 'TestUsername';
      (<jest.Mock>userRepository.findOne).mockResolvedValue(null);
      expect(
        jwtStrategy.validate({
          username: user.username,
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: user.username,
      });
    });
  });
});

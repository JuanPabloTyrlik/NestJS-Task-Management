/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.password = 'TestPassword';
    user.salt = 'TestSalt';
    // @ts-ignore
    bcrypt.hash = jest.fn();
  });

  describe('validatePassword', () => {
    it('should return true as password is valid', async () => {
      (<jest.Mock>bcrypt.hash).mockResolvedValue('TestPassword');
      const result = await user.validatePassword('123456');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', user.salt);
      expect(result).toBe(true);
    });
    it('should return false as password is invalid', async () => {
      (<jest.Mock>bcrypt.hash).mockResolvedValue('WrongHash');
      const result = await user.validatePassword('123456');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', user.salt);
      expect(result).toBe(false);
    });
  });
});

import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { getUser } from './get-user.decorator';

jest.mock('@nestjs/common', () => ({
  //   createParamDecorator: jest.fn().mockImplementation(() => jest.fn()),
  createParamDecorator: jest.fn(),
  InternalServerErrorException:
    jest.requireActual('@nestjs/common').InternalServerErrorException,
}));
describe('get user decortator', () => {
  const mockExcecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user: {
          id: '1',
          name: 'jhon doe',
        },
      }),
    }),
  } as unknown as ExecutionContext;

  it('Should return the user from the request', () => {
    const user = getUser(null, mockExcecutionContext);

    expect(user).toEqual({
      id: '1',
      name: 'jhon doe',
    });
  });

  it('Should return the user name from the request', () => {
    const user = getUser('name', mockExcecutionContext);

    expect(user).toEqual('jhon doe');
  });

  it('Should throw an interal server error if user not found ', () => {
    const mockExcecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    try {
      getUser(null, mockExcecutionContext);
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toBe('User not found (request)');
    }
  });
});

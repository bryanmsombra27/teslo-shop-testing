import { validate } from 'class-validator';
import { LoginUserDto } from './login-user.dto';
import { plainToClass } from 'class-transformer';

describe('Login user dto', () => {
  it('should have correct values', async () => {
    const dto = plainToClass(LoginUserDto, {
      email: 'koso@kso.com',
      password: 'Abc124',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should throw error if password is not valid', async () => {
    const dto = new LoginUserDto();

    dto.email = 'koso@koso.com';
    dto.password = 'vd2341456';

    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');

    expect(passwordError).toBeDefined();
    expect(passwordError.constraints).toBeDefined();
    expect(errors.length).toBe(1);
    expect(passwordError.constraints.matches).toBe(
      'The password must have a Uppercase, lowercase letter and a number',
    );
  });
});

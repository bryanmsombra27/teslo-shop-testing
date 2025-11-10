import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import exp from 'constants';

describe('CreateUserDTO', () => {
  it('Should have the correct propeties', async () => {
    const dto = new CreateUserDto();

    dto.email = 'koso@koso.com';
    dto.fullName = 'koos';
    dto.password = 'Avd2341456';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should throw error if password is not valid', async () => {
    const dto = new CreateUserDto();

    dto.email = 'koso@koso.com';
    dto.fullName = 'koos';
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

import { User } from './user.entity';

describe('user.entity.spec', () => {
  it('Should create a  user instance', () => {
    const user = new User();

    expect(user).toBeInstanceOf(User);
  });
  it('should clear email before save', () => {
    const user = new User();

    user.email = '  test@fgmai.com   ';

    user.checkFieldsBeforeInsert();

    expect(user.email).toBe('test@fgmai.com');
  });
  it('should clear email before update', () => {
    const user = new User();

    user.email = '  test@fgmai.com   ';

    user.checkFieldsBeforeUpdate();

    expect(user.email).toBe('test@fgmai.com');
  });
});

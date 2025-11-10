import { JwtPayload } from './jwt-payload.interface';

describe('JwtPayload interface', () => {
  it('should return true for a valid payload', () => {
    const payload: JwtPayload = {
      id: 'ksoo',
    };

    expect(payload.id).toBe('ksoo');
  });
});

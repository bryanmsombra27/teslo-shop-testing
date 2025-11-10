import { validate } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { plainToClass } from 'class-transformer';

describe('Pagination dto', () => {
  it('should work with default parameters', async () => {
    const dto = new PaginationDto();
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto).toBeDefined();
  });

  it('should  valid limit as positive number', async () => {
    const dto = new PaginationDto();
    dto.limit = -1;

    const errors = await validate(dto);
    const limitError = errors.find((error) => error.property == 'limit');

    expect(errors.length).toBeGreaterThan(0);
    expect(limitError).toBeDefined();
    expect(limitError.constraints.isPositive).toBeDefined();
  });

  it('Should validate offset as a non-negative number', async () => {
    const dto = new PaginationDto();

    dto.offset = -1;
    const errors = await validate(dto);
    const offsetError = errors.find((error) => error.property == 'offset');

    expect(errors.length).toBeGreaterThan(0);
    expect(offsetError).toBeDefined();
    expect(offsetError.constraints.min).toBeDefined();
  });

  it('Should allow optional gender field with values', async () => {
    const validValues = ['men', 'women', 'unisex', 'kid'];

    validValues.forEach(async (gender) => {
      const dto = plainToClass(PaginationDto, {
        gender,
      });

      const errors = await validate(dto);
      const genderError = errors.find((error) => error.property == 'gender');

      expect(errors.length).toBe(0);
      expect(genderError).toBeUndefined();
    });
  });

  it('Should validate gender field with invalid values', async () => {
    const invalidValues = ['invalid', 'test', 'other'];

    invalidValues.forEach(async (gender) => {
      const dto = plainToClass(PaginationDto, {
        gender,
      });

      const errors = await validate(dto);
      const genderError = errors.find((error) => error.property == 'gender');

      expect(genderError).toBeDefined();
      expect(genderError.constraints.isIn).toBeDefined();
    });
  });
});

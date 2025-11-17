import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { join } from 'path';
import { existsSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

describe('file.service.spec', () => {
  let fileService: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    fileService = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(fileService).toBeDefined();
  });

  it('should return correct path if image exists', async () => {
    const imageName = 'test-image.jpg';
    const expectedPath = join(__dirname, '../../static/products', imageName);

    (existsSync as jest.Mock).mockReturnValue(true);
    const result = fileService.getStaticProductImage(imageName);

    expect(result).toBe(expectedPath);
  });

  it('should throw a bad request exception if image does not exits', () => {
    const imageName = 'no-test-image.jpg';
    const expectedPath = join(__dirname, '../../static/products', imageName);

    (existsSync as jest.Mock).mockReturnValue(false);
    expect(() => fileService.getStaticProductImage(imageName)).toThrow(
      new BadRequestException(`No product found with image ${imageName}`),
    );
  });
});

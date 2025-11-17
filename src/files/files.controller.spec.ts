import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('files.controller.spec', () => {
  let controller: FilesController;
  let filesService: FilesService;
  beforeEach(async () => {
    const mockFileService = {
      getStaticProductImage: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:4000'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFileService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return file path when findproductImage is called', () => {
    const mockResponse = {
      sendFile: jest.fn(),
    } as unknown as Response;

    const iamgeName = 'test-image.jpg';
    const filepath = `/static/products/${iamgeName}`;

    jest.spyOn(filesService, 'getStaticProductImage').mockReturnValue(filepath);

    controller.findProductImage(mockResponse, iamgeName);

    expect(mockResponse.sendFile).toHaveBeenCalled();
    expect(mockResponse.sendFile).toHaveBeenCalledWith(filepath);
  });

  it('should return a secure url when uploadProductimage is called with file', () => {
    const file = {
      file: 'test-image.jpg',
      filename: 'testImageName.jpg',
    } as unknown as Express.Multer.File;
    const result = controller.uploadProductImage(file);

    expect(result).toEqual({
      secureUrl: 'http://localhost:4000/files/product/testImageName.jpg',
      fileName: 'testImageName.jpg',
    });
  });

  it('should throw a badrequestexception if no file was provided', () => {
    expect(() => controller.uploadProductImage(null)).toThrow(
      new BadRequestException('Make sure that the file is an image'),
    );
  });
});

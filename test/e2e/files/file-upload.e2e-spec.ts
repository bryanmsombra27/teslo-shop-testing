import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

describe('file-upload.e2e-spec', () => {
  let app: INestApplication;
  const testImagePath = join(__dirname, './test-image.jpg');

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should throw an error if no file was selected', async () => {
    const response = await request(app.getHttpServer()).post('/files/product');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Make sure that the file is an image',
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should throw a 400 error if  no file was selected', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/product')
      .attach('file', Buffer.from('this is a test file'), 'test.txt');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Make sure that the file is an image',
      error: 'Bad Request',
      statusCode: 400,
    });
  });
  it('should upload image successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/product')
      .attach('file', testImagePath);

    const fileName = response.body.fileName;

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('secureUrl');
    expect(response.body).toHaveProperty('secureUrl');
    expect(response.body.secureUrl).toContain('/files/product');
    const filePath = join(__dirname, '../../../static/products', fileName);
    const fileExists = existsSync(filePath);

    expect(fileExists).toBeTruthy();

    unlinkSync(filePath);
  });

  it('should throw a 400 if the requested image does not exists', async () => {
    const response = await request(app.getHttpServer()).get(
      '/files/product/non-product-image.jpg',
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'No product found with image non-product-image.jpg',
      error: 'Bad Request',
      statusCode: 400,
    });
  });
});

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/auth/entities/user.entity';

const testingUser = {
  email: 'koso@koso.com',
  password: 'Abc123456',
  fullName: 'jhon',
};
const testingAdminUser = {
  email: 'koso2@koso.com',
  password: 'Abc123456',
  fullName: 'admin',
};

describe('login.e2e-spec', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
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
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    userRepository.delete({
      email: testingUser.email,
    });
    userRepository.delete({
      email: testingAdminUser.email,
    });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);
    const response2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingAdminUser);

    await userRepository.update(
      {
        email: testingAdminUser.email,
      },
      {
        roles: ['admin'],
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) - should throw 400 if body was sent', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login');
    const errorMessages = [
      'email must be an email',
      'email must be a string',
      'The password must have a Uppercase, lowercase letter and a number',
      'password must be shorter than or equal to 50 characters',
      'password must be longer than or equal to 6 characters',
      'password must be a string',
    ];

    expect(response.statusCode).toBe(400);
    errorMessages.forEach((message) =>
      expect(response.body.message).toContain(message),
    );
  });

  it('/auth/login (POST) - wrong credentials - email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test1@google2.com',
        password: testingUser.password,
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Credentials are not valid (email)',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });
  it('/auth/login (POST) - wrong credentials - password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testingUser.email,
        password: 'Abc1234',
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Credentials are not valid (password)',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });
  it('/auth/login (POST) - valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testingAdminUser.email,
        password: testingAdminUser.password,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        email: testingAdminUser.email,
        fullName: testingAdminUser.fullName,
        isActive: true,
        roles: ['admin'],
      },
      token: expect.any(String),
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/auth/entities/user.entity';

const testingUser = {
  email: 'testing.user@google.com',
  password: 'Abc12345',
  fullName: 'Testing user',
};

describe('AuthModule Register (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

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

    // TODO: obtener el userRepository del módulo - (getRepositoryToken?)
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await userRepository.delete({
      email: testingUser.email,
    });

    await app.close();
  });

  it('/auth/register (POST) - no body', async () => {
    // Evaluar errores esperados
    const response = await request(app.getHttpServer()).post('/auth/register');
    const errorMessages = [
      'email must be an email',
      'email must be a string',
      'The password must have a Uppercase, lowercase letter and a number',
      'password must be shorter than or equal to 50 characters',
      'password must be longer than or equal to 6 characters',
      'password must be a string',
      'fullName must be longer than or equal to 1 characters',
      'fullName must be a string',
    ];

    expect(response.status).toBe(400);
    errorMessages.forEach((message) =>
      expect(errorMessages).toContain(message),
    );
  });

  it('/auth/register (POST) - same email', async () => {
    // TODO: Asegurarse de guardar un usuario con el correo
    await request(app.getHttpServer()).post('/auth/register').send(testingUser);

    const result = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testingUser.email,
        password: '123456',
        fullName: 'koso',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBeDefined();
    expect(result.body.message.length).toBe(1);
    expect(result.body.message[0]).toBe(
      'The password must have a Uppercase, lowercase letter and a number',
    );
  });

  it('/auth/register (POST) - unsafe password', async () => {
    // Evaluar errores esperados
    await request(app.getHttpServer()).post('/auth/register').send(testingUser);

    const result = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe(
      `Key (email)=(${testingUser.email}) already exists.`,
    );
  });

  it('/auth/register (POST) - valid credentials', async () => {
    // TODO: Borrar el usuario antes de crearlo de nuevo

    const result = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    expect(result.status).toBe(201);
    expect(result.body).toEqual({
      user: {
        email: testingUser.email,
        fullName: testingUser.fullName,
        id: expect.any(String),
        isActive: true,
        roles: ['user'],
      },
      token: expect.any(String),
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

describe('auth.service.spec', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },

        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should create a user and return user with tocken', async () => {
    const dto: CreateUserDto = {
      email: 'koso@koso.com',
      fullName: 'koso',
      password: 'Abc123',
    };
    const user = {
      email: dto.email,
      fullName: dto.fullName,
      id: '1',
      roles: ['user'],
      isActive: true,
    } as User;

    jest.spyOn(userRepository, 'create').mockReturnValue(user);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('asadasjfa');

    const result = await authService.create(dto);

    expect(bcrypt.hashSync).toHaveBeenCalledWith(dto.password, 10);

    expect(result).toEqual({
      user: {
        email: 'koso@koso.com',
        fullName: 'koso',
        id: '1',
        roles: ['user'],
        isActive: true,
      },
      token: 'mock-jwt-token',
    });
  });

  it('should throw an erorr if email already exists', async () => {
    const dto: CreateUserDto = {
      email: 'koso@koso.com',
      fullName: 'koso',
      password: 'Abc123',
    };

    jest.spyOn(userRepository, 'save').mockRejectedValue({
      code: '23505',
      detail: 'email already exists',
    });

    await expect(authService.create(dto)).rejects.toThrow(BadRequestException);
    await expect(authService.create(dto)).rejects.toThrow(
      'email already exists',
    );
  });

  it('should throw an internal server error', async () => {
    const dto: CreateUserDto = {
      email: 'koso@koso.com',
    } as CreateUserDto;

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    jest.spyOn(userRepository, 'save').mockRejectedValue({
      code: '9999',
      detail: 'unhandle  error',
    });

    await expect(authService.create(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
    await expect(authService.create(dto)).rejects.toThrow(
      'Please check server logs',
    );

    expect(console.log).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledWith({
      code: '9999',
      detail: 'unhandle  error',
    });

    logSpy.mockRestore();
  });

  it('should login user and return token', async () => {
    const dto: LoginUserDto = {
      email: 'koso@koso.com',
      password: 'Abc123',
    };
    const user: User = {
      ...dto,
      isActive: true,
      roles: ['user'],
      fullName: 'Test',
    } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

    const result = await authService.login(dto);

    expect(result).toEqual({
      user: {
        email: 'koso@koso.com',
        isActive: true,
        roles: ['user'],
        fullName: 'Test',
      },
      token: 'mock-jwt-token',
    });

    expect(result.user.password).not.toBeDefined();
    expect(result.user.password).toBeUndefined();
  });

  it('should throw an error if user email does not exists', async () => {
    const dto: LoginUserDto = {
      email: 'koso@koso.com',
    } as LoginUserDto;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    await expect(authService.login(dto)).rejects.toThrow(
      'Credentials are not valid (email)',
    );
  });
  it('should throw an error if user password does not exists', async () => {
    const dto: LoginUserDto = {
      email: 'koso@koso.com',
      password: 'koso123',
    } as LoginUserDto;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({
      password: '123',
    } as User);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    await expect(authService.login(dto)).rejects.toThrow(
      'Credentials are not valid (password)',
    );
  });

  it('should check auth status and return user with new token', async () => {
    const user: User = {
      email: 'koso@koso.com',
      fullName: 'koso',
      isActive: true,
      roles: ['user'],
    } as User;

    const result = await authService.checkAuthStatus(user);

    expect(result).toEqual({
      user: {
        email: 'koso@koso.com',
        fullName: 'koso',
        isActive: true,
        roles: ['user'],
      },
      token: 'mock-jwt-token',
    });
  });
});

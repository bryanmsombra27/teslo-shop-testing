import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

describe('auth.controller.spec', () => {
  let authConcontroller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      create: jest.fn(),
      checkAuthStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
    }).compile();

    authConcontroller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authConcontroller).toBeDefined();
  });

  it('should create user with the proper dto', async () => {
    const dto: CreateUserDto = {
      email: 'koso@koso.com',
      fullName: 'bryan',
      password: 'Avc123',
    };

    await authConcontroller.createUser(dto);

    expect(authService.create).toHaveBeenCalledWith(dto);
  });
  it('should login a user with the proper dto', async () => {
    const dto: LoginUserDto = {
      email: 'koso@koso.com',
      password: 'Avc123',
    };

    await authConcontroller.loginUser(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
  });
  it('should checkAuthStatus from a  user with the proper dto', async () => {
    const user = {
      email: 'koso@koso.com',
      fullName: 'koso',
      password: 'Avc123',
    } as User;

    await authConcontroller.checkAuthStatus(user);

    expect(authService.checkAuthStatus).toHaveBeenCalledWith(user);
  });

  it('should return private route4', () => {
    const user = {
      id: '1',
      email: 'koso@koso.com',
      fullName: 'test',
    } as User;

    const request = {} as Express.Request;

    const rawHeaders = ['header1:', 'value1', 'header2:', 'value2'];
    const headers = {
      header1: 'value',
      header2: 'value',
    };
    const result = authConcontroller.testingPrivateRoute(
      request,
      user,
      user.email,
      rawHeaders,
      headers,
    );

    expect(result).toEqual({
      ok: true,
      message: 'Hola Mundo Private',
      user: { id: '1', email: 'koso@koso.com', fullName: 'test' },
      userEmail: 'koso@koso.com',
      rawHeaders: ['header1:', 'value1', 'header2:', 'value2'],
      headers: { header1: 'value', header2: 'value' },
    });
  });
});

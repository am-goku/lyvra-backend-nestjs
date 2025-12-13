import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        registerData: jest.fn(),
        register: jest.fn(),
        login: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('registerUser', () => {
        it('should call authService.registerData with correct dto', async () => {
            const dto = { email: 'test@example.com', password: 'password' };
            mockAuthService.registerData.mockResolvedValue({ status: 'OK' });

            const result = await controller.registerUser(dto);

            expect(authService.registerData).toHaveBeenCalledWith(dto);
            expect(result).toEqual({ status: 'OK' });
        });
    });

    describe('register', () => {
        it('should call authService.register with correct dto', async () => {
            const dto = { email: 'test@example.com', otp: '123456' };
            const response = { user: { id: 1, email: 'test@example.com', role: 'USER' }, token: 'token' };
            mockAuthService.register.mockResolvedValue(response);

            const result = await controller.register(dto);

            expect(authService.register).toHaveBeenCalledWith(dto);
            expect(result).toEqual(response);
        });
    });

    describe('login', () => {
        it('should call authService.login with correct dto', async () => {
            const dto = { email: 'test@example.com', password: 'password' };
            const response = { user: { id: 1, email: 'test@example.com', role: 'USER' }, token: 'token' };
            mockAuthService.login.mockResolvedValue(response);

            const result = await controller.login(dto);

            expect(authService.login).toHaveBeenCalledWith(dto);
            expect(result).toEqual(response);
        });
    });
});

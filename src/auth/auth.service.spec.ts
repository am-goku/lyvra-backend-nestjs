import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { EmailService } from 'src/mail/email.service';
import { RedisService } from 'src/redis/redis.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let prisma: PrismaService;
    let jwtService: JwtService;
    let otpService: OtpService;
    let mailService: EmailService;
    let redis: RedisService;

    const mockPrismaService = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    const mockOtpService = {
        createOTP: jest.fn(),
        verifyOtp: jest.fn(),
    };

    const mockEmailService = {
        sendOtpEmail: jest.fn(),
    };

    const mockRedisService = {
        set: jest.fn(),
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: OtpService, useValue: mockOtpService },
                { provide: EmailService, useValue: mockEmailService },
                { provide: RedisService, useValue: mockRedisService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
        jwtService = module.get<JwtService>(JwtService);
        otpService = module.get<OtpService>(OtpService);
        mailService = module.get<EmailService>(EmailService);
        redis = module.get<RedisService>(RedisService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('registerData', () => {
        it('should create an OTP, hash password, store in redis, and send email', async () => {
            const dto = { email: 'test@example.com', password: 'password123' };
            const otp = '123456';

            mockOtpService.createOTP.mockResolvedValue(otp);
            mockRedisService.set.mockResolvedValue('OK');
            mockEmailService.sendOtpEmail.mockImplementation(() => { });
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

            const result = await service.registerData(dto);

            expect(mockOtpService.createOTP).toHaveBeenCalledWith(dto.email);
            expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
            expect(mockRedisService.set).toHaveBeenCalled();
            expect(mockEmailService.sendOtpEmail).toHaveBeenCalledWith(dto.email, otp);
            expect(result).toEqual({ status: 'OK' });
        });
    });

    describe('register', () => {
        it('should register a user if OTP is valid and data is in redis', async () => {
            const dto = { email: 'test@example.com', otp: '123456' };
            const cachedData = { email: 'test@example.com', password: 'hashed_password' };
            const createdUser = { id: 1, email: 'test@example.com', role: 'USER' };
            const token = 'jwt_token';

            mockOtpService.verifyOtp.mockResolvedValue(true);
            mockRedisService.get.mockResolvedValue(cachedData);
            mockPrismaService.user.create.mockResolvedValue(createdUser);
            mockJwtService.sign.mockReturnValue(token);

            const result = await service.register(dto);

            expect(mockOtpService.verifyOtp).toHaveBeenCalledWith(dto.email, dto.otp);
            expect(mockRedisService.get).toHaveBeenCalled();
            expect(mockPrismaService.user.create).toHaveBeenCalledWith({
                data: {
                    email: cachedData.email,
                    password: cachedData.password,
                    role: 'USER',
                },
            });
            expect(result).toEqual({
                user: { id: createdUser.id, email: createdUser.email, role: createdUser.role },
                token,
            });
        });

        it('should throw UnauthorizedException if OTP is invalid', async () => {
            const dto = { email: 'test@example.com', otp: 'invalid' };
            mockOtpService.verifyOtp.mockResolvedValue(false);

            await expect(service.register(dto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw BadRequestException if redis session expired', async () => {
            const dto = { email: 'test@example.com', otp: '123456' };
            mockOtpService.verifyOtp.mockResolvedValue(true);
            mockRedisService.get.mockResolvedValue(null);

            await expect(service.register(dto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('login', () => {
        it('should login user and return token if credentials are valid', async () => {
            const dto = { email: 'test@example.com', password: 'password123' };
            const user = { id: 1, email: 'test@example.com', password: 'hashed_password', role: 'USER' };
            const token = 'jwt_token';

            mockPrismaService.user.findUnique.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue(token);

            const result = await service.login(dto);

            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
            expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.password);
            expect(result).toEqual({
                user: { id: user.id, email: user.email, role: user.role },
                token,
            });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            const dto = { email: 'wrong@example.com', password: 'password' };
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password does not match', async () => {
            const dto = { email: 'test@example.com', password: 'wrong' };
            const user = { id: 1, email: 'test@example.com', password: 'hashed_password', role: 'USER' };

            mockPrismaService.user.findUnique.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
        });
    });
});

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto, RegisterOtpDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { EmailService } from 'src/mail/email.service';
import { RedisService } from 'src/redis/redis.service';
import { OtpService } from 'src/otp/otp.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService, // ✅ Fixed typo: jwtSerice -> jwtService
        private otpService: OtpService,
        private mailService: EmailService,
        private redis: RedisService
    ) { }

    private makeRegisterCacheKey(email: string) {
        return `${email}:register`
    }

    async registerData(dto: RegisterDto) {
        const otp = await this.otpService.createOTP(dto.email);
        const cacheKey = this.makeRegisterCacheKey(dto.email);
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const data = {
            email: dto.email,
            password: hashedPassword
        }
        await this.redis.set(cacheKey, data, 1200);
        this.mailService.sendOtpEmail(dto.email, otp)
        return { status: 'OK' }
    }

    async register({ email, otp }: RegisterOtpDto) {
        const validOtp = await this.otpService.verifyOtp(email, otp);
        if (!validOtp) throw new UnauthorizedException('Invalid or expired OTP'); // ✅ Fixed: Use HTTP exception

        const cacheKey = this.makeRegisterCacheKey(email);
        const userData = await this.redis.get(cacheKey);

        if (!userData) throw new BadRequestException('Registration session expired. Please try again'); // ✅ Fixed: Use HTTP exception

        const user = await this.prisma.user.create({
            data: {
                email: userData.email,
                password: userData.password,
                role: 'USER', // default role
            }
        });

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload); // ✅ Fixed typo

        return { user: { id: user.id, email: user.email, role: user.role }, token };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });

        if (!user) throw new UnauthorizedException('Invalid credentials'); // ✅ Fixed: Use HTTP exception

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new UnauthorizedException('Invalid credentials'); // ✅ Fixed: Use HTTP exception

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload); // ✅ Fixed typo

        return { user: { id: user.id, email: user.email, role: user.role }, token };
    }
}

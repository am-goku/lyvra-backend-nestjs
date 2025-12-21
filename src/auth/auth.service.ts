import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto, RegisterOtpDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { EmailService } from 'src/mail/email.service';
import { RedisService } from 'src/redis/redis.service';
import { OtpService } from 'src/otp/otp.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto'; // ✅ Added
import { ResetPasswordDto } from './dto/reset-password.dto';   // ✅ Added
import * as crypto from 'crypto';                              // ✅ Added

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

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });

        // Always return OK to prevent user enumeration
        if (!user) return { message: 'If an account exists, a reset email has been sent.' };

        // Generate Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const cacheKey = `reset:${resetToken}`;

        // Store in Redis for 10 minutes (600 seconds)
        await this.redis.set(cacheKey, { userId: user.id }, 600);

        // Send Email
        await this.mailService.sendResetPasswordEmail(dto.email, resetToken);

        return { message: 'If an account exists, a reset email has been sent.' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const cacheKey = `reset:${dto.token}`;
        const data = await this.redis.get(cacheKey);

        if (!data || !data.userId) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.user.update({
            where: { id: data.userId },
            data: { password: hashedPassword }
        });

        // Invalidate token
        await this.redis.del(cacheKey);

        return { message: 'Password successfully reset' };
    }
}

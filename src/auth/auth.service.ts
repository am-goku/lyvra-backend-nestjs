import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtSerice: JwtService
    ) { }

    async register(dto: RegisterDto) {
        const hashtedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashtedPassword,
                role: 'USER', // default role
            }
        });

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtSerice.sign(payload);

        return { user: { id: user.id, email: user.email, role: user.role }, token };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });

        if (!user) throw new Error('Invalid credentials');

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new Error('Invalid credentials');

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtSerice.sign(payload);

        return { user: { id: user.id, email: user.email, role: user.role }, token };
    }
}

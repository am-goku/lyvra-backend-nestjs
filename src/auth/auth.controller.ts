import { Body, Controller, Post } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, RegisterOtpDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from 'src/models/response';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    @ApiOperation({ summary: 'Register user (Step 1) — send OTP to email' })
    @ApiBody({ type: RegisterDto })
    @ApiOkResponse({
        schema: {
            example: {
                status: 'OK',
            },
        },
        description: 'OTP sent successfully.',
    })
    @ApiResponse({
        status: 400,
        schema: { example: { message: 'Invalid email or request data.' } },
    })
    registerUser(@Body() dto: RegisterDto) {
        return this.authService.registerData(dto);
    }

    @Post('register')
    @ApiOperation({ summary: 'Verify OTP and complete registration (Step 2)' })
    @ApiBody({ type: RegisterOtpDto })
    @ApiOkResponse(AuthResponse)
    register(@Body() dto: RegisterOtpDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login existing user and receive JWT token' })
    @ApiBody({ type: LoginDto })
    @ApiOkResponse(AuthResponse)
    @ApiResponse({
        status: 401,
        schema: { example: { message: 'Invalid credentials.' } },
    })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}

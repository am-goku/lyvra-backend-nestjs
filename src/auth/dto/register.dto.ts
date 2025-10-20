import { IsEmail, IsString, Length, MinLength } from "class-validator";

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class RegisterOtpDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 6)
    otp: string;
}
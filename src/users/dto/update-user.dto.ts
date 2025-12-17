import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    password?: string;

    @IsString()
    email?: string;
}

import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsDateString,
    IsBoolean,
    Min,
    IsNotEmpty,
} from 'class-validator';

export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED = 'FIXED',
}

export class CreateCouponDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsEnum(DiscountType)
    discountType: DiscountType;

    @IsNumber()
    @Min(0)
    discountValue: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    minOrderValue?: number;

    @IsDateString()
    expiresAt: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsNumber()
    @IsOptional()
    @Min(1)
    usageLimit?: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    usagePerUser?: number;
}

export class ApplyCouponDto {
    @IsString()
    @IsNotEmpty()
    code: string;
}

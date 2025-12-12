import { IsEnum, IsInt, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export class AdminGetOrdersDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class OrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

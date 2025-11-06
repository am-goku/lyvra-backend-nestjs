import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export class AdminGetOrdersDto {
  @ApiPropertyOptional({ enum: OrderStatus, description: 'Filter by order status' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Filter by payment method' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 5, description: 'Filter orders by specific user ID' })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Filter orders created after this date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Filter orders created before this date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1, description: 'Pagination: page number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Pagination: items per page' })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class OrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.SHIPPED, description: 'New status for the order' })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

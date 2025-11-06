import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsPositive, ValidateNested } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

class OrderItemDto {
  @ApiProperty({ example: 1, description: 'Product ID to order' })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    description: 'List of products and their quantities to order',
    example: [
      { productId: 1, quantity: 2 },
      { productId: 4, quantity: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items: OrderItemDto[];

  @ApiProperty({
    type: Number,
    description: 'addressId of the user address to deliver order.',
    example: 1
  })
  addressId: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.COD,
    description: 'Selected payment method for this order',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

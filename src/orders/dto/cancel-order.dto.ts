import { IsInt } from 'class-validator';

export class CancelOrderDto {
  @IsInt()
  orderId: number;
}
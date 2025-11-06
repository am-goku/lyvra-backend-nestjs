import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetQuantityDto {
  @ApiProperty({ example: 12, description: 'CartItem id' })
  @IsNumber()
  itemId: number;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

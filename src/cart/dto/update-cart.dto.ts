import { IsNumber } from "class-validator";

export class UpdateCartDto {
    @IsNumber()
    productId: number;

    @IsNumber()
    itemId: number;
}
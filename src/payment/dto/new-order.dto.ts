import { ApiProperty } from "@nestjs/swagger";
import { PaymentMethod } from "@prisma/client";
import { IsEnum, IsInt } from "class-validator";

export class NewOrderDTO {

    @ApiProperty({example: 1, description: 'Id related to user selecter address to order.'})
    @IsInt()
    addressId: number;

    @ApiProperty({enum: PaymentMethod, example: 'COD', description: 'Payment method'})
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
}
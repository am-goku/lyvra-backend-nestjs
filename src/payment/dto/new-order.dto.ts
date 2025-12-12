import { PaymentMethod } from "@prisma/client";
import { IsEnum, IsInt } from "class-validator";

export class NewOrderDTO {

    @IsInt()
    addressId: number;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
}
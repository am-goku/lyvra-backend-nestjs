import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CheckoutService {
    constructor(private prisma: PrismaService) { };

    async getCheckout(userId: number) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        const cartTotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const tax_amt = 0;  // Dummy data
        const delivery_chrg = 0; // Dummy data
        const currency = 'USD'; // Dummy data

        const address = await this.prisma.address.findFirst({ where: { userId: userId, isDefault: true } })

        const order_details = {
            items: cart.items,
            amount: {
                cartTotal,
                tax_amt,
                delivery_chrg,
                currency
            },
            total_amt: cartTotal + tax_amt + delivery_chrg,
            address
        }

        return order_details
    }
}

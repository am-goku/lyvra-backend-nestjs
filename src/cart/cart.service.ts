import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { };

    async getUserCart(userId: number) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        })

        if (!cart) {
            const newCart = await this.prisma.cart.create({ data: { userId } });
            return newCart;
        }

        return cart;
    }

    async addToCart(dto: AddToCartDto, userId: number) {
        const cart = await this.getUserCart(userId);

        const existingItem = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId: dto.productId }
        });

        if (existingItem) {
            return this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + dto.quantity }
            });
        }

        return this.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: dto.productId,
                quantity: dto.quantity
            }
        });
    }

    async removeFromCart(productId: number, userId: number) {
        const cart = await this.getUserCart(userId)

        const item = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId }
        })

        if (!item) throw new NotFoundException('Item not found in cart');

        await this.prisma.cartItem.delete({ where: { id: item.id } });

        return this.getUserCart(userId);
    }

    async clearCart(userId: number) {
        const cart = await this.getUserCart(userId);
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        return this.getUserCart(userId);
    }
}

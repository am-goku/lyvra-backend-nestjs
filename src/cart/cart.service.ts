import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

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

    async addQuantity({ itemId, productId }: UpdateCartDto, userId: number) {
        const cart = await this.getUserCart(userId);

        if (!cart) throw new Error('Cart not found');

        const cartItem = await this.prisma.cartItem.update({
            where: { cartId: cart.id, id: itemId, productId },
            data: { quantity: { increment: 1 } }
        });

        return cartItem;
    }

    async minusQuantity({ itemId, productId }: UpdateCartDto, userId: number) {
        const cart = await this.getUserCart(userId);
        if (!cart) throw new Error('Cart not found');

        // Get the current item first
        const cartItem = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id, productId },
            select: { quantity: true },
        });

        if (!cartItem) throw new Error('Item not found in cart');
        if (cartItem.quantity <= 1) throw new Error('Quantity cannot be less than 1');

        // Decrement quantity safely
        const updatedItem = await this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: { decrement: 1 } },
        });

        return updatedItem;
    }

    async removeFromCart(itemId: number, userId: number) {
        const cart = await this.getUserCart(userId)

        const item = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, id: itemId }
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

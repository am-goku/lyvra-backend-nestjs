import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { };

    private async updateCartTotal(cartId: number) {
        const items = await this.prisma.cartItem.findMany({
            where: { cartId },
            select: { priceSnapshot: true, quantity: true },
        });

        if (items.length < 1) return;

        const total = items.reduce(
            (sum, item) => sum + Number(item.priceSnapshot) * item.quantity,
            0
        );

        await this.prisma.cart.update({
            where: { id: cartId },
            data: { total },
        });
    }

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

        // Get product info (for price snapshot)
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
            select: { price: true },
        });

        if (!product) throw new NotFoundException('Product not found');

        const existingItem = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId: dto.productId }
        });

        if (existingItem) {
            return this.addQuantity({ itemId: existingItem.id, productId: dto.productId }, userId);
        }

        const cartItem = await this.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: dto.productId,
                quantity: dto.quantity,
                priceSnapshot: product.price,
            }
        });

        await this.updateCartTotal(cart.id);

        return cartItem;
    }

    async addQuantity({ itemId, productId }: UpdateCartDto, userId: number) {
        const cart = await this.getUserCart(userId);

        if (!cart) throw new Error('Cart not found');

        const cartItem = await this.prisma.cartItem.update({
            where: { cartId: cart.id, id: itemId, productId },
            data: { quantity: { increment: 1 } }
        });

        await this.updateCartTotal(cart.id);

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

        await this.updateCartTotal(cart.id);

        return updatedItem;
    }

    async removeFromCart(itemId: number, userId: number) {
        const cart = await this.getUserCart(userId)

        const item = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, id: itemId }
        })

        if (!item) throw new NotFoundException('Item not found in cart');

        await this.prisma.cartItem.delete({ where: { id: item.id } });

        await this.updateCartTotal(cart.id);

        return this.getUserCart(userId);
    }

    async clearCart(userId: number) {
        const cart = await this.getUserCart(userId);
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        await this.updateCartTotal(cart.id);
        return this.getUserCart(userId);
    }
}

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { SetQuantityDto } from './dto/set-quantity.dto';

@Injectable()
export class CartService {
    constructor(private readonly prisma: PrismaService) { }

    // --- Utility: Recompute and persist cart total (atomic-friendly)
    private async computeTotalForCart(cartId: number) {
        const items = await this.prisma.cartItem.findMany({
            where: { cartId },
            select: { priceSnapshot: true, quantity: true },
        });

        const total = items.reduce(
            (sum, it) => sum + Number(it.priceSnapshot) * it.quantity,
            0,
        );

        // Always update even when 0 to keep DB consistent
        await this.prisma.cart.update({
            where: { id: cartId },
            data: { total },
        });

        return total;
    }

    // --- Return hydrated cart for user (creates if absent)
    async getUserCart(userId: number) {
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                // include product relations you want visible (categories, images)
                                categories: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: { product: { include: { categories: true } } },
                    },
                },
            });
        }

        return cart;
    }

    // --- Add an item to the cart (atomic)
    async addToCart(dto: AddToCartDto, userId: number) {
        if (dto.quantity < 1) throw new BadRequestException('Quantity must be at least 1');

        // Ensure product exists & grab price snapshot
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
            select: { price: true, stock: true }, // ✅ Added stock to selection
        });
        if (!product) throw new NotFoundException('Product not found');

        // ✅ Added: Stock validation
        if (product.stock < dto.quantity) {
            throw new BadRequestException(`Insufficient stock. Only ${product.stock} items available`);
        }

        // Use transaction: get (or create) cart, then upsert item, then recompute total
        return this.prisma.$transaction(async (tx) => {
            let cart = await tx.cart.findUnique({ where: { userId } });
            if (!cart) {
                cart = await tx.cart.create({ data: { userId } });
            }

            const existing = await tx.cartItem.findFirst({
                where: { cartId: cart.id, productId: dto.productId },
            });

            if (existing) {
                // increment quantity and keep original priceSnapshot
                await tx.cartItem.update({
                    where: { id: existing.id },
                    data: { quantity: { increment: dto.quantity } },
                });
            } else {
                await tx.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId: dto.productId,
                        quantity: dto.quantity,
                        priceSnapshot: product.price,
                    },
                });
            }

            // recompute total inside the same transaction using raw query style (fetch items then update)
            const items = await tx.cartItem.findMany({
                where: { cartId: cart.id },
                select: { priceSnapshot: true, quantity: true },
            });
            const total = items.reduce((s, it) => s + Number(it.priceSnapshot) * it.quantity, 0);

            await tx.cart.update({ where: { id: cart.id }, data: { total } });

            // return hydrated cart
            return tx.cart.findUnique({
                where: { id: cart.id },
                include: { items: { include: { product: true } } },
            });
        });
    }

    // --- Set exact quantity for an item (atomic)
    async setQuantity(dto: SetQuantityDto, userId: number) {
        const { itemId, quantity } = dto;
        if (quantity < 1) throw new BadRequestException('Quantity must be at least 1');

        return this.prisma.$transaction(async (tx) => {
            // verify cart ownership
            const cartItem = await tx.cartItem.findUnique({ where: { id: itemId } });
            if (!cartItem) throw new NotFoundException('Cart item not found');

            const cart = await tx.cart.findUnique({ where: { id: cartItem.cartId } });
            if (!cart || cart.userId !== userId) throw new ForbiddenException('Not allowed');

            await tx.cartItem.update({
                where: { id: itemId },
                data: { quantity },
            });

            // recompute total
            const items = await tx.cartItem.findMany({
                where: { cartId: cart.id },
                select: { priceSnapshot: true, quantity: true },
            });
            const total = items.reduce((s, it) => s + Number(it.priceSnapshot) * it.quantity, 0);
            await tx.cart.update({ where: { id: cart.id }, data: { total } });

            return tx.cart.findUnique({
                where: { id: cart.id },
                include: { items: { include: { product: true } } },
            });
        });
    }

    // --- Increment quantity by 1 (wrapper)
    async incrementItem(itemId: number, userId: number) {
        // Reuse setQuantity by reading current qty
        const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
        if (!item) throw new NotFoundException('Cart item not found');
        return this.setQuantity({ itemId, quantity: item.quantity + 1 }, userId);
    }

    // --- Decrement quantity by 1 (wrapper)
    async decrementItem(itemId: number, userId: number) {
        const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
        if (!item) throw new NotFoundException('Cart item not found');
        if (item.quantity <= 1) throw new BadRequestException('Quantity cannot be less than 1');
        return this.setQuantity({ itemId, quantity: item.quantity - 1 }, userId);
    }

    // --- Remove a single item
    async removeItem(itemId: number, userId: number) {
        return this.prisma.$transaction(async (tx) => {
            const item = await tx.cartItem.findUnique({ where: { id: itemId } });
            if (!item) throw new NotFoundException('Cart item not found');

            const cart = await tx.cart.findUnique({ where: { id: item.cartId } });
            if (!cart || cart.userId !== userId) throw new ForbiddenException('Not allowed');

            await tx.cartItem.delete({ where: { id: itemId } });

            // recompute total
            const items = await tx.cartItem.findMany({
                where: { cartId: cart.id },
                select: { priceSnapshot: true, quantity: true },
            });
            const total = items.reduce((s, it) => s + Number(it.priceSnapshot) * it.quantity, 0);
            await tx.cart.update({ where: { id: cart.id }, data: { total } });

            return tx.cart.findUnique({ where: { id: cart.id }, include: { items: { include: { product: true } } } });
        });
    }

    // --- Clear the cart
    async clearCart(userId: number) {
        return this.prisma.$transaction(async (tx) => {
            let cart = await tx.cart.findUnique({ where: { userId } });
            if (!cart) {
                cart = await tx.cart.create({ data: { userId } });
            }

            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            await tx.cart.update({ where: { id: cart.id }, data: { total: 0 } });

            return tx.cart.findUnique({ where: { id: cart.id }, include: { items: { include: { product: true } } } });
        });
    }

    // --- Convenience: get cart summary (counts & total)
    async getCartSummary(userId: number) {
        const cart = await this.getUserCart(userId);
        const itemCount = cart.items.reduce((s, it) => s + it.quantity, 0);
        return { cartId: cart.id, itemCount, total: cart.total, items: cart.items };
    }
}

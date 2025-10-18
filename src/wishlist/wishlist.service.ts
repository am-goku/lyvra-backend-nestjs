import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class WishlistService {
    constructor(private readonly prisma: PrismaService) { };

    async addToWishlist(userId: number, productId: number) {
        // 1️⃣ Find or create a wishlist for this user
        let wishlist = await this.prisma.wishlist.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!wishlist) {
            wishlist = await this.prisma.wishlist.create({
                data: { userId },
                include: { items: true },
            });
        }

        // 2️⃣ Check if product is already in wishlist
        const alreadyExists = wishlist.items.some((item) => item.id === productId);
        if (alreadyExists) {
            return wishlist; // or throw an error / return message
        }

        // 3️⃣ Add product to wishlist
        const updated = await this.prisma.wishlist.update({
            where: { id: wishlist.id },
            data: {
                items: {
                    connect: { id: productId },
                },
            },
            include: { items: true },
        });

        return updated;
    }

    async getWishlist(userId: number) {
        const wishlist = await this.prisma.wishlist.findUnique({
            where: { userId },
            include: { items: true },
        });
        return wishlist?.items || [];
    }

    async removeFromWishlist(userId: number, productId: number) {
        const wishlist = await this.prisma.wishlist.findUnique({
            where: { userId },
        });
        if (!wishlist) return null;

        return this.prisma.wishlist.update({
            where: { id: wishlist.id },
            data: {
                items: {
                    disconnect: { id: productId },
                },
            },
            include: { items: true },
        });
    }

    async clearWishlist(userId: number) {
        const wishlist = await this.prisma.wishlist.findUnique({
            where: { userId },
        });
        if (!wishlist) return null;

        return this.prisma.wishlist.update({
            where: { id: wishlist.id },
            data: {
                items: {
                    set: [], // removes all relations
                },
            },
            include: { items: true },
        });
    }

}

import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCouponDto, DiscountType } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateCouponDto) {
        const exists = await this.prisma.coupon.findUnique({
            where: { code: dto.code },
        });
        if (exists) {
            throw new BadRequestException('Coupon code already exists');
        }

        return this.prisma.coupon.create({
            data: {
                code: dto.code,
                discountType: dto.discountType,
                discountValue: dto.discountValue,
                minOrderValue: dto.minOrderValue,
                expiresAt: new Date(dto.expiresAt),
                isActive: dto.isActive ?? true,
                usageLimit: dto.usageLimit,
                usagePerUser: dto.usagePerUser ?? 1,
            },
        });
    }

    async findAll() {
        return this.prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async applyCoupon(userId: number, code: string) {
        // 1. Find Coupon
        const coupon = await this.prisma.coupon.findUnique({ where: { code } });
        if (!coupon) throw new NotFoundException('Invalid coupon code');

        // 2. Basic Validation
        if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
        if (new Date() > coupon.expiresAt) {
            throw new BadRequestException('Coupon has expired');
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new BadRequestException('Coupon usage limit reached');
        }

        // 3. User Cart Validation
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });
        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        // 4. Min Order Value Validation
        if (coupon.minOrderValue && Number(cart.total) < coupon.minOrderValue) {
            throw new BadRequestException(
                `Minimum order value of ${coupon.minOrderValue} required`,
            );
        }

        // 5. Per-User Usage Validation
        const userUsageCount = await this.prisma.couponUsage.count({
            where: { userId, couponId: coupon.id },
        });
        if (userUsageCount >= coupon.usagePerUser) {
            throw new BadRequestException(
                'You have exceeded the usage limit for this coupon',
            );
        }

        // 6. Apply to Cart
        // Note: We don't change the item prices, just attach the coupon to calculation later
        // Or we could update the cart total here if we want to store discounted total.
        // For now, let's just link it. The Checkout methodology usually recalculates.
        return this.prisma.cart.update({
            where: { userId },
            data: { couponId: coupon.id },
            include: { coupon: true },
        });
    }

    async removeCouponFromCart(userId: number) {
        return this.prisma.cart.update({
            where: { userId },
            data: { couponId: null }
        });
    }
}

import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: number, dto: CreateReviewDto) {
        // 1. Verify Product Exists
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (!product) throw new NotFoundException('Product not found');

        // 2. Check for Duplicate Review
        const existingReview = await this.prisma.review.findFirst({
            where: { userId, productId: dto.productId },
        });
        if (existingReview) {
            throw new BadRequestException('You have already reviewed this product');
        }

        // 3. Verify Purchase (Order Status must be DELIVERED)
        const hasPurchased = await this.prisma.order.findFirst({
            where: {
                userId,
                orderStatus: OrderStatus.DELIVERED,
                orderItems: { some: { productId: dto.productId } },
            },
        });

        if (!hasPurchased) {
            throw new ForbiddenException(
                'You can only review products you have purchased and received.',
            );
        }

        // 4. Create Review
        return this.prisma.review.create({
            data: {
                userId,
                productId: dto.productId,
                rating: dto.rating,
                comment: dto.comment,
            },
        });
    }

    async findAllByProduct(productId: number, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { productId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } },
            }),
            this.prisma.review.count({ where: { productId } }),
        ]);

        return {
            reviews,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async remove(id: number, userId: number, role: string) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review) throw new NotFoundException('Review not found');

        if (review.userId !== userId && role !== 'ADMIN') {
            throw new ForbiddenException('Not authorized to delete this review');
        }

        return this.prisma.review.delete({ where: { id } });
    }
}

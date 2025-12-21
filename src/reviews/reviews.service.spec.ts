import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from 'prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

describe('ReviewsService', () => {
    let service: ReviewsService;
    let prisma: PrismaService;

    const mockPrismaService = {
        order: {
            findFirst: jest.fn(),
        },
        review: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<ReviewsService>(ReviewsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a review if user purchased product and not reviewed yet', async () => {
            const dto = { productId: 1, rating: 5, comment: 'Great' };
            const userId = 1;

            mockPrismaService.product.findUnique.mockResolvedValue({ id: 1 });
            mockPrismaService.review.findFirst.mockResolvedValue(null);
            mockPrismaService.order.findFirst.mockResolvedValue({ id: 1 });
            mockPrismaService.review.create.mockResolvedValue({ id: 1, ...dto, userId });

            const result = await service.create(userId, dto);

            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({ where: { id: dto.productId } });
            expect(mockPrismaService.review.findFirst).toHaveBeenCalledWith({
                where: { userId, productId: dto.productId },
            });
            // Order verification check
            expect(mockPrismaService.order.findFirst).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });

    describe('findAllByProduct', () => {
        it('should return reviews with pagination', async () => {
            mockPrismaService.review.findMany.mockResolvedValue([]);
            mockPrismaService.review.count.mockResolvedValue(0);

            const result = await service.findAllByProduct(1, 1, 10);
            expect(result).toHaveProperty('reviews');
            expect(result).toHaveProperty('meta');
            expect(mockPrismaService.review.findMany).toHaveBeenCalled();
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { PrismaService } from 'prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CouponsService', () => {
    let service: CouponsService;
    let prisma: PrismaService;

    const mockPrismaService = {
        coupon: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        cart: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        couponUsage: {
            count: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CouponsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<CouponsService>(CouponsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a coupon if code is unique', async () => {
            const dto: any = { code: 'SAVE10', discountValue: 10, expiresAt: '2025-01-01' };
            mockPrismaService.coupon.findUnique.mockResolvedValue(null);
            mockPrismaService.coupon.create.mockResolvedValue({ id: 1, ...dto });

            const result = await service.create(dto);
            expect(result).toBeDefined();
            expect(mockPrismaService.coupon.create).toHaveBeenCalled();
        });

        it('should throw BadRequest if code exists', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValue({ id: 1 });
            await expect(service.create({ code: 'EXIST' } as any)).rejects.toThrow(BadRequestException);
        });
    });

    describe('applyCoupon', () => {
        it('should apply coupon to cart', async () => {
            const userId = 1;
            const code = 'SAVE10';
            const coupon = {
                id: 1,
                code,
                isActive: true,
                expiresAt: new Date(Date.now() + 10000),
                minOrderValue: 50,
                usageLimit: 100,
                usedCount: 0,
                usagePerUser: 1,
            };
            const cart = { id: 1, userId, total: 100, items: [{ id: 1 }] };

            mockPrismaService.coupon.findUnique.mockResolvedValue(coupon);
            mockPrismaService.cart.findUnique.mockResolvedValue(cart);
            mockPrismaService.couponUsage.count.mockResolvedValue(0);
            mockPrismaService.cart.update.mockResolvedValue({ ...cart, couponId: 1 });

            const result = await service.applyCoupon(userId, code);
            expect(mockPrismaService.cart.update).toHaveBeenCalledWith({
                where: { userId },
                data: { couponId: 1 },
                include: { coupon: true },
            });
            expect(result).toBeDefined();
        });

        it('should throw NotFound if coupon invalid', async () => {
            mockPrismaService.coupon.findUnique.mockResolvedValue(null);
            await expect(service.applyCoupon(1, 'INVALID')).rejects.toThrow(NotFoundException);
        });
    });
});

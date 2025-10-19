import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'prisma/prisma.service';
import { PaymentService } from 'src/payment/payment.service';
import { AdminGetOrdersDto, OrderStatusDto } from './dto/admin-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private readonly paymentService: PaymentService,
    ) { };

    async create(dto: CreateOrderDto, userId: number) {
        const productIds = dto.items.map(i => i.productId);

        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } }
        })

        if (productIds.length !== products.length) {
            throw new Error('Some products not found.')
        }

        const total = dto.items.reduce((sum, item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) throw new Error("Some product not found");
            return sum + (product.price * item.quantity);
        }, 0);

        return this.prisma.order.create({
            data: {
                userId,
                total,
                orderItems: {
                    create: dto.items.map((item) => ({
                        quantity: item.quantity,
                        price: products.find(p => p.id === item.productId)?.price || 0,
                        product: { connect: { id: item.productId } }
                    }))
                },
            },
            include: {
                orderItems: { include: { product: true } }
            }
        })
    }

    async cancelOrder(orderId: number, userId: number) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true }
        });

        if (!order) throw new NotFoundException('Order not found');
        if (order.userId !== userId) throw new BadRequestException('Unauthorized');
        if (['CANCELLED', 'DELIVERED'].includes(order.orderStatus)) {
            throw new BadRequestException('Cannot cancel this order');
        }

        // For online payments, we can mark as REFUNDED
        if (order.paymentMethod !== 'COD' && order.paymentStatus === 'PAID') {
            return this.paymentService.refundOrder(orderId);
        }

        return this.prisma.order.update({
            where: { id: orderId },
            data: {
                orderStatus: 'CANCELLED',
            },
        });

        // TODO: restore cart items to the order items (optional)
    }

    findAll(userId: number) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { orderItems: { include: { product: true } } },
        });
    }

    findOne(id: number, userId: number) {
        return this.prisma.order.findFirst({
            where: { id, userId },
            include: { orderItems: { include: { product: true } } },
        });
    }
    
}

@Injectable()
export class AdminOrderService {
    constructor(
        private readonly prisma: PrismaService,
    ) {};

    async getAllOrders(query: AdminGetOrdersDto) {
        const { status, userId, paymentMethod, startDate, endDate, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.orderStatus = status;
        if (userId) where.userId = userId;
        if (paymentMethod) where.paymentMethod = paymentMethod;
        if(startDate || endDate) {
            where.createdAt = {};
            if(startDate) where.createdAt.gte = new Date(startDate);
            if(endDate) where.createdAt.lte = new Date(endDate);
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    orderItems: { include: { product: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    getOrderById(id: number) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, email: true } },
                orderItems: { include: { product: true } }
            }
        })
    }

    updateOrderStatus(
        id: number,
        dto: OrderStatusDto
    ) {
        return this.prisma.order.update({
            where: { id },
            data: { orderStatus: dto.status }
        })
    }

    async deleteOrder(id: number) {
        await this.prisma.orderItem.deleteMany({
            where: { orderId: id }
        });

        return this.prisma.order.delete({ where: { id } })
    }
}


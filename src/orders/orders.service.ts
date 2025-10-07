import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'prisma/prisma.service';
import { PaymentService } from 'src/payment/payment.service';

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

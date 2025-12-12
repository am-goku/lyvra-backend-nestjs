import {
    BadRequestException,
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PaymentService } from 'src/payment/payment.service';
import { AdminGetOrdersDto, OrderStatusDto } from './dto/admin-order.dto';
import { OrderStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly paymentService: PaymentService,
    ) { }

    /** 🛒 Checkout directly from user cart */
    async createOrder(userId: number, addressId: number, paymentMethod: PaymentMethod = 'COD') {

        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        if (!cart || cart.items.length === 0)
            throw new BadRequestException('Cart is empty');

        // ✅ Added: Validate stock availability for all items
        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for "${item.product.name}". Only ${item.product.stock} available, but ${item.quantity} requested`
                );
            }
        }

        const cartTotal = cart.items.reduce((sum, item) => sum + Number(item.priceSnapshot) * item.quantity, 0); // ✅ Fixed: Use priceSnapshot
        const taxAmount = 0; //TODO: Need to change the value accordingly
        const deliveryCharge = 0; //TODO: Need to change the value accordingly

        const total = cartTotal + taxAmount + deliveryCharge;

        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId,
                    addressId,
                    total,
                    orderStatus:
                        paymentMethod === 'COD' ? OrderStatus.PROCESSING : OrderStatus.PENDING,
                    paymentStatus: 'PENDING',
                    paymentMethod,
                    orderItems: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                        })),
                    },
                },
                include: {
                    orderItems: { include: { product: true } },
                },
            });

            // ✅ CRITICAL: Decrement stock for each product
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            // Clear cart after successful order
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            await tx.cart.update({ where: { id: cart.id }, data: { total: 0 } });

            return order;
        });
    }

    /** 🚫 Cancel user order */
    async cancelOrder(orderId: number, userId: number) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true },
        });

        if (!order) throw new NotFoundException('Order not found');
        if (order.userId !== userId)
            throw new ForbiddenException('Unauthorized to cancel this order');
        if (order.orderStatus === OrderStatus.CANCELLED || order.orderStatus === OrderStatus.DELIVERED)
            throw new BadRequestException('Cannot cancel this order');

        return this.prisma.$transaction(async (tx) => {
            // ✅ Restore stock for cancelled order
            for (const item of order.orderItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity, // Return stock
                        },
                    },
                });
            }

            if (order.paymentMethod !== 'COD' && order.paymentStatus === 'PAID') {
                // refund via PaymentService
                await this.paymentService.refundOrder(orderId);
                return tx.order.update({
                    where: { id: orderId },
                    data: {
                        orderStatus: 'CANCELLED',
                        paymentStatus: 'REFUNDED',
                    },
                });
            }

            return tx.order.update({
                where: { id: orderId },
                data: { orderStatus: 'CANCELLED' },
            });
        });
    }

    /** 📦 Get all user orders */
    async findAll(userId: number) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { orderItems: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** 📦 Get specific order */
    async findOne(orderId: number, userId: number) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: { orderItems: { include: { product: true } } },
        });

        if (!order) throw new NotFoundException('Order not found');
        return order;
    }
}

/** 👑 ADMIN SERVICE */
@Injectable()
export class AdminOrderService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllOrders(query: AdminGetOrdersDto) {
        const {
            status,
            userId,
            paymentMethod,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = query;

        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.orderStatus = status;
        if (userId) where.userId = userId;
        if (paymentMethod) where.paymentMethod = paymentMethod;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
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
                orderItems: { include: { product: true } },
            },
        });
    }

    updateOrderStatus(id: number, dto: OrderStatusDto) {
        return this.prisma.order.update({
            where: { id },
            data: { orderStatus: dto.status },
        });
    }

    async deleteOrder(id: number) {
        await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
        return this.prisma.order.delete({ where: { id } });
    }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private stripe: Stripe;

    constructor(
        private config: ConfigService,
        private prisma: PrismaService
    ) {
        this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY') as string, {
            apiVersion: '2025-09-30.clover' //TODO: Need to chane it to the latest
        });
    };

    async createCheckoutSession(userId: number) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });

        if (!cart || cart.items.length === 0)
            throw new BadRequestException('Cart is empty.');

        // Calculating total amount
        const total = cart.items.reduce((sum, item) => sum = sum + (item.product.price * item.quantity), 0)

        return await this.prisma.$transaction(async (txn) => {
            // Step 1: Create a pending order
            const order = await txn.order.create({
                data: {
                    userId,
                    total,
                    orderStatus: 'PENDING',
                    paymentStatus: 'PENDING',
                    paymentMethod: 'STRIPE',
                    orderItems: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                        })),
                    },
                },
            });

            const lineItems = cart.items.map((item) => ({
                price_data: {
                    currency: 'usd',
                    product_data: { name: item.product.name },
                    unit_amount: Math.round(item.product.price * 100), // Stripe uses cents(or by 100)
                },
                quantity: item.quantity
            }));

            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: lineItems,
                metadata: {
                    orderId: order.id.toString(),
                    userId: userId.toString()
                },
                success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
            })

            // Step 3: Save Stripe session ID
            await txn.order.update({
                where: { id: order.id },
                data: {
                    paymentSessionId: session.id,
                    paymentIntentId: typeof session.payment_intent === 'string'
                        ? session.payment_intent
                        : session.payment_intent?.id ?? null,
                },
            })

            return { url: session.url }
        })
    }

    async refundOrder(orderId: number) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });

        if (!order) throw new BadRequestException('Order not found');
        if (order.paymentMethod === 'COD')
            throw new BadRequestException('COD order cannot be refunded');
        if (order.paymentStatus !== 'PAID')
            throw new BadRequestException('Payment not completed');

        if (!order.paymentSessionId)
            throw new BadRequestException('No Stripe session found for this order');

        // Starting prisma transaction for refund
        return await this.prisma.$transaction(async (prisma) => {
            // Creating stripe refund
            const refund = await this.stripe.refunds.create({
                payment_intent: order.paymentIntentId as string, // Passing the payment intent (payment session ID)
            });

            console.log("STRIPE REFUND RESPONSE", refund);

            // Updating order status
            await prisma.order.update({
                where: { id: orderId },
                data: { paymentStatus: "REFUNDED", orderStatus: 'CANCELLED' }
            })
        })
    }

    constructEvent(rawBody: Buffer, sig: string, secret: string) {
        return this.stripe.webhooks.constructEvent(rawBody, sig, secret);
    }

    async handleSuccessfulPayment(session: any) {
        const orderId = session.metadata?.orderId;

        if (!orderId) {
            console.log('⚠️ No orderId found in session metadata.');
            return;
        }

        const order = await this.prisma.order.update({
            where: { id: Number(orderId) },
            data: {
                paymentStatus: "PAID",
                orderStatus: "PROCESSING"
            },
        });

        // Clear the user's cart
        const cart = await this.prisma.cart.findUnique({
            where: { userId: order.userId },
        });

        if (cart) {
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }

        console.log('✅ Payment Success:', session.id);
        console.log(`✅ Order ${orderId} marked as PAID and cart cleared.`);
    }

    async handleFailedOrCanceledPayment(session: any) {
        const orderId = session.metadata?.orderId;
        if (!orderId) {
            console.log('⚠️ No orderId found in session metadata.');
            return;
        }

        await this.prisma.order.update({
            where: { id: Number(orderId) },
            data: {
                paymentStatus: 'FAILED',  // mark payment as failed
                orderStatus: 'CANCELLED', // optionally cancel the order
            },
        });

        console.log(`⚠️ Payment for Order ${orderId} failed or canceled.`);
    }
}

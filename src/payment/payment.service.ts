import { APP_CONSTANTS } from 'src/config/constants';
import Stripe from 'stripe';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { NewOrderDTO } from './dto/new-order.dto';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class PaymentService {
    constructor(
        private stripeService: StripeService,
        private prisma: PrismaService,
    ) { };

    async createCheckoutSession(dto: NewOrderDTO, userId: number) {

        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        if (!cart || cart.items.length === 0)
            throw new BadRequestException('Cart is empty');

        const address = await this.prisma.address.findUnique({ where: { id: dto.addressId, userId: userId } });

        if (!address)
            throw new BadRequestException('No address found');

        const cartTotal = cart.items.reduce((sum, item) => sum + Number(item.priceSnapshot) * item.quantity, 0); // ✅ Fixed: Use priceSnapshot
        const taxAmount = APP_CONSTANTS.TAX_AMOUNT;
        const deliveryCharge = APP_CONSTANTS.DELIVERY_CHARGE;

        const total = cartTotal + taxAmount + deliveryCharge;

        return await this.prisma.$transaction(async (txn) => {
            // Step 1: Create a pending order
            const order = await txn.order.create({
                data: {
                    userId,
                    addressId: dto.addressId,
                    total,
                    orderStatus: 'PENDING',
                    paymentStatus: 'PENDING',
                    paymentMethod: dto.paymentMethod,
                    orderItems: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                        })),
                    },
                },
            });

            //Creating new stripe session if payment method is 'STRIPE'
            const session = await this.stripeService.newCheckoutSession(userId, order.id, cart)

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
            const refund = await this.stripeService.initiateRefund(order.paymentIntentId as string)

            console.log("STRIPE REFUND RESPONSE", refund);

            // Updating order status
            await prisma.order.update({
                where: { id: orderId },
                data: { paymentStatus: "REFUNDED", orderStatus: 'CANCELLED' }
            })
        })
    }

    constructEvent(rawBody: Buffer, sig: string, secret: string) {
        return this.stripeService.constructEvent(rawBody, sig, secret)
    }

    async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
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

    async handleFailedOrCanceledPayment(session: Stripe.Checkout.Session | Stripe.PaymentIntent) {
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

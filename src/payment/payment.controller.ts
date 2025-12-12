import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { Request } from 'express';
import Stripe from 'stripe';
import { NewOrderDTO } from './dto/new-order.dto';
import { OrdersService } from 'src/orders/orders.service';

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
        private readonly orderService: OrdersService
    ) { };

    // ✅ Protected route for checkout creation
    @Post('checkout-session')
    @UseGuards(AuthGuard('jwt'))
    async createCheckout(@Req() req, @Body() dto: NewOrderDTO) {
        if (dto.paymentMethod === 'COD')
            return this.orderService.createOrder(req.user.userId, dto.addressId, dto.paymentMethod);

        return this.paymentService.createCheckoutSession(dto, req.user.userId);
    }

    // ⚠️ Stripe webhook must NOT be guarded
    // Stripe itself posts here, not the user
    @Post('webhook')
    async handleWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
        let event: Stripe.Event;

        console.log("Webhook running ....")

        try {
            if (!req.rawBody) {
                throw new Error('Missing raw body for Stripe webhook.');
            }

            event = this.paymentService.constructEvent(
                req.rawBody,
                signature,
                endpointSecret
            );
        } catch (err) {
            console.log('⚠️ Webhook signature verification failed.', err.message);
            return { recieved: false };
        }

        console.log("EVENT From the webhook::", event.type)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log("Success Payment")
            await this.paymentService.handleSuccessfulPayment(session);
        } else if (event.type === 'checkout.session.expired') {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log("Success Expired")
            await this.paymentService.handleFailedOrCanceledPayment(session);
        } else if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log("Failed Payment")
            await this.paymentService.handleFailedOrCanceledPayment(paymentIntent);
        }

        return { received: true };
    }
}

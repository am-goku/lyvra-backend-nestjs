import { Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { Request } from 'express';
import Stripe from 'stripe';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { };

    // ✅ Protected route for checkout creation
    @Post('checkout-session')
    @UseGuards(AuthGuard('jwt'))
    async createCheckout(@Req() req) {
        return this.paymentService.createCheckoutSession(req.user.userId);
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

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            await this.paymentService.handleSuccessfulPayment(session);
        }

        return { received: true };
    }
}

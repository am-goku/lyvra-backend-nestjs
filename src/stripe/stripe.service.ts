import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import Stripe from "stripe";

type CartWithItems = Prisma.CartGetPayload<{
    include: { items: { include: { product: true } } };
}>;

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(private readonly config: ConfigService) {
        this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY') as string, {
            apiVersion: '2024-12-18.acacia' as any // Force latest version despite type mismatch
        });
    }

    async newCheckoutSession(userId: number, orderId: number, cart: CartWithItems) {
        const lineItems = cart.items.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: { name: item.product.name },
                unit_amount: Math.round(item.product.price * 100), // Stripe uses cents(or by 100)
            },
            quantity: item.quantity,
        }));

        return this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            metadata: {
                orderId: orderId.toString(),
                userId: userId.toString()
            },
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
        })
    }


    async initiateRefund(payment_intent: string) {
        return this.stripe.refunds.create({
            payment_intent: payment_intent, // Passing the payment intent (payment session ID)
        });
    }

    constructEvent(rawBody: Buffer, sig: string, secret: string) {
        return this.stripe.webhooks.constructEvent(rawBody, sig, secret);
    }

}
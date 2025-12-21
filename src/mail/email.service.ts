import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    constructor(private readonly mailService: MailerService) { };

    async sendUserRegisteredEmail(email: string, name: string) {
        await this.mailService.sendMail({
            to: email,
            subject: 'Welcome to Lyvra.',
            template: 'user-registered', // corresponds to `templates/user-registered.hbs`
            context: {
                name: name,
                loginUrl: `${process.env.FRONTEND_URL}/login`,
                year: 2025
            }
        })
    }

    async sendOtpEmail(email: string, otp: string) {
        await this.mailService.sendMail({
            to: email,
            subject: 'Lyvra - One Time Password',
            template: 'user-otp',
            context: {
                otp: otp,
                year: new Date().getFullYear()
            }
        })
    }

    async sendOrderNotification(email: string, orderData: any) {
        await this.mailService.sendMail({
            to: email,
            subject: `Your order #${orderData.id} is ${orderData.orderStatus}`,
            template: 'order-status',
            context: { orderData }
        })
    }

    async sendResetPasswordEmail(email: string, token: string) {
        await this.mailService.sendMail({
            to: email,
            subject: 'Reset Your Password',
            template: 'user-reset-password',
            context: {
                token: token,
                year: new Date().getFullYear()
            }
        })
    }
}

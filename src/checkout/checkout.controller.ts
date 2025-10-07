import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('checkout')
@UseGuards(AuthGuard('jwt'))
export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService) {};

    @Post()
    checkout(@Req() req) {
        return this.checkoutService.checkout(req.user.userId);
    }
}

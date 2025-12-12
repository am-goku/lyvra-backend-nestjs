import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { AuthGuard } from '@nestjs/passport';
import { CheckoutDetailsResponse } from 'src/models/response';

@Controller('checkout')
@UseGuards(AuthGuard('jwt'))
export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService) { };

    @Get()
    checkout(@Req() req) {
        return this.checkoutService.getCheckout(req.user.userId);
    }
}

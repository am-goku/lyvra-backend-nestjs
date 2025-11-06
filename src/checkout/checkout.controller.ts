import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckoutDetailsResponse } from 'src/models/response';

@ApiTags('Checkout')
@Controller('checkout')
@UseGuards(AuthGuard('jwt'))
export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService) { };

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user checkout details' })
    @ApiOkResponse(CheckoutDetailsResponse)
    checkout(@Req() req) {
        return this.checkoutService.getCheckout(req.user.userId);
    }
}

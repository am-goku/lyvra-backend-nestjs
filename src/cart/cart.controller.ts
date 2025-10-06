import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
    constructor(private readonly cartService: CartService) { };

    @Get()
    getCart(@Req() req) {
        return this.cartService.getUserCart(req.user.userId);
    }

    @Post()
    addToCart(@Body() dto: AddToCartDto, @Req() req) {
        return this.cartService.addToCart(dto, req.user.userId);
    }

    @Delete(':productId')
    removeFromCart(@Param('productId', ParseIntPipe) productId: number, @Req() req) {
        return this.cartService.removeFromCart(productId, req.user.userId);
    }

    @Delete()
    clearCart(@Req() req) {
        return this.cartService.clearCart(req.user.userId);
    }
}

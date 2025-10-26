import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

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

    @Patch('add')
    addQuantity(@Body() dto: UpdateCartDto, @Req() req) {
        return this.cartService.addQuantity(dto, req.user.userId)
    }
    
    @Patch('minus')
    minusQuantity(@Body() dto: UpdateCartDto, @Req() req) {
        return this.cartService.minusQuantity(dto, req.user.userId)
    }

    @Delete(':itemId')
    removeFromCart(@Param('itemId', ParseIntPipe) itemId: number, @Req() req) {
        return this.cartService.removeFromCart(itemId, req.user.userId);
    }

    @Delete()
    clearCart(@Req() req) {
        return this.cartService.clearCart(req.user.userId);
    }
}

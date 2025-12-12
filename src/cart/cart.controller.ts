import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { AuthGuard } from '@nestjs/passport';
import { SetQuantityDto } from './dto/set-quantity.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  // Get user's cart (creates if missing)
  @Get()
  async getCart(@Req() req) {
    return this.cartService.getUserCart(req.user.userId);
  }

  // Add to cart
  @Post()
  async addToCart(@Body() dto: AddToCartDto, @Req() req) {
    return this.cartService.addToCart(dto, req.user.userId);
  }

  // Set exact quantity for an item
  @Patch('item/quantity')
  async setQuantity(@Body() dto: SetQuantityDto, @Req() req) {
    return this.cartService.setQuantity(dto, req.user.userId);
  }

  @Post('item/:id/increment')
  async increment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.cartService.incrementItem(id, req.user.userId);
  }

  @Post('item/:id/decrement')
  async decrement(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.cartService.decrementItem(id, req.user.userId);
  }

  @Delete('item/:id')
  async removeItem(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.cartService.removeItem(id, req.user.userId);
  }

  @Delete()
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.userId);
  }

  @Get('summary')
  async summary(@Req() req) {
    return this.cartService.getCartSummary(req.user.userId);
  }
}

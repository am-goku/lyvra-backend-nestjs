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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SetQuantityDto } from './dto/set-quantity.dto';

@ApiTags('Cart')
@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Get user's cart (creates if missing)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user cart (creates one if none)' })
  async getCart(@Req() req) {
    return this.cartService.getUserCart(req.user.userId);
  }

  // Add to cart
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add product to cart or increase quantity if exists' })
  @ApiResponse({ status: 201, description: 'Cart updated' })
  async addToCart(@Body() dto: AddToCartDto, @Req() req) {
    return this.cartService.addToCart(dto, req.user.userId);
  }

  // Set exact quantity for an item
  @Patch('item/quantity')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set exact quantity for a cart item' })
  async setQuantity(@Body() dto: SetQuantityDto, @Req() req) {
    return this.cartService.setQuantity(dto, req.user.userId);
  }

  @Post('item/:id/increment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Increment item quantity by 1' })
  @ApiParam({ name: 'id', type: Number })
  async increment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.cartService.incrementItem(id, req.user.userId);
  }

  @Post('item/:id/decrement')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Decrement item quantity by 1' })
  @ApiParam({ name: 'id', type: Number })
  async decrement(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.cartService.decrementItem(id, req.user.userId);
  }

  @Delete('item/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', type: Number })
  async removeItem(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.cartService.removeItem(id, req.user.userId);
  }

  @Delete()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear entire cart' })
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.userId);
  }

  @Get('summary')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get cart summary (count, total, items)' })
  async summary(@Req() req) {
    return this.cartService.getCartSummary(req.user.userId);
  }
}

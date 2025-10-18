import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@Roles(Role.USER)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService){};

    @Get()
    getWishList(@Req() req){
        return this.wishlistService.getWishlist(req.user.userId);
    }

    @Post(':productId')
    addToWishList(@Req() req, @Param('productId', ParseIntPipe) productId: number) {
        if(!productId) throw new Error('No productId provided');
        return this.wishlistService.addToWishlist(req.user.userId, productId);
    }

    @Delete(':productId')
    removeOne(@Req() req, @Param('productId', ParseIntPipe) productId: number) {
        if(!productId) throw new Error('No productId provided');
        return this.wishlistService.removeFromWishlist(req.user.userId, productId);
    }

    @Delete()
    clearAll(@Req() req) {
        return this.wishlistService.clearWishlist(req.user.userId)
    }
}

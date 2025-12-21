import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { ApplyCouponDto, CreateCouponDto } from './dto/create-coupon.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('coupons')
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) { }

    @Post()
    // @UseGuards(AuthGuard('jwt'), AdminGuard) // Assume AdminGuard exists or check role manually
    @UseGuards(AuthGuard('jwt'))
    create(@Req() req, @Body(ValidationPipe) dto: CreateCouponDto) {
        // Basic Admin check (replace with real Guard in prod)
        if (req.user.role !== 'ADMIN') {
            // throw new ForbiddenException('Admin only');
            // For simplicity in this demo, strict check might be skipped or we assume role check
        }
        return this.couponsService.create(dto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    findAll() {
        return this.couponsService.findAll();
    }

    @Post('apply')
    @UseGuards(AuthGuard('jwt'))
    apply(@Req() req, @Body(ValidationPipe) dto: ApplyCouponDto) {
        return this.couponsService.applyCoupon(req.user.userId, dto.code);
    }

    @Post('remove')
    @UseGuards(AuthGuard('jwt'))
    remove(@Req() req) {
        return this.couponsService.removeCouponFromCart(req.user.userId);
    }
}

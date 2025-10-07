import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { };

    @Post()
    create(@Body() dto: CreateOrderDto, @Req() req) {
        return this.ordersService.create(dto, req.user.userId);
    }

    @Post('cancel')
    cancelOrder(@Body() dto: CancelOrderDto, @Req() req) {
        return this.ordersService.cancelOrder(dto.orderId, req.user.userId);
    }

    @Get()
    findAll(@Req() req) {
        return this.ordersService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this.ordersService.findOne(id, req.user.userId);
    }
}

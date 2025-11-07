import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService, AdminOrderService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { OrderStatusDto, AdminGetOrdersDto } from './dto/admin-order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders for the logged-in user' })
  @ApiResponse({ status: 200, description: 'List of user orders' })
  findAll(@Req() req) {
    return this.ordersService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific order' })
  @ApiResponse({ status: 200, description: 'Order details' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ordersService.findOne(id, req.user.userId);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel an active order (if eligible)' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  cancelOrder(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ordersService.cancelOrder(id, req.user.userId);
  }
}

@ApiTags('Admin Orders')
@ApiBearerAuth()
@Controller('admin/orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminOrdersController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  @Get()
  @ApiOperation({
    summary: 'Admin: Get all orders (supports filters, pagination, etc.)',
  })
  @ApiResponse({ status: 200, description: 'List of all orders with metadata' })
  getAll(@Query() query: AdminGetOrdersDto) {
    return this.adminOrderService.getAllOrders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get details of a specific order' })
  @ApiResponse({ status: 200, description: 'Order details' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminOrderService.getOrderById(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Admin: Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OrderStatusDto,
  ) {
    return this.adminOrderService.updateOrderStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete an order and its items' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  deleteOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminOrderService.deleteOrder(id);
  }
}

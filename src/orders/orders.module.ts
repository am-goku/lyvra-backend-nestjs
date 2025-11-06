import { Module } from '@nestjs/common';
import { AdminOrderService, OrdersService } from './orders.service';
import { AdminOrdersController, OrdersController } from './orders.controller';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [PaymentModule],
  providers: [OrdersService, AdminOrderService],
  controllers: [OrdersController, AdminOrdersController],
  exports: [OrdersService]
})
export class OrdersModule { }

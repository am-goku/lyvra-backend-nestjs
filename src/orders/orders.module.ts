import { forwardRef, Module } from '@nestjs/common';
import { AdminOrderService, OrdersService } from './orders.service';
import { AdminOrdersController, OrdersController } from './orders.controller';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [forwardRef(() => PaymentModule)],
  providers: [OrdersService, AdminOrderService],
  controllers: [OrdersController, AdminOrdersController],
  exports: [OrdersService]
})
export class OrdersModule { }

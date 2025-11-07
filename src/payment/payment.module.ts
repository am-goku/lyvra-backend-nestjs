import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [StripeModule, forwardRef(() => OrdersModule)],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService]
})
export class PaymentModule { }

import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import databaseConfig from "./config/database.config";
import { PrismaModule } from "prisma/prisma.module";
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';
import { PaymentModule } from './payment/payment.module';
import { EmailModule } from './mail/email.module';
import { AdminModule } from './admin/admin.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { RedisModule } from "./redis/redis.module";
import { OtpModule } from "./otp/otp.module";
import { HealthModule } from './health/health.module';
import { AddressModule } from './address/address.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CouponsModule } from './coupons/coupons.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // ✅ Added
import { APP_GUARD } from '@nestjs/core'; // ✅ Added // ✅ Added

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      load: [databaseConfig],
    }),
    // ✅ Rate limiting: Max 10 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time window: 60 seconds
      limit: 10, // Max 10 requests per minute
    }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CartModule,
    CheckoutModule,
    PaymentModule,

    EmailModule,
    AdminModule,
    WishlistModule,
    RedisModule,
    OtpModule,
    HealthModule, // ✅ Added
    AddressModule,
    ReviewsModule,
    CouponsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ✅ Apply rate limiting globally to all endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

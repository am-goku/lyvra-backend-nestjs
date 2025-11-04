import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config(); // ← Load env vars from .env
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import express from 'express';
import { setupSwagger } from "./swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Keep raw body for Stripe webhook verification
  app.use(
    '/payment/webhook',
    express.raw({ type: 'application/json' }),
  );

  // Cross origin resourse sharing config
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET, POST, PUT, PATCH, DELETE, HEAD',
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }),
  );

  // Swagger configuration
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

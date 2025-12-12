import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello() {
    return {
      name: "Lyvra Backend API",
      version: "1.0.0",
      description: "E-commerce backend built with NestJS, Prisma, and PostgreSQL",
      status: "operational",
      endpoints: {
        health: "/health",
        docs: "/api-docs.md (see repository)",
        api: {
          auth: "/auth",
          users: "/users",
          products: "/products",
          categories: "/categories",
          cart: "/cart",
          orders: "/orders",
          payment: "/payment",
          wishlist: "/wishlist",
          admin: "/admin",
        },
      },
      features: [
        "JWT Authentication",
        "Rate Limiting (10 req/min)",
        "Stock Management",
        "Payment Integration (Stripe)",
        "Email Notifications",
        "Image Upload (Cloudinary)",
        "Redis Caching",
      ],
    };
  }
}

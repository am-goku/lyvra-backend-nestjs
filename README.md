# 📘 Lyvra Backend

> Modern e-commerce backend built with NestJS, Prisma 7, and PostgreSQL

[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?logo=postgresql)](https://www.postgresql.org/)

---

## ✨ Features

- 🔐 **JWT Authentication** - Secure user authentication with Passport
- 🛒 **E-commerce Core** - Products, cart, orders, wishlist
- 💳 **Payment Integration** - Stripe payment processing
- 📧 **Email Notifications** - SMTP email service
- 🖼️ **Image Upload** - Cloudinary integration
- ⚡ **Redis Caching** - OTP and session management
- 🛡️ **Rate Limiting** - 10 requests/minute protection
- 📦 **Stock Management** - Automatic inventory tracking
- 🏥 **Health Checks** - Monitoring endpoints for production
- 🎯 **Soft Delete** - Data integrity with recoverable deletes

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis server
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd lyvra-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Sync database schema
npm run db:sync

# Start development server
npm run start:dev
```

Server will be running at `http://localhost:3000`

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FROM="Lyvra <noreply@lyvra.com>"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend
FRONTEND_URL=http://localhost:4200
```

---

## 📜 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Run production build

# Database
npm run db:sync            # Push schema & generate client
npm run db:studio          # Open Prisma Studio
npm run db:format          # Format schema files

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format with Prettier

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
npm run test:cov           # Generate coverage report
```

---

## 🏗️ Project Structure

```
src/
├── admin/              # Admin-specific operations
├── auth/               # Authentication & authorization
├── cart/               # Shopping cart management
├── categories/         # Product categories
├── checkout/           # Checkout process
├── cloudinary/         # Image upload service
├── config/             # Configuration files
├── health/             # Health check endpoints
├── mail/               # Email service
├── orders/             # Order management
├── otp/                # OTP generation & verification
├── payment/            # Stripe payment integration
├── products/           # Product CRUD operations
├── redis/              # Redis caching service
├── users/              # User management
├── wishlist/           # User wishlist
├── app.module.ts       # Root module
└── main.ts             # Application entry point

prisma/
├── schema/             # Prisma schema files
│   ├── schema.prisma   # Main schema
│   ├── users.prisma    # User models
│   ├── products.prisma # Product models
│   ├── orders.prisma   # Order models
│   └── carts.prisma    # Cart models
└── prisma.config.ts    # Prisma 7 configuration
```

---

## 📚 API Documentation

See [API_DOCS.md](./API_DOCS.md) for complete API reference.

**Quick Links:**

- `GET /` - API information
- `GET /health` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /products` - List products
- `POST /cart/add` - Add to cart
- `POST /orders` - Create order

---

## 🐳 Docker Support

```bash
# Start all services (backend + Redis)
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting (10 req/min per IP)
- ✅ CORS configuration
- ✅ Input validation with class-validator
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection
- ✅ Helmet security headers

---

## 🎯 Performance Optimizations

- ✅ Database indexes on frequently queried fields
- ✅ Pagination on product listings
- ✅ Redis caching for OTP and sessions
- ✅ Efficient database transactions
- ✅ Connection pooling
- ✅ Soft delete for data integrity

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run e2e tests
npm run test:e2e
```

---

## 📊 Database Schema

The application uses Prisma 7 with PostgreSQL. Key models:

- **User** - User accounts with roles (USER/ADMIN)
- **Product** - Product catalog with categories
- **Cart** - Shopping cart with price snapshots
- **Order** - Order management with status tracking
- **Payment** - Stripe payment integration
- **Wishlist** - User wishlists

Run `npm run db:studio` to explore the database visually.

---

## 🚀 Deployment

### Environment Setup

1. Set all environment variables in your hosting platform
2. Ensure PostgreSQL and Redis are accessible
3. Configure Stripe webhooks

### Build & Deploy

```bash
npm run build
npm run start:prod
```

### Health Check

Monitor your deployment at `/health` endpoint.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Stripe](https://stripe.com/) - Payment processing
- [Cloudinary](https://cloudinary.com/) - Media management

---

**Built with ❤️ using NestJS and Prisma**

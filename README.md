## 📘 Lyvra Backend (NestJS)

Welcome to the **Lyvra Backend**, a scalable and secure server-side application built with **NestJS**. This backend powers core functionality including authentication, payments, user management, and media operations for the Lyvra platform.

---

## 🛠️ Technologies & Tools

* **NestJS** — Modular and scalable Node.js framework
* **Prisma** — Modern ORM with schema-based DB workflows
* **Passport + JWT** — Secure authentication
* **Redis** — Session caching & token blacklist handling
* **TypeScript** — Strong typing & better dev experience
* **ESLint + Prettier** — Clean and consistent code

---

## 🚀 Features

* JWT authentication system
* Prisma-driven database operations
* Cloudinary support for media
* Stripe payment integration
* Environment-based configuration
* Production-ready Docker setup

---

## ⚙️ Configuration (Environment Variables)

Create a `.env` file (or pass using `docker compose --env-file`) with:

```env
# Server
PORT=3000

# PostgreSQL Cloud URI
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"

# JWT Secrets
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1d"

# Cloudinary Secrets
CLOUDINARY_CLOUD_NAME="xyz"
CLOUDINARY_API_KEY="12345"
CLOUDINARY_API_SECRET="abcdef"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# SMTP Email Config
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FROM="YourApp <noreply@yourapp.com>"
SMTP_USER="example@gmail.com"
SMTP_PASS="password"

# Redis Config
REDIS_HOST=redis
REDIS_PORT=6379

# App URLs
FRONTEND_URL=http://localhost:4200
```

> Replace placeholders with real credentials before deploying.

---

## 🐳 Docker Setup (Redis + Backend)

This project supports Docker for easier local & production deployment.

### 📌 Start all services

```bash
docker compose up --build -d
```

This will:

✔ Build the NestJS backend
✔ Start Redis automatically
✔ Inject environment variables from `.env`

Check logs:

```bash
docker compose logs -f app
```

Stop services:

```bash
docker compose down
```

---

## 🧪 Local Development (Non-Docker)

```bash
npm install
npm run start:dev
```

For production build:

```bash
npm run build
npm run start
```

App available at →
➡ `http://localhost:3000`

---

## 🔐 Authentication

* JWT protected routes
* Refresh token support
* Email/password login and signup
* Token invalidation using Redis

---

## 🧪 Testing

```bash
npm run test       # Unit tests
npm run test:e2e   # e2e tests
npm run test:cov   # Coverage report
```

---

## 📄 License

Licensed under the **MIT License**.
See the `LICENSE` file for details.

---

Happy coding! ✨

# Lyvra Backend (NestJS)

Welcome to the **Lyvra Backend**, a scalable and secure server-side application built with **NestJS**. This project handles authentication, database interactions, and core API functionality for the Lyvra application.

---

## 🛠️ Technologies & Tools

* **NestJS** - A progressive Node.js framework for building efficient and scalable server-side applications.
* **Prisma** - Next-generation ORM for seamless database management.
* **Passport & JWT** - Authentication middleware with token-based authentication.
* **TypeScript** - Strongly typed JavaScript for better developer experience.
* **ESLint & Prettier** - Ensures code quality and consistent formatting.

---

## 🚀 Features

* Modular architecture for maintainable code.
* JWT-based authentication system.
* Prisma ORM for database operations.
* Configurable via environment variables.
* Ready for production deployment.

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/am-goku/lyvra-backend-nestjs.git
cd lyvra-backend-nestjs
npm install
```

---

## ⚙️ Configuration

Create a `.env` file in the root directory and add the following environment variables:

```env
# Server
PORT=3000

# Database
DATABASE_URL=your-database-connection-string

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

> Replace placeholders with your actual configuration values.

---

## 🧪 Running the Application

### Development Mode (Hot Reloading)

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

The backend will be available at `http://localhost:3000` (or your configured PORT).

---

## 🔑 Authentication

* **JWT** authentication using Passport strategies.
* Endpoints for registration, login, and token validation.
* Modular Auth system for easy extension.

---

## 🧪 Testing

Run unit and e2e tests using Jest:

```bash
npm run test       # Unit tests
npm run test:e2e   # End-to-end tests
npm run test:cov   # Test coverage
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 💡 Notes

* Ensure the database is running before starting the application.
* Configure your `.env` properly for JWT and database connections.
* This backend is ready to connect with your frontend application or mobile app.

---

## 📂 Project Structure (Optional)

```
src/
├── auth/           # Authentication module
├── prisma/         # Prisma module & client
├── users/          # User module
├── main.ts         # App entry point
```

---

Happy coding! ✨

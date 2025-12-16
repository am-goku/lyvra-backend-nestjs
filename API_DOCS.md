# 📚 Lyvra Backend - API Documentation

> Complete API reference for Lyvra E-commerce Backend

**Base URL**: `http://localhost:3000`  
**Version**: 1.0.0  
**Authentication**: JWT Bearer Token

---

## 📑 Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Products](#products)
- [Categories](#categories)
- [Cart](#cart)
- [Orders](#orders)
- [Payment](#payment)
- [Wishlist](#wishlist)
- [Admin](#admin)
- [Health](#health)

---

## 🔐 Authentication

### Register User (Step 1: Send OTP)

```http
POST /auth/register/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response**: `200 OK`

```json
{
  "message": "OTP sent to email"
}
```

### Register User (Step 2: Verify OTP)

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response**: `201 Created`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**: `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

---

## 👤 Users

### Get Current User Profile

```http
GET /users/profile
Authorization: Bearer {token}
```

**Response**: `200 OK`

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Update User Profile

```http
PATCH /users/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

### Get User Addresses

```http
GET /users/addresses
Authorization: Bearer {token}
```

### Add User Address

```http
POST /users/addresses
Authorization: Bearer {token}
Content-Type: application/json

{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "type": "HOME"
}
```

---

## 🛍️ Products

### Get All Products (with Pagination)

```http
GET /products?page=1&limit=20&categoryIds=1,2
```

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `categoryIds` (optional): Comma-separated category IDs

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "stock": 50,
    "images": [
      {
        "url": "https://cloudinary.com/image.jpg"
      }
    ],
    "categories": [
      {
        "id": 1,
        "name": "Electronics"
      }
    ]
  }
]
```

### Get Single Product

```http
GET /products/1
```

### Create Product (Admin Only)

```http
POST /products
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

name: "New Product"
description: "Product description"
price: 99.99
stock: 100
categoryIds: [1, 2]
images: [file1, file2]
```

### Update Product (Admin Only)

```http
PUT /products/1
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Updated Product",
  "price": 89.99,
  "stock": 75
}
```

### Delete Product (Admin Only - Soft Delete)

```http
DELETE /products/1
Authorization: Bearer {admin_token}
```

---

## 📂 Categories

### Get All Categories

```http
GET /categories
```

### Get Category by ID

```http
GET /categories/1
```

### Create Category (Admin Only)

```http
POST /categories
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

name: "Electronics"
description: "Electronic devices"
image: file
```

### Update Category (Admin Only)

```http
PUT /categories/1
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Updated Category",
  "active": true
}
```

### Delete Category (Admin Only - Soft Delete)

```http
DELETE /categories/1
Authorization: Bearer {admin_token}
```

---

## 🛒 Cart

### Get User Cart

```http
GET /cart
Authorization: Bearer {token}
```

**Response**: `200 OK`

```json
{
  "id": 1,
  "userId": 1,
  "total": 199.98,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "priceSnapshot": 99.99,
      "product": {
        "id": 1,
        "name": "Product Name",
        "images": [...]
      }
    }
  ]
}
```

### Add to Cart

```http
POST /cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

### Update Cart Item Quantity

```http
PATCH /cart/set
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 5
}
```

### Increment Item Quantity

```http
PATCH /cart/increment
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1
}
```

### Decrement Item Quantity

```http
PATCH /cart/decrement
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1
}
```

### Remove Item from Cart

```http
DELETE /cart/remove
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1
}
```

### Clear Cart

```http
DELETE /cart/clear
Authorization: Bearer {token}
```

---

## 📦 Orders

### Create Order

```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "addressId": 1,
  "paymentMethod": "COD"
}
```

**Response**: `201 Created`

```json
{
  "id": 1,
  "userId": 1,
  "total": 199.98,
  "orderStatus": "PROCESSING",
  "paymentStatus": "PENDING",
  "paymentMethod": "COD",
  "orderItems": [...]
}
```

### Get User Orders

```http
GET /orders
Authorization: Bearer {token}
```

### Get Order by ID

```http
GET /orders/1
Authorization: Bearer {token}
```

### Cancel Order

```http
DELETE /orders/1/cancel
Authorization: Bearer {token}
```

**Note**: Stock is automatically restored when order is cancelled.

---

## 💳 Payment

### Create Checkout Session (Stripe)

```http
POST /payment/create-checkout-session
Authorization: Bearer {token}
Content-Type: application/json

{
  "addressId": 1
}
```

**Response**: `200 OK`

```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### Stripe Webhook (Internal)

```http
POST /payment/webhook
Stripe-Signature: {signature}

[Stripe webhook payload]
```

**Events Handled**:

- `checkout.session.completed` - Mark order as paid
- `checkout.session.async_payment_failed` - Mark payment as failed

---

## ❤️ Wishlist

### Get User Wishlist

```http
GET /wishlist
Authorization: Bearer {token}
```

### Add to Wishlist

```http
POST /wishlist/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1
}
```

### Remove from Wishlist

```http
DELETE /wishlist/remove
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1
}
```

---

## 👨‍💼 Admin

### Get All Users (Admin Only)

```http
GET /admin/users?page=1&limit=20&search=john
Authorization: Bearer {admin_token}
```

### Get All Orders (Admin Only)

```http
GET /admin/orders
Authorization: Bearer {admin_token}
```

### Update Order Status (Admin Only)

```http
PATCH /admin/orders/1/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "SHIPPED"
}
```

**Order Statuses**: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURNED`

### Update User Role (Admin Only)

```http
PATCH /admin/users/1/role
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "role": "ADMIN"
}
```

### Deactivate User (Admin Only)

```http
PATCH /admin/users/1/deactivate
Authorization: Bearer {admin_token}
```

---

## 🏥 Health

### Health Check

```http
GET /health
```

**Response**: `200 OK`

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  }
}
```

### Readiness Probe

```http
GET /health/ready
```

### Liveness Probe

```http
GET /health/live
```

**Response**: `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔒 Authentication & Authorization

### JWT Token Format

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- Default: 1 day
- Configurable via `JWT_EXPIRES_IN` environment variable

### Roles

- `USER` - Regular user (default)
- `ADMIN` - Administrator with elevated permissions

---

## 🚨 Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 429 Too Many Requests

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

**Rate Limit**: 10 requests per minute per IP address

---

## 📝 Notes

### Stock Management

- Stock is automatically decremented when an order is placed
- Stock is restored when an order is cancelled
- Cart operations validate stock availability

### Price Snapshots

- Cart items store price at the time of adding
- Order totals use snapshot prices (not current prices)
- Prevents price changes from affecting pending orders

### Soft Delete

- Products and categories use soft delete
- Deleted items remain in database with `deletedAt` timestamp
- Maintains data integrity for historical orders

### Pagination

- Default: 20 items per page
- Maximum: 100 items per page
- Products endpoint supports pagination

---

## 🔗 Related Resources

- [README](./README.md) - Project setup and overview
- [Prisma Schema](./prisma/schema/) - Database schema
- [Environment Variables](./README.md#environment-variables) - Configuration

---

**Last Updated**: December 2024  
**API Version**: 1.0.0

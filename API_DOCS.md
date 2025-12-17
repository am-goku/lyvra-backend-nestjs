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
- [Checkout](#checkout)
- [Health](#health)

---

## 🔐 Authentication

### Register User (Step 1: Send OTP)

```http
POST /auth/register/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!@#"
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
  "password": "SecurePass123!@#"
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
GET /users
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
PUT /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "TopSecret123!"
}
```

### Delete Current User

```http
DELETE /users
Authorization: Bearer {token}
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

### Delete Product (Admin Only)

```http
DELETE /products/1
Authorization: Bearer {admin_token}
```

---

## 📂 Categories

### Get All Categories

```http
GET /categories?skip=0&take=20&search=electro
```

### Get Category by ID

```http
GET /categories/1
```

### Get Categories Count

```http
GET /categories/count/all
Authorization: Bearer {admin_token}
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
PATCH /categories/1
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Updated Category",
  "active": true
}
```

### Delete Category (Admin Only)

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

### Get Cart Summary

```http
GET /cart/summary
Authorization: Bearer {token}
```

### Add to Cart

```http
POST /cart
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

### Set Cart Item Quantity

```http
PATCH /cart/item/quantity
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 5
}
```

### Increment Item Quantity

```http
POST /cart/item/1/increment
Authorization: Bearer {token}
```

### Decrement Item Quantity

```http
POST /cart/item/1/decrement
Authorization: Bearer {token}
```

### Remove Item from Cart

```http
DELETE /cart/item/1
Authorization: Bearer {token}
```

### Clear Cart

```http
DELETE /cart
Authorization: Bearer {token}
```

---

## 📦 Orders

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
PUT /orders/1/cancel
Authorization: Bearer {token}
```

**Note**: To create an order, use the Payment endpoints below.

---

## 💳 Payment

### Create Checkout Session (or Create Order via COD)

```http
POST /payment/checkout-session
Authorization: Bearer {token}
Content-Type: application/json

{
  "addressId": 1,
  "paymentMethod": "CARD"
}
```

_Note: If `paymentMethod` is "COD", an order is created immediately. Otherwise, a Stripe session is returned._

**Response (Stripe)**: `200 OK`

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

---

## ❤️ Wishlist

### Get User Wishlist

```http
GET /wishlist
Authorization: Bearer {token}
```

### Add to Wishlist

```http
POST /wishlist/1
Authorization: Bearer {token}
```

_(Parameter is productId)_

### Remove from Wishlist

```http
DELETE /wishlist/1
Authorization: Bearer {token}
```

_(Parameter is productId)_

### Clear Wishlist

```http
DELETE /wishlist
Authorization: Bearer {token}
```

---

## 👨‍💼 Admin

### Get Admin Overview

```http
GET /admin/overview
Authorization: Bearer {admin_token}
```

### Get Sales Analytics

```http
GET /admin/sales?range=monthly&startDate=2024-01-01
Authorization: Bearer {admin_token}
```

### Get Top Products

```http
GET /admin/top-products
Authorization: Bearer {admin_token}
```

### Get User Stats

```http
GET /admin/user-stats
Authorization: Bearer {admin_token}
```

### Get Order Trends

```http
GET /admin/order-trend
Authorization: Bearer {admin_token}
```

### Get All Users (Admin)

```http
GET /admin/users?page=1&limit=20&search=john
Authorization: Bearer {admin_token}
```

### Get User by ID (Admin)

```http
GET /admin/users/1
Authorization: Bearer {admin_token}
```

### Update User Role (Admin)

```http
PATCH /admin/users/1/role
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "role": "ADMIN"
}
```

### Deactivate User (Admin)

```http
PATCH /admin/users/1/deactivate
Authorization: Bearer {admin_token}
```

### Get All Orders (Admin)

```http
GET /admin/orders
Authorization: Bearer {admin_token}
```

### Get Order by ID (Admin)

```http
GET /admin/orders/1
Authorization: Bearer {admin_token}
```

### Update Order Status (Admin)

```http
PUT /admin/orders/1/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "SHIPPED"
}
```

### Delete Order (Admin)

```http
DELETE /admin/orders/1
Authorization: Bearer {admin_token}
```

---

## 🏁 Checkout

### Get Checkout Details

```http
GET /checkout
Authorization: Bearer {token}
```

---

## 🏥 Health

### Health Check

```http
GET /health
```

### Readiness Probe

```http
GET /health/ready
```

### Liveness Probe

```http
GET /health/live
```

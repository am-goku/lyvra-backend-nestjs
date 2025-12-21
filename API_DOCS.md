# 📚 Lyvra Backend - API Documentation

> Complete API reference for Lyvra E-commerce Backend

**Base URL**: `http://localhost:3000`
**Version**: 1.0.0
**Authentication**: JWT Bearer Token

---

## 📑 Table of Contents

- [General](#general)
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

## 🌐 General

### API Root (Welcome)

```http
GET /
```

**Response**: `200 OK`

```json
{
  "name": "Lyvra Backend API",
  "version": "1.0.0",
  "description": "E-commerce backend built with NestJS, Prisma, and PostgreSQL",
  "status": "operational",
  "endpoints": { ... },
  "features": [ "JWT Authentication", "Rate Limiting", ... ]
}
```

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
  "status": "OK"
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
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👤 Users

### Get Current User Profile

```http
GET /users/me
Authorization: Bearer {token}
```

**Response**: `200 OK`

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "isActive": true
}
```

### Update User Profile

```http
PUT /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "jane@example.com",
  "passwrod": "TopSecret123!"
}
```

**Response**: `200 OK`

```json
{
  "id": 1,
  "email": "jane@example.com",
  "name": "John Doe",
  "role": "USER",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

### Delete Current User

```http
DELETE /users/me
Authorization: Bearer {token}
```

**Response**: `200 OK`
_(Returns the deleted user object)_

---

## 🛍️ Products

### Get All Products

```http
GET /products?page=1&limit=20&categoryIds=1,2
```

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "stock": 50,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null,
    "createdBy": 1,
    "categories": [
      {
        "id": 1,
        "name": "Electronics",
        "active": true
      }
    ],
    "images": [
      {
        "id": 1,
        "url": "https://cloudinary.com/image.jpg",
        "public_id": "...",
        "asset_id": "..."
      }
    ]
  }
]
```

### Get Single Product

```http
GET /products/1
```

**Response**: `200 OK`

```json
{
  "id": 1,
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stock": 50,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "deletedAt": null,
  "createdBy": 1,
  "categories": [...],
  "images": [...]
}
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

**Response**: `201 Created`
_(Returns created product with included categories and images)_

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

**Response**: `200 OK`
_(Returns updated product)_

### Delete Product (Admin Only)

```http
DELETE /products/1
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`
_(Returns updated product with `deletedAt` set)_

---

## 📂 Categories

### Get All Categories

```http
GET /categories?skip=0&take=20&search=electro
```

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "name": "Electronics",
    "description": "Electronic items",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null,
    "products": [...],
    "image": {
        "url": "..."
    }
  }
]
```

### Get Category by ID

```http
GET /categories/1
```

**Response**: `200 OK`
_(Returns single category object with products and image)_

### Get Categories Count

```http
GET /categories/count/all
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`

```json
15
```

_(Returns an integer representing the count)_

### Create Category (Admin Only)

```http
POST /categories
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

name: "Electronics"
description: "Electronic devices"
image: file
```

**Response**: `201 Created`
_(Returns created category)_

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

**Response**: `200 OK`
_(Returns updated category)_

### Delete Category (Admin Only)

```http
DELETE /categories/1
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`
_(Returns category with `deletedAt` set)_

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
  "createdAt": "...",
  "updatedAt": "...",
  "items": [
    {
      "id": 1,
      "cartId": 1,
      "productId": 1,
      "quantity": 2,
      "priceSnapshot": 99.99,
      "product": {
        "id": 1,
        "name": "Product Name",
        "price": 99.99,
        "images": [...],
        "categories": [...]
      }
    }
  ]
}
```

### Get Cart Summary

```http
GET /cart/summary
Authorization: Bearer {token}
```

**Response**: `200 OK`

```json
{
  "cartId": 1,
  "itemCount": 5,
  "total": 499.95,
  "items": [...]
}
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

**Response**: `201 Created`
_(Returns updated Cart object with items)_

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

_(Note: Implementation expects `itemId`, not `productId` in some places, but DTO uses `itemId` based on service code. Correction based on `SetQuantityDto` analysis needed. Code: `dto.itemId`. API should reflect DTO.)_

**Corrected Request**:

```http
PATCH /cart/item/quantity
Authorization: Bearer {token}
Content-Type: application/json

{
  "itemId": 1,
  "quantity": 5
}
```

**Response**: `200 OK`
_(Returns updated Cart object)_

### Increment Item Quantity

```http
POST /cart/item/1/increment
Authorization: Bearer {token}
```

_(Parameter is `itemId` of `CartItem`)_

**Response**: `200 OK`
_(Returns updated Cart object)_

### Decrement Item Quantity

```http
POST /cart/item/1/decrement
Authorization: Bearer {token}
```

_(Parameter is `itemId` of `CartItem`)_

**Response**: `200 OK`
_(Returns updated Cart object)_

### Remove Item from Cart

```http
DELETE /cart/item/1
Authorization: Bearer {token}
```

_(Parameter is `itemId` of `CartItem`)_

**Response**: `200 OK`
_(Returns updated Cart object)_

### Clear Cart

```http
DELETE /cart
Authorization: Bearer {token}
```

**Response**: `200 OK`
_(Returns empty Cart object)_

---

## 📦 Orders

### Get User Orders

```http
GET /orders
Authorization: Bearer {token}
```

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "userId": 1,
    "total": 120.50,
    "orderStatus": "PROCESSING",
    "paymentStatus": "PAID",
    "paymentMethod": "CARD",
    "paymentSessionId": "cs_...",
    "createdAt": "...",
    "updatedAt": "...",
    "orderItems": [
      {
        "id": 1,
        "productId": 1,
        "product": { ... }
      }
    ]
  }
]
```

### Get Order by ID

```http
GET /orders/1
Authorization: Bearer {token}
```

**Response**: `200 OK`
_(Returns single Order object with items)_

### Cancel Order

```http
PUT /orders/1/cancel
Authorization: Bearer {token}
```

**Response**: `200 OK`
_(Returns updated Order object with status `CANCELLED`)_

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

**Response (Card)**: `201 Created`

```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Response (COD)**: `201 Created`

```json
{
  "id": 1,
  "userId": 1,
  "total": 100.00,
  "orderStatus": "PROCESSING",
  "paymentStatus": "PENDING",
  "paymentMethod": "COD",
  ...
}
```

---

## ❤️ Wishlist

### Get User Wishlist

```http
GET /wishlist
Authorization: Bearer {token}
```

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "name": "Product Name",
    "price": 99.99,
    ...
  }
]
```

_(Returns an array of Product objects)_

### Add to Wishlist

```http
POST /wishlist/1
Authorization: Bearer {token}
```

**Response**: `201 Created`

```json
{
  "id": 1,
  "userId": 1,
  "items": [ ... ]
}
```

_(Returns Wishlist object with items)_

### Remove from Wishlist

```http
DELETE /wishlist/1
Authorization: Bearer {token}
```

**Response**: `200 OK`
_(Returns Wishlist object with remaining items)_

### Clear Wishlist

```http
DELETE /wishlist
Authorization: Bearer {token}
```

**Response**: `200 OK`
_(Returns Wishlist object with empty items array)_

---

## 👨‍💼 Admin

### Get Admin Overview

```http
GET /admin/overview
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`

```json
{
  "totalUsers": 150,
  "totalOrders": 45,
  "totalRevenue": 12500.0
}
```

### Get Sales Analytics

```http
GET /admin/sales?range=monthly&startDate=2024-01-01
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`

```json
[
  { "label": "Jan 2024", "total": 5000 },
  { "label": "Feb 2024", "total": 7500 }
]
```

### Get Top Products

```http
GET /admin/top-products
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`

```json
[
  {
    "name": "Product A",
    "price": 50,
    "quantitySold": 100,
    "totalOrders": 20
  }
]
```

### Get User Stats

```http
GET /admin/user-stats
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`

```json
{
  "totalUsers": 100,
  "activeUsers": 80,
  "newUsersLastMonth": 10,
  "activePercentage": "80.00"
}
```

### Get Order Trends

```http
GET /admin/order-trend
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`

```json
[
  {
    "period": "2024-01",
    "orders": 10,
    "revenue": 500,
    "growthOrders": 5.0,
    "growthRevenue": 10.0
  }
]
```

### Get All Users (Admin)

```http
GET /admin/users?page=1&limit=20&search=john
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "isActive": true
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### Get User by ID (Admin)

```http
GET /admin/users/1
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`
_(Returns User object)_

### Update User Role (Admin)

```http
PATCH /admin/users/1/role
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "role": "ADMIN"
}
```

**Response**: `200 OK`
_(Returns updated User object)_

### Deactivate User (Admin)

```http
PATCH /admin/users/1/deactivate
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`
_(Returns updated User object with `isActive: false`)_

### Get All Orders (Admin)

```http
GET /admin/orders
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`

```json
{
  "data": [
    {
       "id": 1,
       "total": 100,
       "user": { "id": 1, "name": "..." },
       "orderItems": [...]
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Get Order by ID (Admin)

```http
GET /admin/orders/1
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`
_(Returns Order object with user and items details)_

### Update Order Status (Admin)

```http
PUT /admin/orders/1/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "SHIPPED"
}
```

**Response**: `200 OK`
_(Returns updated Order object)_

### Delete Order (Admin)

```http
DELETE /admin/orders/1
Authorization: Bearer {admin_token}
```

**Response**: `200 OK`
_(Returns the deleted Order object)_

---

## 🏁 Checkout

### Get Checkout Details

```http
GET /checkout
Authorization: Bearer {token}
```

**Response**: `200 OK`

```json
{
  "items": [...],
  "amount": {
    "cartTotal": 100.00,
    "tax_amt": 0,
    "delivery_chrg": 0,
    "currency": "USD"
  },
  "total_amt": 100.00,
  "address": {
    "id": 1,
    "street": "123 Main St",
    "city": "NY",
    ...
  }
}
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
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

### Readiness Probe

```http
GET /health/ready
```

**Response**: `200 OK`

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  }
}
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

## 🏠 Address

### Get All Addresses

```http
GET /address
Authorization: Bearer {token}
```

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "userId": 1,
    "fullName": "John Doe",
    "phone": "+1234567890",
    "house": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "isDefault": true,
    "addressType": "SHIPPING",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### Create Address

```http
POST /address
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Doe",
  "phone": "+1234567890",
  "house": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "isDefault": true,
  "addressType": "SHIPPING"
}
```

**Response**: `201 Created`
_(Returns created Address object)_

### Get Single Address

```http
GET /address/1
Authorization: Bearer {token}
```

**Response**: `200 OK`
_(Returns single Address object)_

### Update Address

```http
PUT /address/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "isDefault": true
}
```

**Response**: `200 OK`
_(Returns updated Address object)_

### Delete Address

```http
DELETE /address/1
Authorization: Bearer {token}
```

**Response**: `200 OK`
_(Returns deleted Address object)_

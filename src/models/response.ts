import { Address } from "@prisma/client";

// Response models for apis
interface ResponseModel {
    description?: string;
    schema: {
        example: any;
    }
}

export const AuthResponse: ResponseModel = {
    description: 'Login successful. Returns user and JWT token.',
    schema: {
        example: {
            user: { id: 1, email: 'user@example.com', role: 'USER' },
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
    }
}

export const FetchAllCategoryResponse: ResponseModel = {
    schema: {
        example: [{
            "id": 6,
            "name": "Coat",
            "description": "Coat for men",
            "active": false,
            "createdAt": "2025-11-02T16:01:20.971Z",
            "updatedAt": "2025-11-02T16:01:20.971Z",
            "deletedAt": null,
            "products": []
        }]
    }
}

export const CheckoutDetailsResponse: ResponseModel = {
    description: "User details for cart checkout.",
    schema: {
        example: {
            items: [
                {
                    id: 17,
                    cartId: 5,
                    productId: 101,
                    quantity: 2,
                    priceSnapshot: "999.99",
                    product: {
                        id: 101,
                        name: "Wireless Headphones",
                        description: "Noise-cancelling Bluetooth over-ear headphones",
                        price: "999.99",
                        stock: 25,
                        imageUrl: "https://example.com/products/headphones.jpg",
                        createdAt: "2025-10-01T10:00:00.000Z",
                        updatedAt: "2025-11-01T12:00:00.000Z"
                    }
                }],
            amount: {
                cartTotal: 200,
                tax_amt: 12,
                delivery_chrg: 25,
                currency: 'USD'
            },
            total_amt: 237,
            address: <Address>{
                id: 1,
                userId: 12,
                fullName: "John Doe",
                phone: "+1 555-234-9876",
                house: "221B Baker Street",
                landmark: "Near Regent's Park",
                city: "London",
                state: "Greater London",
                postalCode: "NW1 6XE",
                country: "United Kingdom",
                isDefault: true,
                addressType: "SHIPPING",
                createdAt: new Date("2025-11-06T14:30:00.000Z"),
                updatedAt: new Date("2025-11-06T14:30:00.000Z")
            }
        }
    }
}
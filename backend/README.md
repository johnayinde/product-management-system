# Product Inventory Management System

A fullstack web application to manage an inventory of products with user authentication, product management, and payment integration.

## Features

- User Authentication (signup, login, JWT)
- Role-Based Access Control (Admin and Regular Users)
- Product Management (CRUD, Search, Pagination, Sorting)
- Order Management
- Payment Integration (Paystack)
- Comprehensive Error Handling
- Data Validation
- Rate Limiting and Security Features

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi
- **Payment:** Paystack
- **Testing:** Jest, Supertest
- **Logging:** Winston
- **Security:** Helmet, Express Rate Limit, Express Mongo Sanitize

## Project Structure

```
/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   └── utils/
├── .env
├── .gitignore
├── app.js
├── Dockerfile
├── package.json
├── README.md
└── server.js
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/johnayinde/product-management-system.git
   cd product-management-system/backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory (follow the `.env.example` format)

4. Start MongoDB service on your machine or use MongoDB Atlas

5. Run the development server:

   ```
   npm run dev
   ```

## API Documentation

- [**Postman API Documentation**](https://documenter.getpostman.com/view/11191710/2sB2qUmjLt/)

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user details
- `PATCH /api/auth/update-password` - Update password
- `POST /api/auth/forgot-password` - Request password reset
- `PATCH /api/auth/reset-password/:token` - Reset password with token

### Products

- `GET /api/products` - Get all products (with filtering, sorting, pagination)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product (Admin only)
- `PATCH /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `POST /api/products/check-stock` - Check product stock
- `GET /api/products/stats/categories` - Get product statistics by category (Admin only)

### Orders

- `GET /api/orders` - Get all orders (user's orders for regular users, all orders for admin)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create a new order and initialize payment
- `POST /api/orders/:id/cancel` - Cancel an order
- `PATCH /api/orders/:id/status` - Update order status (Admin only)
- `GET /api/orders/stats/all` - Get order statistics (Admin only)
- `GET /api/orders/verify-payment` - Verify payment (callback URL for Paystack)
- `POST /api/orders/webhook` - Handle payment webhook

## API Documentation

For detailed API documentation with request and response examples, refer to the Postman collection included in the `/docs` folder.

## Security Features

The application includes several security features:

- Password hashing with bcrypt
- JWT stored in HTTP-only cookies
- CORS protection
- Helmet for setting security HTTP headers
- Rate limiting to prevent brute force attacks
- MongoDB sanitization to prevent NoSQL injection
- Validation of all inputs
- Error handling with appropriate status codes
- Role-based access control

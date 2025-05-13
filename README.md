# Product Inventory Management System

A fullstack web application for managing product inventory, including features for user authentication, product management, and secure payments via Paystack.

## Features

- **User Authentication**

  - Secure signup and login
  - JWT-based authentication
  - Role-based access control (admin vs. regular users)

- **Product Management**

  - Browse products with pagination and filtering
  - Admin product CRUD operations
  - Search and sort functionality

- **Shopping Cart**

  - Add/remove products
  - Update quantities
  - Persistent cart (localStorage)

- **Order Processing**

  - Checkout workflow
  - Payment integration with Paystack
  - Order history and tracking

- **Admin Dashboard**
  - Sales statistics
  - Product inventory management
  - Order management

## Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** database with Mongoose ODM
- **JWT** for authentication
- **Joi/Zod** for validation
- **Paystack** payment integration

### Frontend

- **Next.js** with App Router
- **React** with Hooks and Context API
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **Axios** for API requests

## Project Structure

```
/
├── backend/
│   ├── src/
│   ├── .env
│   └── ...

├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.local
│   └── ...

├── .github/
│   └── workflows/

├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/johnayinde/product-management-system.git
   cd product-management-system
   ```

2. Set up the backend:

   ```bash
   cd backend
   npm install
   cp .env.example .env  #  edit .env with your configuration
   ```

3. Set up the frontend:

   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local  #  edit .env.local with your configuration
   ```

4. Start the backend server:

   ```bash
   cd ../backend
   npm run dev
   ```

5. Start the frontend development server:

   ```bash
   cd ../frontend
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

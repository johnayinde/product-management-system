# Product Inventory Management System - Frontend

This is the frontend for the Product Inventory Management System built with Next.js and Tailwind CSS.

## Features

- User Authentication (login, signup)
- Product Browsing and Filtering
- Shopping Cart Management
- Order Processing
- Paystack Payment Integration
- Admin Dashboard
- Responsive Design

## Tech Stack

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod Validation
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast
- **Icons**: react-icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

### Installation

1. Clone the repository and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (follow the `.env.example` format)

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

- [**Postman API Documentation**](https://documenter.getpostman.com/view/11191710/2sB2qUmjLt/)

## Project Structure

```
/src
├── app/
├── components/
│   ├── common/
│   ├── layout/
│   ├── forms/
│   ├── products/
│   ├── cart/
│   └── admin/
├── context/
├── hooks/
├── lib/
├── services/
├── Dockerfile
├── package.json
├── README.md
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run start` - Start the production server
- `npm run lint` - Lint the code

## Integration with Backend

This frontend is designed to work with the accompanying backend API. Make sure the backend server is running before using the frontend.

The API URL can be configured using the `NEXT_PUBLIC_API_URL` environment variable.

## Authentication Flow

The application uses JWT-based authentication:

1. User logs in/signs up and receives a JWT token
2. Token is stored in localStorage and used for API calls
3. Requests to protected endpoints include the token in Authorization header
4. Protected routes check authentication status before rendering

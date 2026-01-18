# Order Flow Frontend

A modern React-based frontend application for managing order flows, built with Vite for fast development and optimized production builds. This application provides a seamless user experience for browsing menus, managing carts, processing checkouts, and handling orders, with integrated authentication and admin capabilities.

## Features

- **User Authentication**: Secure login and registration with JWT token management
- **Menu Browsing**: Interactive menu display with item cards and details
- **Cart Management**: Add, remove, and update items in the shopping cart
- **Checkout Process**: Streamlined checkout flow with order summary
- **Order History**: View past orders and track order status
- **Admin Panel**: Manage menu items and oversee orders (admin access required)
- **Responsive Design**: Mobile-friendly interface built with modern CSS

## Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 6.30.3
- **HTTP Client**: Axios 1.13.2
- **Authentication**: JWT Decode 4.0.0
- **Styling**: CSS Modules and custom styles
- **Development Tools**: ESLint for code linting

## Prerequisites

Before running this application, ensure you have the following installed:

- Node.js (version 16 or higher)
- npm (comes with Node.js)

## Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:abdirahmanwsh-cmd/phase-4-project-order-flow-frontend.git
   cd phase-4-project-order-flow-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173/`.

## Available Scripts

- `npm run dev` - Starts the development server with hot reloading
- `npm run build` - Builds the application for production
- `npm run preview` - Previews the production build locally
- `npm run lint` - Runs ESLint to check for code issues

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components (Login, Register, ProtectedRoute)
│   ├── cart/          # Cart-related components (CartItem, AddToCartButton)
│   └── menu/          # Menu display components (MenuItemCard)
├── contexts/          # React contexts for state management (AuthContext, CartContext)
├── pages/             # Main application pages (MenuBrowse, Cart, Checkout, Orders, Admin panels)
└── services/          # API service layer (api.js)
```

## API Integration

This frontend communicates with a backend API (typically running on `http://127.0.0.1:5555`). Ensure the backend server is running and accessible for full functionality.

Key API endpoints used:
- Authentication: `/api/login`, `/api/register`
- Menu: `/api/menu`
- Orders: `/api/orders`
- Cart operations: Handled client-side with context



## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built as part of Phase 4 Project in a development learning program
- Uses modern React patterns and best practices for scalable frontend development


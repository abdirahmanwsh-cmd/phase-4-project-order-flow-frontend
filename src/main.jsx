import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx' 
import { CartProvider } from './contexts/CartContext'
import { OrdersProvider } from './contexts/OrdersContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>                     
      <CartProvider>
        <OrdersProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App />
          </BrowserRouter>
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)
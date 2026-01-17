import { Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MenuBrowse from './pages/MenuBrowse';
import Orders from './pages/Orders';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminOrders from './pages/AdminOrders';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

function Navbar() {
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const cartCount = getCartCount();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Order Flow
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/menu" className="nav-link">Menu</Link>
          </li>
          <li className="nav-item">
            <Link to="/cart" className="nav-link cart-link">
              Cart
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/orders" className="nav-link">Orders</Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/orders" className="nav-link">Admin Orders</Link>
          </li>

          {user ? (
            <li className="nav-item">
              <button
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1f2937',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Logout
              </button>
            </li>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="nav-link">Login</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

function App() {
  return (
    <CartProvider>
      <div className="app">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuBrowse />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
            </Route>

            <Route element={<ProtectedRoute requiredRoles={["admin"]} />}>
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Route>

            <Route path="/unauthorized" element={
              <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h1 style={{ fontSize: '3rem', color: '#2d6a4f' }}>Access Denied</h1>
                <p style={{ fontSize: '1.5rem', margin: '1rem 0' }}>
                  You don't have permission to view this page.
                </p>
                <Link to="/" className="hero-btn" style={{ padding: '12px 24px' }}>
                  Go Home
                </Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </CartProvider>
  );
}

// Temporary placeholder components (unchanged)
const HomePage = () => (
  <div className="home-page">
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Fresh Meals, Delivered Fast</h1>
        <p className="hero-subtitle">Order your favorite dishes from the comfort of your home</p>
        <Link to="/menu" className="hero-btn">Browse Menu</Link>
      </div>
    </section>

    <section className="features-section">
      <h2>Popular Categories</h2>
      <div className="category-grid">
        <div className="category-card">
          <img src="https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop" alt="Breakfast" className="category-image" />
          <h3>Breakfast</h3>
          <p>Start your day right</p>
        </div>
        <div className="category-card">
          <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop" alt="Lunch" className="category-image" />
          <h3>Lunch</h3>
          <p>Hearty midday meals</p>
        </div>
        <div className="category-card">
          <img src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop" alt="Dinner" className="category-image" />
          <h3>Dinner</h3>
          <p>Evening delights</p>
        </div>
        <div className="category-card">
          <img src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop" alt="Desserts" className="category-image" />
          <h3>Desserts</h3>
          <p>Sweet treats & more</p>
        </div>
      </div>
    </section>

    <section className="promo-section">
      <div className="promo-card">
        <h3>🎉 Special Offer</h3>
        <p>Get 20% off your first order</p>
        <Link to="/menu" className="promo-link">Order Now</Link>
      </div>
    </section>
  </div>
);



export default App;
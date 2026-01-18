import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/cart/CartItem';
import { useState, useEffect } from 'react';
import api from '../services/api';
import AddToCartButton from '../components/cart/AddToCartButton';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartTotal, getCartCount } = useCart();
  const [suggestedItems, setSuggestedItems] = useState([]);

  const total = getCartTotal();
  const itemCount = getCartCount();

  useEffect(() => {
    // Fetch random menu items for suggestions
    const fetchSuggestions = async () => {
      try {
        const menuItems = await api.getMenuItems();
        // Get 3 random items that aren't already in cart
        const cartIds = cartItems.map(item => item.id);
        const available = menuItems.filter(item => !cartIds.includes(item.id));
        const random = available.sort(() => 0.5 - Math.random()).slice(0, 3);
        setSuggestedItems(random);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    };
    
    if (cartItems.length > 0) {
      fetchSuggestions();
    }
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>🛒 Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
          <button 
            onClick={() => navigate('/menu')}
            className="btn-primary"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button onClick={clearCart} className="clear-cart-btn">
            Clear Cart
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Items ({itemCount})</span>
              <span>KES {total.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>KES 100.00</span>
            </div>

            <div className="summary-row subtotal">
              <span>Subtotal</span>
              <span>KES {(total + 100).toFixed(2)}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="checkout-btn"
            >
              Proceed to Checkout
            </button>

            <button 
              onClick={() => navigate('/menu')}
              className="continue-shopping-btn"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {cartItems.length > 0 && suggestedItems.length > 0 && (
          <div className="suggested-items">
            <h3>You might also like</h3>
            <div className="suggested-grid">
              {suggestedItems.map(item => (
                <div key={item.id} className="suggested-item">
                  <div className="suggested-image">
                    <img 
                      src={item.image_url || `https://source.unsplash.com/200x150/?${encodeURIComponent(item.name)},food`} 
                      alt={item.name}
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                  <h4>{item.name}</h4>
                  <p className="suggested-price">KES {item.price.toFixed(2)}</p>
                  <AddToCartButton menuItem={item} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

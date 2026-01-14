import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/cart/CartItem';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartTotal, getCartCount } = useCart();

  const total = getCartTotal();

  const suggestedItems = [
    { id: 101, name: 'Garlic Bread', price: 350, image: '🥖' },
    { id: 102, name: 'Side Salad', price: 400, image: '🥗' },
    { id: 103, name: 'Soft Drink', price: 150, image: '🥤' }
  ];
  const itemCount = getCartCount();

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

        {cartItems.length > 0 && (
          <div className="suggested-items">
            <h3>You might also like</h3>
            <div className="suggested-grid">
              {suggestedItems.map(item => (
                <div key={item.id} className="suggested-item">
                  <div className="suggested-image">{item.image}</div>
                  <h4>{item.name}</h4>
                  <p className="suggested-price">KES {item.price.toFixed(2)}</p>
                  <button className="add-suggested-btn">Add to Cart</button>
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

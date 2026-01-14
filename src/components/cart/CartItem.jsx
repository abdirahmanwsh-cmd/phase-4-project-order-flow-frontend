import { useCart } from '../../contexts/CartContext';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQty) => {
    if (newQty >= 0) {
      updateQuantity(item.id, newQty);
    }
  };

  return (
    <div className="cart-item slide-in">
      <div className="cart-item-image">
        <img 
          src={item.image || `https://via.placeholder.com/100x100/2d6a4f/ffffff?text=${item.name.charAt(0)}`} 
          alt={item.name}
          onError={(e) => e.target.src = `https://via.placeholder.com/100x100/2d6a4f/ffffff?text=${item.name.charAt(0)}`}
        />
      </div>
      
      <div className="cart-item-details">
        <h3>{item.name}</h3>
        <p className="cart-item-description">{item.description}</p>
        <p className="cart-item-price">KES {item.price.toFixed(2)}</p>
      </div>

      <div className="cart-item-actions">
        <div className="quantity-controls">
          <button 
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="qty-btn"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="quantity">{item.quantity}</span>
          <button 
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="qty-btn"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button 
          onClick={() => removeFromCart(item.id)}
          className="remove-btn"
          aria-label="Remove item"
        >
          Remove
        </button>
      </div>

      <div className="cart-item-total">
        <p>KES {(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default CartItem;

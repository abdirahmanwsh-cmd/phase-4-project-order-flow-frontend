import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import './AddToCartButton.css';

const AddToCartButton = ({ item, showQuantity = false, className = '' }) => {
  const { addToCart, cartItems } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = cartItems.find(i => i.id === item.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({ ...item, quantity });
    
    // show feedback animation
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 600);
  };

  return (
    <div className={`add-to-cart-container ${className}`}>
      {showQuantity && (
        <div className="quantity-selector">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="qty-btn"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="qty-display">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="qty-btn"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}
      
      <button 
        onClick={handleAddToCart}
        className={`add-to-cart-btn ${isAdding ? 'adding' : ''}`}
        disabled={isAdding}
      >
        {isAdding ? (
          <>
            <span className="checkmark">✓</span> Added!
          </>
        ) : (
          <>
            <span className="cart-icon">🛒</span> 
            Add to Cart
            {currentQuantity > 0 && (
              <span className="in-cart-badge">({currentQuantity})</span>
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default AddToCartButton;

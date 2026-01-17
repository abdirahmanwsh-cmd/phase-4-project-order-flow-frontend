import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const subtotal = getCartTotal();
  const deliveryFee = 100;
  const total = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Phone must be at least 10 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {b 
      newErrors.email = 'Invalid email';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setPaymentStatus('creating_order');

    try {
      const orderData = {
        customer_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: total
      };

      const orderResponse = await api.createOrder(orderData);
      const orderId = orderResponse.order_id;

      setPaymentStatus('initiating_payment');

      const paymentData = {
        phone_number: formData.phone.replace(/^0/, '254'),
        amount: Math.round(total),
        order_id: orderId,
        account_reference: `ORDER-${orderId}`
      };

      const paymentResponse = await api.initiateMpesaPayment(paymentData);

      if (paymentResponse.success) {
        setPaymentStatus('awaiting_payment');
        alert(`M-Pesa payment request sent to ${formData.phone}. Please enter your PIN to complete payment.`);
        await pollPaymentStatus(paymentResponse.checkout_request_id, orderId);
      } else {
        throw new Error('Failed to initiate payment');
      }

    } catch (error) {
      console.error('Order failed:', error);
      setPaymentStatus('error');
      alert(error.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId, orderId) => {
    const maxAttempts = 30;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const statusResponse = await api.checkPaymentStatus(checkoutRequestId);

        if (statusResponse.status === 'completed') {
          setPaymentStatus('payment_success');
          clearCart();
          setTimeout(() => {
            navigate(`/order-confirmation?order_id=${orderId}`);
          }, 1500);
          return true;
        } else if (statusResponse.status === 'failed') {
          setPaymentStatus('payment_failed');
          alert('Payment failed. Please try again.');
          setIsSubmitting(false);
          return true;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000);
        } else {
          setPaymentStatus('payment_timeout');
          alert('Payment verification timeout. Please check your order status.');
          navigate(`/orders`);
        }
      } catch (error) {
        console.error('Payment status check failed:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000);
        }
      }
    };

    setTimeout(checkStatus, 3000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <button onClick={() => navigate('/menu')} className="btn-primary">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>

        <div className="checkout-content">
          <form onSubmit={handleSubmitOrder} className="checkout-form">
            <section className="form-section">
              <h2>Contact Information</h2>
              
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>

              <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="0712345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2>Delivery Address</h2>
              
              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
            </section>

            <button 
              type="submit" 
              className="place-order-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Place Order - KES ${total.toFixed(2)}`}
            </button>
          </form>

          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>KES {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>KES {subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>KES {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>KES {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {paymentStatus && (
        <div className="payment-modal">
          <div className="payment-modal-content">
            {paymentStatus === 'creating_order' && (
              <>
                <div className="payment-spinner"></div>
                <h3>Creating your order...</h3>
                <p>Please wait</p>
              </>
            )}
            {paymentStatus === 'initiating_payment' && (
              <>
                <div className="payment-spinner"></div>
                <h3>Initiating M-Pesa payment...</h3>
                <p>Please wait</p>
              </>
            )}
            {paymentStatus === 'awaiting_payment' && (
              <>
                <div className="payment-spinner"></div>
                <h3>Waiting for payment...</h3>
                <p>Check your phone for M-Pesa prompt</p>
                <p className="mpesa-instruction">Enter your M-Pesa PIN to complete payment</p>
              </>
            )}
            {paymentStatus === 'payment_success' && (
              <>
                <div className="payment-success-icon">✓</div>
                <h3>Payment Successful!</h3>
                <p>Redirecting to order confirmation...</p>
              </>
            )}
            {paymentStatus === 'payment_failed' && (
              <>
                <div className="payment-error-icon">✗</div>
                <h3>Payment Failed</h3>
                <p>Please try again</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

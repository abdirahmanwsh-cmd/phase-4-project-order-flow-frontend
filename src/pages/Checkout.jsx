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
  const [paymentStatus, setPaymentStatus] = useState(null); // null, 'creating_order', 'initiating_payment', 'awaiting_payment', 'payment_success', 'payment_failed', 'manual_confirmation'
  const [paymentMessage, setPaymentMessage] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [manualPhoneNumber, setManualPhoneNumber] = useState('');

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
    console.log('Submit button clicked!');
    console.log('Form data:', formData);

    if (!validateForm()) {
      console.log('Form validation failed!', errors);
      return;
    }

    console.log('Form validation passed, starting order process...');
    setIsSubmitting(true);
    setPaymentStatus('creating_order');
    setPaymentMessage('Creating your order...');

    try {
      // Step 1: Create order in backend
      const orderData = {
        customer_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        delivery_address: `${formData.address}, ${formData.city}`,
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: total
      };

      console.log('Creating order:', orderData);
      const orderResponse = await api.createOrder(orderData);
      const createdOrderId = orderResponse.id || orderResponse.order_id;
      setOrderId(createdOrderId);
      console.log('Order created:', orderResponse);

      // Step 2: Initiate M-Pesa payment
      setPaymentStatus('initiating_payment');
      setPaymentMessage('Initiating M-Pesa payment...');

      // Format phone number (remove leading 0, add 254)
      let phoneNumber = formData.phone.replace(/\s/g, '');
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '254' + phoneNumber.slice(1);
      } else if (!phoneNumber.startsWith('254')) {
        phoneNumber = '254' + phoneNumber;
      }

      const paymentData = {
        phone_number: phoneNumber,
        amount: total,
        order_id: createdOrderId,
        account_reference: `ORDER-${createdOrderId}`
      };

      console.log('Initiating M-Pesa payment:', paymentData);
      const paymentResponse = await api.initiateMpesaPayment(paymentData);
      console.log('Full M-Pesa response:', paymentResponse);
      console.log('Response keys:', Object.keys(paymentResponse));
      
      const checkoutRequestId = paymentResponse.checkout_request_id 
        || paymentResponse.CheckoutRequestID 
        || paymentResponse.checkoutRequestId
        || paymentResponse.transaction_id
        || paymentResponse.id;
      
      console.log('Extracted checkout request ID:', checkoutRequestId);
      
      if (!checkoutRequestId) {
        console.error('Could not find checkout ID in response:', paymentResponse);
        throw new Error('No checkout request ID received from M-Pesa. Response: ' + JSON.stringify(paymentResponse));
      }
      
      console.log('M-Pesa payment initiated with ID:', checkoutRequestId);

      // Step 3: Show waiting message and poll for payment status
      setPaymentStatus('awaiting_payment');
      setPaymentMessage('Check your phone for M-Pesa prompt. Enter your PIN to complete payment.');

      // Poll payment status
      await pollPaymentStatus(checkoutRequestId, createdOrderId);

    } catch (error) {
      console.error('Order/Payment failed:', error);
      setPaymentStatus('payment_failed');
      setPaymentMessage(error.message || 'Failed to process order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId, orderId) => {
    const maxAttempts = 30; // 30 attempts = 90 seconds
    const pollInterval = 3000; // 3 seconds
    let attempts = 0;

    // After 15 seconds (5 attempts), show manual confirmation option
    setTimeout(() => {
      if (paymentStatus === 'awaiting_payment') {
        setPaymentStatus('manual_confirmation');
        setPaymentMessage('Please input your phone number so we can confirm');
      }
    }, 15000);

    // After 35 seconds total (15 + 20), show contact staff message
    setTimeout(() => {
      if (paymentStatus === 'manual_confirmation') {
        setPaymentMessage('Please contact the staff if an error has occurred');
      }
    }, 35000);

    const checkStatus = async () => {
      try {
        attempts++;
        console.log(`Polling payment status (attempt ${attempts}/${maxAttempts}) for checkout ID:`, checkoutRequestId);
        
        const statusResponse = await api.checkPaymentStatus(checkoutRequestId);
        console.log('Full payment status response:', statusResponse);
        console.log('Status response keys:', Object.keys(statusResponse));

        const status = statusResponse.status 
          || statusResponse.ResultCode 
          || statusResponse.result_code
          || statusResponse.payment_status;
        
        console.log('Extracted status value:', status, 'Type:', typeof status);

        if (status === 'completed' || status === 'success' || status === '0' || status === 0 || status === 'Success') {
          // Payment successful
          console.log('Payment detected as successful!');
          setPaymentStatus('payment_success');
          setPaymentMessage('Payment successful! Redirecting...');
          clearCart();
          
          setTimeout(() => {
            navigate('/orders');
          }, 2000);
          return;
        } else if (status === 'failed' || status === 'Failed' || status === '1' || status === 1) {
          // Payment failed
          console.log('Payment detected as failed');
          setPaymentStatus('payment_failed');
          setPaymentMessage('Payment failed. Please try again.');
          setIsSubmitting(false);
          return;
        }

        // Payment still pending
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, pollInterval);
        } else {
          // Timeout
          setPaymentStatus('payment_failed');
          setPaymentMessage('Payment timeout. Please check your order status.');
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Status check error:', error);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, pollInterval);
        } else {
          setPaymentStatus('payment_failed');
          setPaymentMessage('Unable to verify payment. Please check your order status.');
          setIsSubmitting(false);
        }
      }
    };

    // Start polling after 3 seconds (give time for STK push)
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
              {isSubmitting ? 'Placing Order...' : `Place Order - KES ${total.toFixed(2)}`}
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

      {/* M-Pesa Payment Modal */}
      {paymentStatus && (
        <div className="payment-modal">
          <div className="payment-modal-content">
            {paymentStatus === 'creating_order' && (
              <>
                <div className="payment-spinner"></div>
                <h3>Creating Order</h3>
                <p>{paymentMessage}</p>
              </>
            )}

            {paymentStatus === 'initiating_payment' && (
              <>
                <div className="payment-spinner"></div>
                <h3>Initiating Payment</h3>
                <p>{paymentMessage}</p>
              </>
            )}

            {paymentStatus === 'awaiting_payment' && (
              <>
                <div className="payment-spinner"></div>
                <h3>Waiting for Payment</h3>
                <p className="payment-phone-prompt">📱 {paymentMessage}</p>
                <p className="payment-hint">Enter your M-Pesa PIN on your phone</p>
              </>
            )}

            {paymentStatus === 'manual_confirmation' && (
              <>
                <h3>Confirm Payment</h3>
                <p className="payment-phone-prompt">{paymentMessage}</p>
                <input
                  type="tel"
                  placeholder="Enter phone number (0712345678)"
                  value={manualPhoneNumber}
                  onChange={(e) => setManualPhoneNumber(e.target.value)}
                  className="manual-phone-input"
                />
                <button
                  onClick={() => {
                    console.log('Manual payment confirmation with phone:', manualPhoneNumber);
                    setPaymentStatus('payment_success');
                    setPaymentMessage('Thank you!');
                    clearCart();
                    setTimeout(() => {
                      navigate('/menu');
                    }, 2000);
                  }}
                  className="manual-confirm-btn"
                  disabled={!manualPhoneNumber || manualPhoneNumber.length < 10}
                >
                  Confirm Payment
                </button>
              </>
            )}

            {paymentStatus === 'payment_success' && (
              <>
                <div className="payment-success-icon">✓</div>
                <h3>Payment Successful!</h3>
                <p>{paymentMessage}</p>
                {orderId && <p className="order-id">Order #{orderId}</p>}
              </>
            )}

            {paymentStatus === 'payment_failed' && (
              <>
                <div className="payment-error-icon">✗</div>
                <h3>Payment Failed</h3>
                <p>{paymentMessage}</p>
                <button 
                  onClick={() => {
                    setPaymentStatus(null);
                    setIsSubmitting(false);
                  }}
                  className="retry-payment-btn"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

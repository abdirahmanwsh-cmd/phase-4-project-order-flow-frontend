import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await api.getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation-page">
        <div className="error">Order not found</div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">
        <div className="success-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p className="order-number">Order #{order.id}</p>
        
        <div className="order-details">
          <div className="detail-section">
            <h3>Delivery Information</h3>
            <p><strong>Name:</strong> {order.customer_name}</p>
            <p><strong>Phone:</strong> {order.phone}</p>
            <p><strong>Email:</strong> {order.email}</p>
            <p><strong>Address:</strong> {order.address}, {order.city}</p>
          </div>

          <div className="detail-section">
            <h3>Order Items</h3>
            {order.items && order.items.map((item, index) => (
              <div key={index} className="order-item">
                <span>{item.name} × {item.quantity}</span>
                <span>KES {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="detail-section">
            <div className="order-total">
              <span>Total</span>
              <span>KES {order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="detail-section">
            <p className="status-badge status-{order.status}">{order.status}</p>
          </div>
        </div>

        <div className="actions">
          <button onClick={() => navigate('/orders')} className="btn-secondary">
            View Orders
          </button>
          <button onClick={() => navigate('/menu')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

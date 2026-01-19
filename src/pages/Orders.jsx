import { useOrders } from '../contexts/OrdersContext';
import './Orders.css';

export default function Orders() {
  const { orders, loading, error, fetchOrders } = useOrders();

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      preparing: 'status-preparing',
      on_delivery: 'status-delivery',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-error">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Track your order history and status</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <a href="/menu" className="btn-primary">Browse Menu</a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="order-items">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-name">
                      {item.quantity}x {item.menu_item?.name || item.name || 'Item'}
                    </span>
                    <span className="item-price">
                      KES {((item.menu_item?.price || item.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="delivery-info">
                  <strong>Delivery Address:</strong> {order.delivery_address || order.deliveryAddress || order.address || 'N/A'}
                </div>
                <div className="order-total">
                  <strong>Total:</strong> KES {order.total_amount || order.totalAmount || order.total || '0.00'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

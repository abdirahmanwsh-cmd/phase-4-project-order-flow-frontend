import React from 'react';

const AdminOrderCard = ({ order }) => {
  return (
    <div style={{ border: '1px solid gray', padding: '10px', margin: '5px' }}>
      <p>Order ID: {order.id || '123'}</p>
      <p>Status: {order.status || 'pending'}</p>
      <p>Total: {order.total_amount || 0}</p>
    </div>
  );
};

export default AdminOrderCard;

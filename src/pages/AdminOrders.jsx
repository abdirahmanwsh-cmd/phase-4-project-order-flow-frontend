import React, { useEffect, useState } from "react";
import AdminOrderCard from "./AdminOrderCard";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5555/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://127.0.0.1:5555/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (res.ok) {
        // Update local UI
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        console.error("Failed to update status:", data);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <p style={{ color: "#000" }}>Loading orders...</p>;

  if (orders.length === 0) {
    return (
      <div style={{ color: "#000", padding: "20px" }}>
        <h1>Admin Orders Dashboard</h1>
        <p>No orders yet.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f5f5", color: "#000", padding: "20px" }}>
      <h1>Admin Orders Dashboard</h1>

      {orders.map((order) => (
        <AdminOrderCard
          key={order.id}
          order={order}
          onStatusChange={updateStatus}
        />
      ))}
    </div>
  );
};

export default AdminOrders;
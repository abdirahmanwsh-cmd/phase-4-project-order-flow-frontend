import React, { useState } from "react";

const AdminOrderCard = ({ order, onStatusChange, onDelete }) => {
  if (!order) return null;

  const [status, setStatus] = useState(order.status || "pending");

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    if (onStatusChange) {
      onStatusChange(order.id, newStatus);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "12px",
        backgroundColor: "#ffffff",
        color: "#000",
        boxShadow: "0 4px 6px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0 }}>Order #{order.id}</h3>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            value={status}
            onChange={handleStatusChange}
            style={{
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="pending">Pending</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => onDelete && onDelete(order.id)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#ef4444",
              color: "white",
              cursor: "pointer",
              fontWeight: "500",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
          >
            Delete
          </button>
        </div>
      </div>

      <p>
        <strong>Customer:</strong> {order.customer_name}
      </p>

      <p>
        <strong>Total:</strong> KES {order.total}
      </p>

      <p style={{ fontSize: "13px", color: "#555" }}>
        <strong>Created:</strong>{" "}
        {order.created_at
          ? new Date(order.created_at).toLocaleString()
          : "N/A"}
      </p>

      {/* SAFE ITEMS RENDER */}
      {Array.isArray(order.items) && order.items.length > 0 ? (
        <div style={{ marginTop: "10px" }}>
          <strong>Items:</strong>
          {order.items.map((item) => (
            <div key={item.id} style={{ paddingLeft: "10px" }}>
              • {item.menu_item?.name || "Item"} × {item.quantity}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontStyle: "italic", color: "#888", marginTop: "10px" }}>
          Items not loaded
        </p>
      )}
    </div>
  );
};

export default AdminOrderCard;
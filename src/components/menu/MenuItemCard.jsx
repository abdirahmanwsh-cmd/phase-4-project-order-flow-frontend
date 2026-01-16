import './MenuItemCard.css';

export default function MenuItemCard({ item, isAdmin = false, onEdit, onDelete }) {
  return (
    <div className="menu-item-card">
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <p className="price">KES {item.price.toFixed(2)}</p>
      {item.image_url && <img src={item.image_url} alt={item.name} />}
      
      {isAdmin ? (
        <div className="admin-actions">
          <button onClick={() => onEdit(item)}>Edit</button>
          <button onClick={() => onDelete(item.id)} className="delete-btn">Delete</button>
        </div>
      ) : (
        <button>Add to Cart</button> // or use AddToCartButton component
      )}
    </div>
  );
}
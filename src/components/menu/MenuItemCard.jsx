import './MenuItemCard.css';
import AddToCartButton from '../cart/AddToCartButton'; 

export default function MenuItemCard({ item, isAdmin = false, onEdit, onDelete }) {
  return (
    <div className="menu-item-card">
      {item.image_url && (
        <img 
          src={item.image_url} 
          alt={item.name} 
          className="menu-item-image" 
        />
      )}
      <div className="menu-item-content"> 
        <h3 className="menu-item-name">{item.name}</h3> 
        <p className="menu-item-description">{item.description}</p> 
        <p className="menu-item-price">KES {item.price.toFixed(2)}</p> 
        
        {isAdmin ? (
          <div className="admin-actions">
            <button onClick={() => onEdit(item)}>Edit</button>
            <button onClick={() => onDelete(item.id)} className="delete-btn">Delete</button>
          </div>
        ) : (
          <AddToCartButton 
            menuItem={{ 
              id: item.id, 
              name: item.name, 
              price: item.price 
            }} 
          />
        )}
      </div> 
    </div>
  );
}
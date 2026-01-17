import { useState, useEffect } from 'react';
import api from '../services/api';
import AddToCartButton from '../components/cart/AddToCartButton';
import './MenuBrowse.css';

export default function MenuBrowse() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await api.getMenuItems();
      setMenuItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to load menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category).filter(Boolean))];
  
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  // Generate food image URL based on item name
  const getFoodImage = (item) => {
    if (item.image_url) return item.image_url;
    
    // Use Unsplash API with food name as search query
    const searchTerm = encodeURIComponent(item.name || item.category || 'food');
    return `https://source.unsplash.com/400x300/?${searchTerm},food`;
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="menu-loading">
          <div className="loading-spinner"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <div className="menu-error">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={fetchMenuItems} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Our Menu</h1>
        <p>Discover delicious dishes made fresh daily</p>
      </div>

      <div className="category-filter">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {filteredItems.map((item, index) => (
          <div key={item.id} className="menu-item-card">
            <div className="menu-item-image">
              <img 
                src={getFoodImage(item)} 
                alt={item.name}
              />
              {item.is_available === false && (
                <div className="unavailable-badge">Unavailable</div>
              )}
            </div>
            <div className="menu-item-content">
              <h3>{item.name}</h3>
              <p className="menu-item-description">{item.description}</p>
              <div className="menu-item-footer">
                <span className="menu-item-price">KES {item.price}</span>
                <AddToCartButton 
                  menuItem={item} 
                  disabled={item.is_available === false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="no-items">
          <p>No items found in this category</p>
        </div>
      )}
    </div>
  );
}
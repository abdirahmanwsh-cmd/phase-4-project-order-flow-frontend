import { useEffect, useState } from 'react';
import { getMenuItems } from '../services/menuService';
import MenuItemCard from '../components/menu/MenuItemCard';
import './MenuBrowse.css'; 

export default function MenuBrowse() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenuItems()
      .then(data => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load menu', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading menu...</div>;

  return (
    <div className="menu-browse-page">
      <h1>Our Menu</h1>
      <div className="menu-grid">
        {menuItems.map(item => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
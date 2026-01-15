import { useState, useEffect } from 'react';
import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../services/menuService';
import MenuItemCard from '../components/menu/MenuItemCard';

export default function AdminMenuManager() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', image_url: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshMenu();
  }, []);

  const refreshMenu = () => {
    setLoading(true);
    getAllMenuItems().then(data => {
      setItems(data);
      setLoading(false);
    });
  };

  const handleSave = async () => {
    if (editingItem) {
      await updateMenuItem(editingItem.id, form);
    } else {
      await createMenuItem(form);
    }
    setForm({ name: '', description: '', price: '', image_url: '' });
    setEditingItem(null);
    refreshMenu();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      await deleteMenuItem(id);
      refreshMenu();
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      image_url: item.image_url || ''
    });
  };

  return (
    <div className="admin-menu-manager">
      <h1>Manage Menu</h1>

      {/* Form */}
      <div className="menu-form">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          placeholder="Image URL (optional)"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        />
        <button onClick={handleSave}>
          {editingItem ? 'Update Item' : 'Add New Item'}
        </button>
        {editingItem && (
          <button onClick={() => {
            setEditingItem(null);
            setForm({ name: '', description: '', price: '', image_url: '' });
          }}>
            Cancel
          </button>
        )}
      </div>

      {/* Menu List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="menu-grid">
          {items.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              isAdmin={true}
              onEdit={startEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
/**
 * AdminMenuPage.jsx
 */

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import MenuItemForm from '../components/admin/MenuItemForm';

const formatLKR = (amount) =>
  `Rs. ${parseFloat(amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

const AdminMenuPage = () => {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [feedback, setFeedback]   = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // ✅ /api/ prefix ඉවත් කළා
      const res = await api.get('/admin/menu');
      setItems(res.data.items);
    } catch {
      setError('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditItem(null);
    fetchItems();
    showFeedback(editItem ? 'Item updated successfully.' : 'New item created successfully.');
  };

  const handleToggle = async (item) => {
    try {
      // ✅ /api/ prefix ඉවත් කළා
      await api.patch(`/admin/menu/${item.id}/toggle`);
      fetchItems();
      showFeedback(`"${item.name}" marked as ${item.is_available ? 'unavailable' : 'available'}.`);
    } catch {
      setError('Failed to update availability.');
    }
  };

  const handleDelete = async (id) => {
    try {
      // ✅ /api/ prefix ඉවත් කළා
      const res = await api.delete(`/admin/menu/${id}`);
      setDeleteConfirm(null);
      fetchItems();
      showFeedback(res.data.message);
    } catch {
      setError('Failed to delete item.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="text-xl font-extrabold text-pink-700">Indiwari Admin</Link>
          <nav className="flex gap-4 text-sm text-gray-600">
            <Link to="/admin" className="hover:text-pink-600">Dashboard</Link>
            <Link to="/admin/orders" className="hover:text-pink-600">Orders</Link>
            <Link to="/admin/menu" className="font-semibold text-pink-700 underline">Menu</Link>
            <Link to="/admin/customers" className="hover:text-pink-600">Customers</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Menu Management</h1>
            <p className="text-gray-500 text-sm mt-1">{items.length} items total</p>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowForm(true); }}
            className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors"
          >
            + Add New Item
          </button>
        </div>

        {feedback && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            ✓ {feedback}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No menu items yet. Click "Add New Item" to get started.
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Item</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Category</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-semibold">Price</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-semibold">Status</th>
                    <th className="text-center px-4 py-3 text-gray-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map(item => (
                    <tr key={item.id} className={`hover:bg-gray-50 ${!item.is_available ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-pink-50 flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">🎂</div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            {item.description && (
                              <p className="text-gray-400 text-xs line-clamp-1">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">
                        {formatLKR(item.base_price)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(item)}
                          title={item.is_available ? 'Click to hide from menu' : 'Click to show on menu'}
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                            item.is_available
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          {item.is_available ? 'Available' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setEditItem(item); setShowForm(true); }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <MenuItemForm
          item={editItem}
          onSuccess={handleFormSuccess}
          onClose={() => { setShowForm(false); setEditItem(null); }}
        />
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete this item?</h3>
            <p className="text-gray-500 text-sm mb-5">
              If this item has been ordered before, it will be hidden from the menu instead of permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuPage;
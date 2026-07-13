import { useEffect, useState } from 'react';
import api from '../../api/axios';
import MenuItemCard from './MenuItemCard';

// Capitalizes the first letter of each word (e.g. "birthday" -> "Birthday")
const formatCategoryName = (name) =>
  name
    ?.split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') ?? '';

// Fixed display order for category sections
const CATEGORY_ORDER = ['classic', 'birthday', 'cupcakes','brownie','fruit', 'specialty', 'wedding'];

// Item names that should always be grouped under "Classic", regardless of
// whatever category value they have in the database.
const FORCE_CLASSIC_ITEMS = ['butter cake', 'chocolate butter cake', 'chocolate cake'];

// Sorts category keys according to CATEGORY_ORDER; unknown categories go to the end (alphabetically)
const sortCategories = (categories) => {
  return [...categories].sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a.toLowerCase());
    const bIndex = CATEGORY_ORDER.indexOf(b.toLowerCase());
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
};

const MenuGrid = () => {
  const [itemsByCategory, setItemsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get('/menu');
        // Group items by category (case-insensitive, so "birthday" and "Birthday" merge into one)
        const grouped = res.data.items.reduce((acc, item) => {
          const nameKey = (item.name || '').trim().toLowerCase();
          const key = FORCE_CLASSIC_ITEMS.includes(nameKey)
            ? 'classic'
            : (item.category || '').trim().toLowerCase();
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});
        setItemsByCategory(grouped);
      } catch {
        setError('Failed to load menu. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const categories = sortCategories(Object.keys(itemsByCategory));

  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No menu items available right now. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categories.map(category => (
        <section key={category}>
          {/* Category heading */}
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold text-gray-800">{formatCategoryName(category)}</h2>
            <div className="flex-1 h-px bg-pink-200"></div>
          </div>
          {/* Item grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsByCategory[category].map(item => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default MenuGrid;
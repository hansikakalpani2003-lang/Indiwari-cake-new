/**
 * MenuPreview.jsx
 * Landing page section showing a teaser of the menu.
 * - Calls GET /api/menu directly (public endpoint, from M4)
 * - Shows the first 6 items returned
 * - Does NOT use CartContext — this is a preview only, not orderable from here
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../common/LoadingSpinner';

const PREVIEW_LIMIT = 6;

const formatLKR = (amount) =>
  `Rs. ${parseFloat(amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

const MenuPreview = () => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchMenu = async () => {
      try {
        const res = await api.get('/menu');
        if (!cancelled) {
          setItems((res.data.items || []).slice(0, PREVIEW_LIMIT));
        }
      } catch {
        if (!cancelled) setError('Could not load the menu right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMenu();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="bg-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            From Our Kitchen
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            A taste of what's on the menu — see everything on the full menu page.
          </p>
        </div>

        {loading && <LoadingSpinner label="Loading menu…" />}

        {!loading && error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-center text-sm text-gray-400">
            No menu items available right now — check back soon.
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                to="/menu"
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col"
              >
                <div className="relative h-32 md:h-40 bg-pink-50">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl"></span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                  <span className="mt-1 text-pink-700 font-bold text-sm">
                    {formatLKR(item.base_price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/menu"
            className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-colors"
          >
            See Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MenuPreview;
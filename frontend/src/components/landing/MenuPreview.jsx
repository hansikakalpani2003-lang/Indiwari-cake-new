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
        if (!cancelled) setItems((res.data.items || []).slice(0, PREVIEW_LIMIT));
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
    <section className="bg-[#FFF9FB]">
      <div className="max-w-6xl mx-auto px-6 py-24">

        <div className="text-center mb-16">
          <p className="uppercase tracking-[0.3em] text-[#E91E63] text-xs font-semibold">
            OUR SELECTION
          </p>

          <h2 className="mt-4 text-5xl font-serif italic text-[#1F2A44]">
            From Our Kitchen
          </h2>

          <p className="mt-5 text-[#667085]">
            Discover our most loved handcrafted cakes.
          </p>
        </div>

        {loading && <LoadingSpinner label="Loading menu..." />}

        {!loading && error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-center text-sm text-gray-400">
            No menu items available right now — check back soon.
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">

            {items.map((item) => (
              <Link
                key={item.id}
                to="/menu"
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-[#1F2A44] text-lg">
                    {item.name}
                  </h3>

                  <p className="mt-2 text-[#E91E63] font-bold">
                    {formatLKR(item.base_price)}
                  </p>
                </div>
              </Link>
            ))}

          </div>
        )}

        <div className="text-center mt-16">
          <Link
            to="/menu"
            className="inline-block bg-[#E91E63] hover:bg-[#D81B60] text-white px-10 py-4 rounded-full font-semibold shadow-lg transition duration-300 hover:scale-105"
          >
            View Full Menu
          </Link>
        </div>

      </div>
    </section>
  );
};

export default MenuPreview;
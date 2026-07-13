/**
 * MenuPage.jsx
 * Customer-facing menu browsing page.
 * Protected route — requires login.
 *
 * Renders: Navbar, MenuGrid, floating cart button.
 * "View Cart" navigates to /checkout.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import MenuGrid from '../components/menu/MenuGrid';

const MenuPage = () => {
  const { cartCount, cartTotal } = useCart();
  const navigate = useNavigate();

  const formatLKR = (amount) =>
    `Rs. ${parseFloat(amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-[#FFF8F3]">

      {/* Top bar */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-pink-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-bold text-pink-700 tracking-tight">
            Indiwari Cake
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-pink-600 transition-colors">
              Dashboard
            </Link>
            {cartCount > 0 && (
              <button
                onClick={() => navigate('/checkout')}
                className="flex items-center gap-2 bg-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-pink-700 transition-colors"
              >
                <span>🛒 Cart ({cartCount})</span>
                <span className="text-pink-200">|</span>
                <span>{formatLKR(cartTotal)}</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-12">

        {/* Page title block */}
        <div className="mb-10 text-center">
          <p className="text-pink-500 text-xs font-semibold tracking-widest uppercase mb-3">
            Baked fresh, just for you
          </p>
          <h1 className="font-serif italic text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Our Cakes
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Handcrafted for every occasion. Customise and order below.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <span className="h-px w-10 bg-pink-200"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
            <span className="h-px w-10 bg-pink-200"></span>
          </div>
        </div>

        <MenuGrid />
      </main>

      {/* Floating cart button — only shows when cart has items */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-40 pointer-events-none">
          <button
            onClick={() => navigate('/checkout')}
            className="pointer-events-auto flex items-center gap-3 bg-pink-700 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm hover:bg-pink-800 transition-all duration-200 hover:scale-105"
          >
            <span>🛒 {cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
            <span className="w-px h-4 bg-pink-500"></span>
            <span>{formatLKR(cartTotal)}</span>
            <span>→ View Cart</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
/**
 * HeroSection.jsx
 * Landing page hero — first thing a visitor sees.
 * "Browse Menu"  → always /menu (menu is publicly viewable)
 * "Order Now"    → /menu if already logged in, otherwise /register
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative h-[85vh] min-h-[560px] w-full overflow-hidden">

      {/* Full-bleed background image */}
      <img
        src="https://thumbs.dreamstime.com/b/soft-blurred-bakery-shop-background-creates-cozy-atmosphere-sweet-treats-soft-blurred-bakery-shop-background-creates-cozy-381989942.jpg"
        alt="Indiwari Cake"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Soft dark overlay so the card and edges read clearly */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Centered overlay card */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl px-8 py-10 md:px-14 md:py-12 max-w-lg text-center">

          <p className="text-pink-500 text-xs font-semibold tracking-widest uppercase mb-3">
            Freshly Baked Delicious
          </p>

          <h1 className="font-serif italic text-3xl md:text-4xl font-bold text-gray-800 leading-snug mb-6">
            Making your celebration <br className="hidden sm:block" />
            sweeter, one slice at a time
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/menu"
              className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold tracking-wide px-7 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              BROWSE MENU
            </Link>
            <Link
              to={isAuthenticated ? '/menu' : '/register'}
              className="border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white text-sm font-bold tracking-wide px-7 py-3 rounded-lg transition-colors"
            >
              ORDER NOW
            </Link>
          </div>

        </div>
      </div>

    </section>
  );
};

export default HeroSection;
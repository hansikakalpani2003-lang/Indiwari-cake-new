/**
 * Navbar.jsx
 * Site-wide navigation bar.
 * - Logo (left) always links to "/"
 * - Desktop links (right, hidden below md): Home, Menu, then auth-dependent links
 * - Mobile: hamburger button toggles a dropdown panel with the same links stacked
 *
 * Auth-dependent links:
 *   Not logged in → Login, Register
 *   Logged in (customer) → Dashboard, Logout
 *   Logged in (admin)    → Admin, Logout
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from "../../assets/logo.png";

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const linkClasses = (path) =>
    `text-sm font-semibold transition-colors ${
      isActive(path) ? 'text-pink-700' : 'text-gray-600 hover:text-pink-600'
    }`;

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    closeMobile();
    logout(); // AuthContext.logout() clears session and redirects to /login
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
    to="/"
  className="flex items-center"
  onClick={closeMobile}
>
  <img
    src={logo}
    alt="Indiwari Cake"
    className="h-14 w-auto object-contain"
  />
</Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={linkClasses('/')}>Home</Link>
            <Link to="/menu" className={linkClasses('/menu')}>Menu</Link>

            {!isAuthenticated && (
              <>
                <Link to="/login" className={linkClasses('/login')}>Customer </Link>
                <Link to="/delivery/login" className={linkClasses('/delivery/login')}>Delivery </Link>
                <Link to="/login" className={linkClasses('/login')}>Admin </Link>
                <Link
                  to="/register"
                  className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className={linkClasses(isAdmin ? '/admin' : '/dashboard')}
                >
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Link>
                <span className="text-xs text-gray-400 hidden lg:inline">
                  Hi, {user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="border border-pink-600 text-pink-600 hover:bg-pink-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="md:hidden p-2 text-gray-600 hover:text-pink-600"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown panel */}
        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
            <Link to="/" className={linkClasses('/')} onClick={closeMobile}>Home</Link>
            <Link to="/menu" className={linkClasses('/menu')} onClick={closeMobile}>Menu</Link>

            {!isAuthenticated && (
              <>
                <Link to="/login" className={linkClasses('/login')} onClick={closeMobile}>Customer Login</Link>
                <Link to="/delivery/login" className={linkClasses('/delivery/login')} onClick={closeMobile}>Delivery Login</Link>
                <Link to="/login" className={linkClasses('/login')} onClick={closeMobile}>Admin Login</Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-center"
                >
                  Register
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className={linkClasses(isAdmin ? '/admin' : '/dashboard')}
                  onClick={closeMobile}
                >
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="border border-pink-600 text-pink-600 hover:bg-pink-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-center"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
/**
 * HeroSection.jsx
 * Landing page hero — first thing a visitor sees.
 * "Browse Menu"  → always /menu (menu is publicly viewable)
 * "Order Now"    → /menu if already logged in, otherwise /register
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="bg-gradient-to-br from-pink-50 via-pink-100 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 flex flex-col items-center text-center">

        <span className="text-6xl md:text-7xl mb-6" aria-hidden="true">🎂</span>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
          Indiwari Cake
        </h1>

        <p className="mt-4 text-lg md:text-xl text-pink-700 font-semibold">
          Handcrafted Cakes, Delivered to Your Door
        </p>

        <p className="mt-3 max-w-xl text-gray-500 text-sm md:text-base">
          Customise your cake online, track every step from kitchen to doorstep,
          and verify your order instantly with a unique QR code on delivery.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/menu"
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-colors"
          >
            Browse Menu
          </Link>
          <Link
            to={isAuthenticated ? '/menu' : '/register'}
            className="border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Order Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
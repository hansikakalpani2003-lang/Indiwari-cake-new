/**
 * Footer.jsx
 * Site-wide footer.
 * Contact email matches the address used in M9's email templates
 * (support@indiwaricake.lk) so customers see one consistent contact point
 * across the website and their order notification emails.
 */

import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

        {/* Business info */}
        <div>
          <h3 className="text-white text-lg font-extrabold mb-2">Indiwari Cake</h3>
          <p className="text-sm text-gray-400">
            Handcrafted cakes for every occasion — ordered online, tracked with
            a single QR code, delivered to your door.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="mailto:support@indiwaricake.lk" className="hover:text-pink-400 transition-colors">
                support@indiwaricake.lk
              </a>
            </li>
            <li>
              {/* TODO: replace with the real business phone number before launch */}
              <a href="tel:+94771234567" className="hover:text-pink-400 transition-colors">
                +94 77 123 4567
              </a>
            </li>
            <li className="text-gray-400">Negombo, Sri Lanka</li>
          </ul>
        </div>

        {/* Social + links */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Follow Us</h4>
          <ul className="space-y-2 text-sm">
            <li>
              {/* TODO: replace with the real Instagram handle */}
              <a
                href="https://instagram.com/indiwaricake"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition-colors"
              >
                📷 Instagram
              </a>
            </li>
            <li>
              {/* TODO: replace with the real Facebook page */}
              <a
                href="https://facebook.com/indiwaricake"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition-colors"
              >
                📘 Facebook
              </a>
            </li>
            <li>
              <Link to="/menu" className="hover:text-pink-400 transition-colors">
                Browse Menu
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <p className="max-w-6xl mx-auto px-4 py-4 text-xs text-gray-500 text-center">
          © {year} Indiwari Cake. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
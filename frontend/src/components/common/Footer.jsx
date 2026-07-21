import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#F8E8EF] text-[#2D3748]">
      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
        <div>
          <h3 className="font-serif italic text-2xl font-semibold mb-4 text-[#1F2A44]">
            Indiwari Cake
          </h3>

          <p className="text-sm leading-7 text-[#5F6475]">
            Handcrafted cakes for every occasion — ordered online, tracked with
            a single QR code, delivered to your door.
          </p>
        </div>

        <div>
          <h4 className="font-semibold uppercase tracking-[0.25em] text-xs mb-4 text-[#1F2A44]">
            Contact
          </h4>

          <ul className="space-y-3 text-sm text-[#5F6475]">
            <li>
              <a
                href="mailto:support@indiwaricake.lk"
                className="hover:text-[#E91E63] transition-colors"
              >
                support@indiwaricake.lk
              </a>
            </li>

            <li>
              <a
                href="tel:+94770147853"
                className="hover:text-[#E91E63] transition-colors"
              >
                +94 77 014 7853
              </a>
            </li>

            <li>Negombo, Sri Lanka</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold uppercase tracking-[0.25em] text-xs mb-4 text-[#1F2A44]">
            Follow Us
          </h4>

          <ul className="space-y-3 text-sm text-[#5F6475]">
            <li>
              <a
                href="https://instagram.com/indiwaricake"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E91E63] transition-colors"
              >
                Instagram
              </a>
            </li>

            <li>
              <a
                href="https://facebook.com/indiwaricake"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E91E63] transition-colors"
              >
                Facebook
              </a>
            </li>

            <li>
              <Link
                to="/menu"
                className="hover:text-[#E91E63] transition-colors"
              >
                Browse Menu
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#EBC9D8]">
        <p className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-[#6B7280]">
          © {year} Indiwari Cake. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
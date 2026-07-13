/**
 * CheckoutPage.jsx
 * Order placement page. Protected — requires customer login.
 *
 * Flow:
 *   1. Displays cart items using OrderSummary component
 *   2. Customer fills: delivery_address, delivery_date, special_instructions
 *   3. On submit → POST /api/orders
 *   4. On success → clear cart, navigate to /orders/:newOrderId
 *   5. On error → show inline error message
 *
 * Route: /checkout
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import OrderSummary from '../components/order/OrderSummary';
import api from '../api/axios';

// ── Helpers ───────────────────────────────────────────────────────────────────
// Tomorrow's date as YYYY-MM-DD string (for the date input's min attribute)
function getTomorrowString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// Loads the same display/body fonts used across the site (Playfair Display
// italic for the hero, Inter for everything else). Safe to leave in — if a
// <link> for these already exists in index.html this is just a no-op repeat.
const FontImport = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600;1,700&family=Inter:wght@400;500;600;700&display=swap');`}</style>
);

// Hairline + centre dot divider — matches the one under "Our Cakes" on the menu page.
const DotDivider = () => (
  <div className="flex items-center justify-center gap-3 w-40 mx-auto" aria-hidden="true">
    <span className="h-px flex-1 bg-rose-200" />
    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
    <span className="h-px flex-1 bg-rose-200" />
  </div>
);

// Section label with a trailing hairline — matches the "Classic ———" pattern
// used to introduce cake categories on the menu page.
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-4 mb-4">
    <h2 className="text-lg font-bold text-[#1E2233] whitespace-nowrap">{children}</h2>
    <span className="h-px flex-1 bg-rose-200" />
  </div>
);

const CheckoutPage = () => {
  const navigate         = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user }         = useAuth();

  // ── Form state ────────────────────────────────────────────────────────────
  const [deliveryAddress, setDeliveryAddress]         = useState(user?.delivery_address || '');
  const [deliveryDate, setDeliveryDate]               = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // ── UI state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const tomorrowStr = getTomorrowString();

  // ── Guard: empty cart ─────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FDF2EF' }}>
        <FontImport />
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4"></p>
          <h2
            className="text-3xl text-[#1E2233] mb-2 italic"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Your cart is empty
          </h2>
          <p className="text-[#6B7280] mb-6">Add some cakes from the menu before checking out.</p>
          <Link
            to="/menu"
            className="inline-block bg-[#C2255C] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#A81E4D] transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  // ── Submit handler ────────────────────────────────────────────────────────
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side checks (express-validator also validates server-side)
    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address.');
      return;
    }
    if (!deliveryDate) {
      setError('Please select a delivery date.');
      return;
    }

    // Build the order payload
    const payload = {
      items: cartItems.map(item => ({
        menu_item_id:    item.menu_item_id,
        quantity:        item.quantity,
        size:            item.size            || undefined,
        flavour:         item.flavour         || undefined,
        decoration_note: item.decoration_note || undefined,
      })),
      delivery_address:     deliveryAddress.trim(),
      delivery_date:        deliveryDate,
      special_instructions: specialInstructions.trim() || undefined,
    };

    try {
      setLoading(true);
      const response = await api.post('/orders', payload);
      const { orderId } = response.data;

      // Clear the cart — order placed successfully
      clearCart();

      // Navigate to the order detail/confirmation page
      navigate(`/orders/${orderId}`, { replace: true });

    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;

      if (validationErrors && validationErrors.length > 0) {
        setError(validationErrors.map(e => e.message).join(' '));
      } else {
        setError(serverMsg || 'Failed to place the order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FDF2EF' }}>
      <FontImport />

      {/* ── Page Header — mirrors the "Our Cakes" hero treatment ──────────── */}
      <div className="px-4 pt-16 pb-10 text-center">
        <p className="text-xs font-bold tracking-[0.15em] text-[#C2255C] uppercase mb-3">
          Almost there
        </p>
        <h1
          className="text-5xl italic text-[#1E2233] mb-3"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
        >
          Checkout
        </h1>
        <p className="text-[#6B7280] mb-5">Review your cakes and confirm your delivery details.</p>
        <DotDivider />
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-14 space-y-10">

        {/* ── Section 1: Order Summary ─────────────────────────────────── */}
        <section>
          <SectionLabel>Your Items</SectionLabel>
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm shadow-rose-100/60 overflow-hidden">
            <OrderSummary />
          </div>
        </section>

        {/* ── Section 2: Delivery Details Form ────────────────────────── */}
        <section>
          <SectionLabel>Delivery Details</SectionLabel>

          <form onSubmit={handlePlaceOrder} className="space-y-5 bg-white rounded-2xl p-6 shadow-sm shadow-rose-100/60 border border-rose-100">

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Delivery Address */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#1E2233] mb-1.5" htmlFor="delivery_address">
                <span className="text-[#C2255C]">📍</span> Delivery Address <span className="text-[#C2255C]">*</span>
              </label>
              <textarea
                id="delivery_address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
                placeholder="Enter your full delivery address..."
                required
                className="w-full border border-rose-100 bg-[#FFFBFA] rounded-xl px-4 py-3 text-sm text-[#1E2233] placeholder-[#B8A9A2] focus:outline-none focus:ring-2 focus:ring-[#C2255C]/40 focus:border-transparent resize-none transition-shadow"
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#1E2233] mb-1.5" htmlFor="delivery_date">
                <span className="text-[#C2255C]">📅</span> Preferred Delivery Date <span className="text-[#C2255C]">*</span>
              </label>
              <input
                id="delivery_date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={tomorrowStr}
                required
                className="w-full border border-rose-100 bg-[#FFFBFA] rounded-xl px-4 py-3 text-sm text-[#1E2233] focus:outline-none focus:ring-2 focus:ring-[#C2255C]/40 focus:border-transparent transition-shadow"
              />
              <p className="text-xs text-[#B8A9A2] mt-1.5">Same-day orders are not accepted. Please select tomorrow or a later date.</p>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#1E2233] mb-1.5" htmlFor="special_instructions">
                <span className="text-[#C2255C]">✏️</span> Special Instructions <span className="text-[#B8A9A2] font-normal">(optional)</span>
              </label>
              <textarea
                id="special_instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Allergy info, cake message text, any special requests..."
                className="w-full border border-rose-100 bg-[#FFFBFA] rounded-xl px-4 py-3 text-sm text-[#1E2233] placeholder-[#B8A9A2] focus:outline-none focus:ring-2 focus:ring-[#C2255C]/40 focus:border-transparent resize-none transition-shadow"
              />
              <p className="text-xs text-[#B8A9A2] mt-1 text-right">{specialInstructions.length}/500 characters</p>
            </div>

            {/* Payment method info — Phase 1 is cash only */}
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl">
              <span className="text-2xl">💵</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Cash on Delivery</p>
                <p className="text-xs text-amber-700">Payment is collected when your order is delivered. No online payment required.</p>
              </div>
            </div>

            <div className="h-px bg-rose-100" />

            {/* Order Total */}
            <div className="flex justify-between items-center px-1 py-1">
              <span className="font-semibold text-[#1E2233]">Total to Pay</span>
              <span
                className="text-2xl text-[#C2255C]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
              >
                {new Intl.NumberFormat('si-LK', { style: 'currency', currency: 'LKR' }).format(cartTotal)}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C2255C] text-white py-4 rounded-full font-bold text-lg hover:bg-[#A81E4D] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-rose-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Placing Order...
                </span>
              ) : (
                'Place Order'
              )}
            </button>

            {/* Back to cart link */}
            <p className="text-center text-sm text-[#B8A9A2]">
              <Link to="/menu" className="text-[#C2255C] hover:underline font-medium">← Continue Shopping</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default CheckoutPage;
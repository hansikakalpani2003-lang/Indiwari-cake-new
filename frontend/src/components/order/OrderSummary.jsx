/**
 * OrderSummary.jsx
 * Displays a summary of the items in the cart before the customer
 * submits the order on CheckoutPage.
 *
 * Props:
 *   cartItems  — array from CartContext
 *   cartTotal  — number from CartContext
 *   onRemove   — function(cartItemId) — removes item from cart
 *   onUpdateQty — function(cartItemId, newQty) — updates quantity
 */

import { useCart } from '../../context/CartContext';

// ── LKR currency formatter ────────────────────────────────────────────────────
const formatLKR = (amount) =>
  new Intl.NumberFormat('si-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(amount);

const OrderSummary = () => {
  const { cartItems, cartTotal, removeItem, updateQuantity } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="text-lg font-medium">Your cart is empty.</p>
        <p className="text-sm mt-1">Go back to the menu and add some items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Item Rows ─────────────────────────────────────────────────── */}
      {cartItems.map((item) => (
        <div
          key={item.cartItemId}
          className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
        >
          {/* Left: item info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{item.name}</p>

            {/* Customisation details */}
            <div className="mt-1 space-y-0.5 text-sm text-gray-500">
              {item.size            && <p>Size: <span className="text-gray-700">{item.size}</span></p>}
              {item.flavour         && <p>Flavour: <span className="text-gray-700">{item.flavour}</span></p>}
              {item.decoration_note && <p>Decoration: <span className="text-gray-700">{item.decoration_note}</span></p>}
            </div>

            {/* Price per unit */}
            <p className="mt-1 text-sm text-indigo-600 font-medium">
              {formatLKR(item.base_price)} each
            </p>
          </div>

          {/* Centre: quantity stepper */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-6 text-center font-semibold text-gray-800">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
              disabled={item.quantity >= 20}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Right: subtotal + remove */}
          <div className="text-right min-w-[90px]">
            <p className="font-bold text-gray-800">{formatLKR(item.item_subtotal)}</p>
            <button
              onClick={() => removeItem(item.cartItemId)}
              className="mt-1 text-xs text-red-500 hover:text-red-700 transition"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      {/* ── Total ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-100">
        <span className="font-semibold text-gray-700">Order Total</span>
        <span className="text-xl font-bold text-indigo-700">{formatLKR(cartTotal)}</span>
      </div>
    </div>
  );
};

export default OrderSummary;
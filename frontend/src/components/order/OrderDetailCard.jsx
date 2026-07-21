/**
 * OrderDetailCard.jsx
 * Displays full order information for a single order.
 * Used on the OrderDetailPage after order confirmation and when
 * a customer navigates to view a past order.
 *
 * Props:
 *   order  {Object}  — full order object from GET /api/orders/:id
 *                      includes: order_reference, status, delivery_address,
 *                                delivery_date, special_instructions, total_amount,
 *                                items[], created_at, qr_code_data_url, qr_code_token
 */

import StatusBadge from '../common/StatusBadge';

// ── Formatters ─────────────────────────────────────────────────────────────
const formatLKR = (amount) =>
  new Intl.NumberFormat('si-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(amount);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const OrderDetailCard = ({ order }) => {
  if (!order) return null;

  return (
    <div className="space-y-6">

      {/* ── Order Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Order Reference</p>
          <p className="text-3xl font-black text-indigo-700 tracking-tight">{order.order_reference}</p>
          <p className="text-xs text-gray-400 mt-1">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} large />
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <hr className="border-gray-200" />

      {/* ── Delivery Info ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">📍 Delivery Address</p>
          <p className="text-sm text-gray-700 leading-relaxed">{order.delivery_address}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">📅 Delivery Date</p>
          <p className="text-sm text-gray-700 font-semibold">{formatDate(order.delivery_date)}</p>
        </div>
      </div>

      {order.delivery_person_name && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">🚚 Assigned Delivery Person</p>
          <p className="text-sm font-semibold text-blue-900">{order.delivery_person_name}</p>
          <p className="text-sm text-blue-700 mt-1">{order.delivery_person_phone || 'No phone number'}</p>
          <p className="text-xs text-blue-600 mt-1">{[order.delivery_vehicle_type, order.delivery_vehicle_number].filter(Boolean).join(' · ')}</p>
        </div>
      )}

      {/* ── Special Instructions ─────────────────────────────────────────── */}
      {order.special_instructions && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">📝 Special Instructions</p>
          <p className="text-sm text-amber-800 leading-relaxed">{order.special_instructions}</p>
        </div>
      )}

      {/* ── Items Table ──────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">🎂 Items Ordered</p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Item</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Details</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">Qty</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Price</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.menu_item_name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    <span className="space-x-2">
                      {item.size    && <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs">{item.size}</span>}
                      {item.flavour && <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">{item.flavour}</span>}
                      {item.decoration_note && (
                        <span className="inline-block bg-pink-50 text-pink-700 px-2 py-0.5 rounded text-xs" title={item.decoration_note}>
                          Deco: {item.decoration_note.length > 20 ? item.decoration_note.slice(0, 20) + '…' : item.decoration_note}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatLKR(item.unit_price)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatLKR(item.item_subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50">
                <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-700">Total</td>
                <td className="px-4 py-3 text-right font-black text-indigo-700 text-base">{formatLKR(order.total_amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Payment Method ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
        <span className="text-xl">💵</span>
        <div>
          <p className="text-sm font-semibold text-green-800">Cash on Delivery</p>
          <p className="text-xs text-green-700">Payment collected at the time of delivery.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailCard;
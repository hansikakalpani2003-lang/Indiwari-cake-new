/**
 * OrderHistoryList.jsx
 * Renders a list of orders for the customer dashboard and order history page.
 * Each row shows: reference, status badge, delivery date, item count, total, View link.
 *
 * Props:
 *   orders     {Array}    — array of order objects from GET /api/orders/my
 *   loading    {boolean}  — show loading skeleton if true
 *   emptyMsg   {string}   — custom empty state message (optional)
 */

import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

const formatLKR = (amount) =>
  new Intl.NumberFormat('si-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(amount);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="animate-pulse flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-32" />
      <div className="h-3 bg-gray-100 rounded w-20" />
    </div>
    <div className="h-6 bg-gray-200 rounded w-24" />
    <div className="h-8 bg-gray-100 rounded w-20" />
  </div>
);

const OrderHistoryList = ({ orders = [], loading = false, emptyMsg }) => {
  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
        <p className="text-4xl mb-3">🎂</p>
        <p className="font-semibold text-gray-700 text-lg">
          {emptyMsg || 'No orders yet!'}
        </p>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          Browse the menu and place your first order.
        </p>
        <Link
          to="/menu"
          className="inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  // ── Order list ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
        >
          {/* Left: reference + meta */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base">{order.order_reference}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(order.delivery_date)} &middot; {order.item_count} item{order.item_count !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Centre: status */}
          <div className="shrink-0">
            <StatusBadge status={order.status} />
          </div>

          {/* Right: total + view link */}
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
            <span className="font-bold text-gray-800">{formatLKR(order.total_amount)}</span>
            <Link
              to={`/orders/${order.id}`}
              className="text-sm text-indigo-600 font-semibold hover:underline whitespace-nowrap"
            >
              View Details →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistoryList;
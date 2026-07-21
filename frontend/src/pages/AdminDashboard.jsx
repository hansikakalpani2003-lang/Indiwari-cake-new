/**
 * AdminDashboard.jsx
 * The admin home page (route: /admin).
 *
 * Renders:
 *   - 4 summary cards: Orders Today, Revenue Today, Pending Orders, Out for Delivery
 *   - A table of the 10 most recently placed orders
 *   - Quick-action buttons linking to /admin/orders and /admin/menu
 *
 * Data sources:
 *   - GET /api/admin/reports/summary  → summary card values
 *   - GET /api/admin/orders?limit=10&page=1 → recent orders table
 *
 * Used by: App.jsx (admin route)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

export default function AdminDashboard() {
  const [summary, setSummary]         = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, ordersRes] = await Promise.all([
          api.get('/admin/reports/summary'),
          api.get('/admin/orders', { params: { page: 1, limit: 10 } }),
        ]);

        setSummary(summaryRes.data);
        setRecentOrders(ordersRes.data.orders);
      } catch {
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center">
          {error}
        </div>
      </div>
    );
  }

  // ── Summary card definitions ────────────────────────────────────────────────
  const cards = [
    {
      label: 'Orders Today',
      value: summary.orders_today,
      icon: '🧾',
      accent: 'bg-pink-100 text-pink-700',
    },
    {
      label: 'Revenue Today',
      value: formatCurrency(summary.revenue_today),
      icon: '💰',
      accent: 'bg-green-100 text-green-700',
    },
    {
      label: 'Pending Orders',
      value: summary.pending_count,
      icon: '⏳',
      accent: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Out for Delivery',
      value: summary.out_for_delivery_count,
      icon: '🚚',
      accent: 'bg-blue-100 text-blue-700',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F3]">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-pink-500 text-xs font-semibold tracking-widest uppercase">
                Admin Overview
              </p>
              <Link to="/" className="text-xs text-gray-400 hover:text-pink-600 font-semibold transition-colors">
                ← Home
              </Link>
            </div>
            <h1 className="font-serif italic text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Overview of today's activity and recent orders.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/admin/orders"
              className="px-5 py-2.5 rounded-xl bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 transition-colors shadow-sm hover:shadow-md"
            >
              View All Orders
            </Link>
            <Link
              to="/admin/menu"
              className="px-5 py-2.5 rounded-xl border-2 border-pink-600 text-pink-600 text-sm font-semibold hover:bg-pink-600 hover:text-white transition-colors"
            >
              Manage Menu
            </Link>
            <Link
              to="/admin/delivery-persons"
              className="px-5 py-2.5 rounded-xl border-2 border-pink-600 text-pink-600 text-sm font-semibold hover:bg-pink-600 hover:text-white transition-colors"
            >
              Delivery Team
            </Link>
          </div>
        </div>

        {/* ── Summary Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-full text-xl mb-4 ${card.accent}`}>
                <span>{card.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* ── Recent Orders ────────────────────────────────────────────────────── */}
        <div className="bg-white border border-pink-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-pink-50">
            <h2 className="font-serif text-lg font-bold text-gray-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-pink-600 font-semibold hover:text-pink-700">
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-14">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-pink-50/50 text-left text-gray-500 uppercase text-xs tracking-wide">
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Placed</th>
                    <th className="px-6 py-3">Delivery Date</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-pink-50/40 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-gray-900">{order.order_reference}</td>
                      <td className="px-6 py-3.5 text-gray-700">{order.customer_name}</td>
                      <td className="px-6 py-3.5 text-gray-500">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-3.5 text-gray-500">{formatDate(order.delivery_date)}</td>
                      <td className="px-6 py-3.5 text-gray-900 font-semibold">{formatCurrency(order.total_amount)}</td>
                      <td className="px-6 py-3.5"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
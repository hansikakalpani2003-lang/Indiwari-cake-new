/**
 * OrderDetailPage.jsx
 * Shows the full detail of a single order.
 * Serves two purposes:
 *   1. Order confirmation page — immediately after successful checkout
 *   2. Order detail view — when customer clicks an order from their history
 *
 * Route: /orders/:id  (protected — requires customer login)
 *
 * Features:
 *   - Full order info (OrderDetailCard)
 *   - QR code display + download + print (QRCodeDisplay)
 *   - Auto-refresh every 30 seconds to show live status updates
 *   - "Last updated X seconds ago" indicator
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import OrderDetailCard from '../components/order/OrderDetailCard';
import QRCodeDisplay from '../components/order/QRCodeDisplay';

const REFRESH_INTERVAL_MS = 30_000; // 30 seconds

const OrderDetailPage = () => {
  const { id } = useParams();

  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo,  setSecondsAgo]  = useState(0);

  const intervalRef = useRef(null);
  const tickRef     = useRef(null);

  // ── Fetch order data ──────────────────────────────────────────────────────
  const fetchOrder = useCallback(async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.order);
      setLastUpdated(Date.now());
      setSecondsAgo(0);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Order not found. It may belong to a different account.');
      } else {
        setError('Failed to load order. Please try refreshing.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ── Initial fetch + auto-refresh every 30 seconds ─────────────────────────
  useEffect(() => {
    fetchOrder();

    intervalRef.current = setInterval(fetchOrder, REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(tickRef.current);
    };
  }, [fetchOrder]);

  // ── "Last updated X seconds ago" ticker ──────────────────────────────────
  useEffect(() => {
    if (!lastUpdated) return;
    tickRef.current = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 5000);
    return () => clearInterval(tickRef.current);
  }, [lastUpdated]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your order...</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl border border-pink-100 shadow-sm p-10">
          <p className="text-5xl mb-4">😔</p>
          <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/dashboard" className="inline-block bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 transition shadow-sm hover:shadow-md">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#FFF8F3]">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-pink-100 px-4 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-pink-500 text-xs font-semibold tracking-widest uppercase mb-1">
              Track Your Order
            </p>
            <h1 className="font-serif italic text-2xl font-bold text-gray-800">Order Details</h1>
            <p className="text-xs text-gray-400 mt-1">
              Auto-refreshes every 30 seconds
              {secondsAgo > 0 && <> · Updated {secondsAgo}s ago</>}
            </p>
          </div>
          <Link to="/dashboard" className="text-sm text-pink-600 hover:text-pink-700 font-semibold">
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* ── Confirmation banner (shown once, right after order placement) ─ */}
      {order.status === 'Pending' && (
        <div className="bg-green-600 text-white px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-semibold">Order placed successfully!</p>
              <p className="text-sm text-green-100">
                Your order <strong>{order.order_reference}</strong> has been received. The baker will confirm it shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── Section 1: Order Detail ──────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
          <OrderDetailCard order={order} />
        </section>

        {/* ── Section 2: QR Code ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
          <h2 className="font-serif text-lg font-bold text-gray-800 mb-2">Order QR Code</h2>
          <p className="text-sm text-gray-500 mb-6">
            This QR code links to your full order details. The baker or delivery person can scan it at any time.
          </p>
          <QRCodeDisplay
            dataUrl={order.qr_code_data_url}
            token={order.qr_code_token}
            orderRef={order.order_reference}
          />
        </section>

        {/* ── Section 3: What's next ───────────────────────────────────── */}
        <section className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
          <h2 className="font-serif text-base font-bold text-pink-800 mb-3">What happens next?</h2>
          <ol className="space-y-2 text-sm text-pink-700 list-decimal list-inside">
            <li>The baker will review and confirm your order.</li>
            <li>You'll receive email updates at each step.</li>
            <li>On delivery day, the delivery person will scan the QR code above.</li>
            <li>You can also scan it to verify your order at the point of handoff.</li>
          </ol>
        </section>

      </div>
    </div>
  );
};

export default OrderDetailPage;
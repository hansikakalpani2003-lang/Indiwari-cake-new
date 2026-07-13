/**
 * DeliveryDashboard.jsx
 * Dashboard for delivery personnel.
 *
 * Route: /delivery
 * Access: Delivery personnel only (DeliveryRoute)
 *
 * Tabs:
 *   Available   — orders marked 'Out for Delivery' that nobody has accepted yet
 *   My Deliveries — orders this delivery person has accepted but not delivered
 *   History     — orders this delivery person has already delivered
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, formatDateTime } from '../utils/formatDate';

const TABS = [
  { key: 'available', label: 'Available Orders' },
  { key: 'mine',      label: 'My Deliveries' },
  { key: 'history',   label: 'History' },
];

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState('');

  const loadOrders = useCallback(async (tab) => {
    const endpointForTab = {
      available: '/delivery/available',
      mine:      '/delivery/my-deliveries',
      history:   '/delivery/history',
    };
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(endpointForTab[tab]);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(activeTab);
  }, [activeTab, loadOrders]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAccept = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      await api.patch(`/delivery/orders/${orderId}/accept`);
      showToast('Order accepted! Find it under "My Deliveries".');
      loadOrders(activeTab);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not accept this order.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeliver = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      await api.patch(`/delivery/orders/${orderId}/deliver`);
      showToast('Order marked as delivered. Great job!');
      loadOrders(activeTab);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not update this order.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-pink-700">Delivery Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome, {user?.name || 'Delivery Partner'} — here you can accept and deliver orders.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mb-4 p-3 bg-pink-100 border border-pink-200 rounded-lg text-pink-800 text-sm font-medium">
            {toast}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors
                ${activeTab === tab.key
                  ? 'border-pink-600 text-pink-700'
                  : 'border-transparent text-gray-500 hover:text-pink-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <p className="text-center text-gray-500 py-10">Loading orders...</p>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500">
              {activeTab === 'available' && 'No orders are waiting for pickup right now.'}
              {activeTab === 'mine' && "You haven't accepted any orders yet."}
              {activeTab === 'history' && "You haven't delivered any orders yet."}
            </p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-800">{order.order_reference}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{order.customer_name} · {order.customer_phone || 'No phone on file'}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-700">Delivery address:</span> {order.delivery_address}</p>
                  <p><span className="font-medium text-gray-700">Delivery date:</span> {formatDate(order.delivery_date)}</p>
                  <p><span className="font-medium text-gray-700">Amount:</span> {formatCurrency(order.total_amount)}</p>
                  {order.accepted_at && (
                    <p><span className="font-medium text-gray-700">Accepted:</span> {formatDateTime(order.accepted_at)}</p>
                  )}
                  {order.special_instructions && (
                    <p className="sm:col-span-2"><span className="font-medium text-gray-700">Note:</span> {order.special_instructions}</p>
                  )}
                </div>

                {activeTab === 'available' && (
                  <button
                    onClick={() => handleAccept(order.id)}
                    disabled={actionLoadingId === order.id}
                    className="mt-4 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {actionLoadingId === order.id ? 'Accepting...' : 'Accept Order'}
                  </button>
                )}

                {activeTab === 'mine' && (
                  order.status === 'Out for Delivery' ? (
                    <button
                      onClick={() => handleDeliver(order.id)}
                      disabled={actionLoadingId === order.id}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {actionLoadingId === order.id ? 'Updating...' : 'Mark as Delivered'}
                    </button>
                  ) : (
                    <p className="mt-4 text-xs text-gray-500 italic">
                      Waiting for the bakery to mark this "Out for Delivery" before you can deliver it.
                    </p>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
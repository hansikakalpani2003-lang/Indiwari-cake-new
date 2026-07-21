import { useCallback, useEffect, useState } from 'react';
import deliveryApi from '../api/deliveryApi';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, formatDateTime } from '../utils/formatDate';

const tabs = [
  { key: 'available', label: 'Available Orders', endpoint: '/available-orders' },
  { key: 'mine', label: 'My Delivery', endpoint: '/my-deliveries' },
  { key: 'history', label: 'Delivery History', endpoint: '/history' },
];

export default function DeliveryDashboard() {
  const { deliveryPerson, logout, refresh } = useDeliveryAuth();
  const [activeTab, setActiveTab] = useState('available');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [workingId, setWorkingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const tab = tabs.find((item) => item.key === activeTab);
      const { data } = await deliveryApi.get(tab.endpoint);
      setOrders(data.orders || []);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load delivery orders.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, refresh]);

  useEffect(() => { load(); }, [load]);

  const action = async (orderId, type) => {
    setWorkingId(orderId);
    setMessage('');
    try {
      const { data } = await deliveryApi.patch(`/orders/${orderId}/${type}`);
      setMessage(data.message);
      setActiveTab(type === 'accept' ? 'mine' : 'history');
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Action failed.');
      await load();
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3]">
      <header className="bg-white border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-pink-500 font-bold">Indiwari Cake Delivery</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Welcome, {deliveryPerson?.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {deliveryPerson?.vehicle_type}{deliveryPerson?.vehicle_number ? ` · ${deliveryPerson.vehicle_number}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${deliveryPerson?.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {deliveryPerson?.status}
            </span>
            <button onClick={logout} className="border border-pink-600 text-pink-600 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-pink-50">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white border border-pink-100 rounded-2xl p-2 flex gap-2 overflow-x-auto mb-6">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold ${activeTab === tab.key ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-pink-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {message && <div className="mb-5 rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-800">{message}</div>}
        {loading && <div className="bg-white rounded-2xl p-12 text-center text-gray-500">Loading orders...</div>}
        {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-pink-100 p-14 text-center">
            <div className="text-4xl mb-3">🚚</div>
            <p className="font-semibold text-gray-800">No orders in this section.</p>
            <p className="text-sm text-gray-500 mt-1">Available orders appear after the admin confirms or prepares them.</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-5">
            {orders.map((order) => (
              <article key={order.id} className="bg-white border border-pink-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono font-bold text-gray-900">{order.order_reference}</p>
                    <p className="text-sm text-gray-500 mt-1">{order.customer_name} · {order.customer_phone || 'No phone'}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  <div><dt className="font-semibold text-gray-700 inline">Address: </dt><dd className="inline text-gray-600">{order.delivery_address}</dd></div>
                  <div><dt className="font-semibold text-gray-700 inline">Delivery date: </dt><dd className="inline text-gray-600">{formatDate(order.delivery_date)}</dd></div>
                  <div><dt className="font-semibold text-gray-700 inline">Amount: </dt><dd className="inline text-gray-900 font-bold">{formatCurrency(order.total_amount)}</dd></div>
                  {order.special_instructions && <div><dt className="font-semibold text-gray-700 inline">Instructions: </dt><dd className="inline text-gray-600">{order.special_instructions}</dd></div>}
                  {order.accepted_at && <div><dt className="font-semibold text-gray-700 inline">Accepted: </dt><dd className="inline text-gray-600">{formatDateTime(order.accepted_at)}</dd></div>}
                  {order.delivered_at && <div><dt className="font-semibold text-gray-700 inline">Delivered: </dt><dd className="inline text-gray-600">{formatDateTime(order.delivered_at)}</dd></div>}
                </dl>

                <div className="mt-5 flex flex-wrap gap-2">
                  {order.customer_phone && <a href={`tel:${order.customer_phone}`} className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">Call Customer</a>}
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">Open Map</a>
                  {activeTab === 'available' && (
                    <button disabled={workingId === order.id || deliveryPerson?.status !== 'Available'} onClick={() => action(order.id, 'accept')} className="ml-auto px-4 py-2 rounded-xl bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 disabled:opacity-50">
                      {workingId === order.id ? 'Accepting...' : 'Accept Order'}
                    </button>
                  )}
                  {activeTab === 'mine' && (
                    <button disabled={workingId === order.id} onClick={() => action(order.id, 'deliver')} className="ml-auto px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
                      {workingId === order.id ? 'Updating...' : 'Mark Delivered'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

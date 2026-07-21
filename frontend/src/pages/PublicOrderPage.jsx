// PublicOrderPage.jsx
import { useEffect, useState } from 'react';
import { useParams }           from 'react-router-dom';
import axios                   from 'axios';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return 'LKR 0.00';
  return 'LKR ' + num.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const STATUS_CONFIG = {
  'Pending':          { label: '⏳ Pending',           bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', desc: 'Your order has been received and is awaiting confirmation.' },
  'Confirmed':        { label: '✅ Confirmed',          bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300',   desc: 'Your order has been confirmed by Indiwari Cake.' },
  'Being Prepared':   { label: '👩‍🍳 Being Prepared',  bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', desc: 'Our bakers are preparing your cake with love.' },
  'Out for Delivery': { label: '🚚 Out for Delivery',  bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', desc: 'Your order is on its way to you!' },
  'Delivered':        { label: '🎂 Delivered',          bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300',  desc: 'Your order has been delivered. Enjoy!' },
};

const STATUS_STEPS = ['Pending', 'Confirmed', 'Being Prepared', 'Out for Delivery', 'Delivered'];

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
}

function ProgressTracker({ currentStatus, statusHistory }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);
  return (
    <div className="my-6">
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-indigo-500 z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
        {STATUS_STEPS.map((step, index) => {
          const completed = index < currentIndex;
          const active    = index === currentIndex;
          const histEntry = statusHistory?.find(h => h.new_status === step);
          return (
            <div key={step} className="relative z-10 flex flex-col items-center" style={{ minWidth: '80px' }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                ${completed ? 'bg-indigo-500 border-indigo-500 text-white' : ''}
                ${active    ? 'bg-white border-indigo-500 text-indigo-600 ring-4 ring-indigo-100' : ''}
                ${!completed && !active ? 'bg-white border-gray-300 text-gray-400' : ''}`}>
                {completed ? '✓' : index + 1}
              </div>
              <p className={`mt-1 text-xs text-center font-medium leading-tight max-w-[72px]
                ${active ? 'text-indigo-700' : completed ? 'text-indigo-500' : 'text-gray-400'}`}>
                {step}
              </p>
              {histEntry && (
                <p className="text-[10px] text-gray-400 text-center mt-0.5">{formatDateTime(histEntry.changed_at)}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden flex-col space-y-3">
        {STATUS_STEPS.map((step, index) => {
          const completed = index < currentIndex;
          const active    = index === currentIndex;
          const histEntry = statusHistory?.find(h => h.new_status === step);
          return (
            <div key={step} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border-2 mt-0.5
                ${completed ? 'bg-indigo-500 border-indigo-500 text-white' : ''}
                ${active    ? 'bg-white border-indigo-500 text-indigo-600 ring-4 ring-indigo-100' : ''}
                ${!completed && !active ? 'bg-white border-gray-300 text-gray-400' : ''}`}>
                {completed ? '✓' : index + 1}
              </div>
              <div>
                <p className={`text-sm font-medium ${active ? 'text-indigo-700' : completed ? 'text-indigo-500' : 'text-gray-400'}`}>{step}</p>
                {histEntry && <p className="text-xs text-gray-400">{formatDateTime(histEntry.changed_at)}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
    </div>
  );
}

export default function PublicOrderPage() {
  const { token } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    // ✅ Fix: /api prefix නැතුව backend order route එකට යනවා
    const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${apiBase}/order/${token}`);
        setOrder(response.data.order);
      } catch (err) {
        if (err.response?.status === 404) setError('not_found');
        else setError('server_error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight">🎂 Indiwari Cake</h1>
            <p className="text-sm text-gray-500 mt-1">QR Order Lookup</p>
          </div>
          <div className="inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="mt-3 text-gray-500 text-sm">Loading your order…</p>
        </div>
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-1">🎂 Indiwari Cake</h1>
          <p className="text-gray-400 text-sm mb-6">Order Lookup</p>
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-500 text-sm mb-4">
            We couldn't find an order matching this QR code. The code may be invalid, expired, or from a different system.
          </p>
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-400 font-mono break-all">Token: {token}</div>
          <p className="text-xs text-gray-400 mt-4">
            If you believe this is an error, please contact us at{' '}
            <a href="mailto:info@indiwari.lk" className="text-indigo-600 underline">info@indiwari.lk</a>
          </p>
        </div>
      </div>
    );
  }

  if (error === 'server_error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-1">🎂 Indiwari Cake</h1>
          <p className="text-gray-400 text-sm mb-6">Order Lookup</p>
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-6">We're having trouble loading this order right now. Please try again in a moment.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-xl text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const {
    order_reference, status, customer_name, customer_phone,
    delivery_address, delivery_date, special_instructions,
    payment_method, total_amount, created_at, items, status_history,
    delivery_person_name, delivery_person_phone, delivery_vehicle_type, delivery_vehicle_number,
  } = order;

  const statusConfig = STATUS_CONFIG[status] || { desc: '' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        <div className="text-center mb-2">
          <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight">🎂 Indiwari Cake</h1>
          <p className="text-gray-400 text-sm mt-0.5">Order Details</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-700 text-center">
          🔓 This page is public — anyone with this QR code link can view this order.
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order Reference</p>
          <h2 className="text-3xl font-extrabold text-indigo-700 tracking-wider mb-3">{order_reference}</h2>
          <StatusBadge status={status} />
          {statusConfig.desc && <p className="text-sm text-gray-500 mt-2">{statusConfig.desc}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Order Progress</h3>
          <ProgressTracker currentStatus={status} statusHistory={status_history} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Delivery Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <InfoRow label="Customer"      value={customer_name} />
            <InfoRow label="Phone"         value={customer_phone || '—'} />
            <InfoRow label="Delivery Date" value={formatDate(delivery_date)} />
            <InfoRow label="Payment"       value={payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : payment_method} />
            <InfoRow label="Order Placed"  value={formatDateTime(created_at)} className="sm:col-span-2" />
            <InfoRow label="Deliver To"    value={delivery_address} className="sm:col-span-2" />
            {delivery_person_name && (
              <>
                <InfoRow label="Delivery Person" value={delivery_person_name} />
                <InfoRow label="Delivery Contact" value={delivery_person_phone || '—'} />
                <InfoRow label="Delivery Vehicle" value={[delivery_vehicle_type, delivery_vehicle_number].filter(Boolean).join(' · ') || '—'} className="sm:col-span-2" />
              </>
            )}
            {special_instructions && (
              <InfoRow label="Special Instructions" value={special_instructions} className="sm:col-span-2" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Order Items ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h3>

          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wide">Item</th>
                  <th className="pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wide">Details</th>
                  <th className="pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wide text-right">Qty</th>
                  <th className="pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wide text-right">Unit Price</th>
                  <th className="pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wide text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="py-2">
                    <td className="py-3 font-medium text-gray-800">{item.menu_item_name}</td>
                    <td className="py-3 text-gray-500">
                      {[item.size, item.flavour].filter(Boolean).join(' · ') || '—'}
                      {item.decoration_note && (
                        <p className="text-xs text-gray-400 mt-0.5 italic">"{item.decoration_note}"</p>
                      )}
                    </td>
                    <td className="py-3 text-right text-gray-700">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-700">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 text-right font-semibold text-gray-800">{formatCurrency(item.item_subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="sm:hidden space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-gray-800 text-sm">{item.menu_item_name}</p>
                  <p className="font-bold text-indigo-700 text-sm ml-2">{formatCurrency(item.item_subtotal)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {[item.size, item.flavour].filter(Boolean).join(' · ') || 'Standard'}
                </p>
                {item.decoration_note && (
                  <p className="text-xs text-gray-400 italic mt-1">"{item.decoration_note}"</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{item.quantity} × {formatCurrency(item.unit_price)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Total Amount</span>
            <span className="text-xl font-extrabold text-indigo-700">{formatCurrency(total_amount)}</span>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 pb-6 space-y-1">
          <p>Thank you for choosing <span className="font-semibold text-indigo-600">Indiwari Cake</span> 🎂</p>
          <p>Questions? Contact us at <a href="mailto:info@indiwari.lk" className="text-indigo-500 underline">info@indiwari.lk</a></p>
        </div>

      </div>
    </div>
  );
}
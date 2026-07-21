import { Fragment, useState } from 'react';
import api from '../../api/axios';

const STATUS_ORDER = ['Pending', 'Confirmed', 'Being Prepared', 'Out for Delivery', 'Delivered'];
const ADMIN_NEXT = { Pending: 'Confirmed', Confirmed: 'Being Prepared' };

export default function StatusUpdatePanel({ orderId, currentStatus, onStatusUpdated }) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const nextStatus = ADMIN_NEXT[currentStatus] || null;

  const update = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const { data } = await api.patch(`/admin/orders/${orderId}/status`, { status: nextStatus });
      setSuccessMsg(`Status updated to ${nextStatus}.`);
      onStatusUpdated?.(data.order.status);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Order Progress</h3>
      <div className="flex items-center justify-between mb-6 overflow-x-auto pb-1">
        {STATUS_ORDER.map((status, index) => (
          <Fragment key={status}>
            <div className="flex flex-col items-center min-w-[64px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${index < currentIndex ? 'bg-pink-600 border-pink-600 text-white' : index === currentIndex ? 'bg-pink-100 border-pink-600 text-pink-700' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                {index < currentIndex ? '✓' : index + 1}
              </div>
              <span className={`text-xs text-center mt-1 ${index === currentIndex ? 'text-pink-700 font-semibold' : 'text-gray-500'}`}>{status}</span>
            </div>
            {index < STATUS_ORDER.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${index < currentIndex ? 'bg-pink-400' : 'bg-gray-200'}`} />}
          </Fragment>
        ))}
      </div>

      {nextStatus ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button onClick={update} disabled={loading} className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold disabled:opacity-60">
            {loading ? 'Updating...' : `Update to ${nextStatus}`}
          </button>
          <p className="text-xs text-gray-500">After “Being Prepared”, the order becomes available in the delivery dashboard.</p>
        </div>
      ) : currentStatus === 'Being Prepared' ? (
        <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
          Waiting for an available delivery person to accept this order.
        </div>
      ) : currentStatus === 'Out for Delivery' ? (
        <div className="rounded-xl bg-purple-50 border border-purple-200 px-4 py-3 text-sm text-purple-700">
          The assigned delivery person is delivering this order.
        </div>
      ) : (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Order delivery is complete.</div>
      )}

      {successMsg && <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{successMsg}</div>}
      {errorMsg && <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{errorMsg}</div>}
    </div>
  );
}

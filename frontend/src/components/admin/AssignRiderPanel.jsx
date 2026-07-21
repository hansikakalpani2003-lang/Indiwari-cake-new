// frontend/src/components/admin/AssignRiderPanel.jsx
//
// Drop this into AdminOrderDetail.jsx wherever the order's status/actions are
// shown, e.g.:
//
//   {order.status === 'Being Prepared' && (
//     <AssignRiderPanel orderId={order.id} onAssigned={onStatusUpdated} />
//   )}
//   {order.status === 'Out for Delivery' && order.rider_name && (
//     <p>Out with {order.rider_name} — <a href={`tel:${order.rider_phone}`}>Call</a></p>
//   )}
//
// Note: to show rider_name/rider_phone on the order detail, join delivery_riders
// in your GET /api/admin/orders/:id query (LEFT JOIN delivery_riders ON rider_id).

import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AssignRiderPanel({ orderId, onAssigned }) {
  const [riders, setRiders] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/riders', { params: { status: 'active' } })
      .then((res) => setRiders(res.data.riders))
      .catch(() => setError('Failed to load available riders.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAssign() {
    if (!selected) return;
    setAssigning(true);
    setError('');
    try {
      await api.post(`/admin/riders/${selected}/assign`, { order_id: orderId });
      onAssigned?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign rider.');
    } finally {
      setAssigning(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-400">Loading riders…</p>;

  if (riders.length === 0) {
    return (
      <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
        No riders are currently Active. Set a rider Active from the Riders page before assigning this order.
      </p>
    );
  }

  const selectedRider = riders.find((r) => String(r.id) === String(selected));

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assign a Rider</p>
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="">Select a rider…</option>
          {riders.map((r) => (
            <option key={r.id} value={r.id}>{r.name} — {r.vehicle_number}</option>
          ))}
        </select>

        {selectedRider && (
          <a
            href={`tel:${selectedRider.phone}`}
            className="px-3 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm hover:bg-white transition"
          >
            📞 Call {selectedRider.name.split(' ')[0]}
          </a>
        )}

        <button
          onClick={handleAssign}
          disabled={!selected || assigning}
          className="px-4 py-2 rounded-xl bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 transition disabled:opacity-50"
        >
          {assigning ? 'Assigning…' : 'Assign & Mark Out for Delivery'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

/**
 * AssignDeliveryPanel.jsx
 * Lets an admin assign (or reassign / clear) which delivery person is
 * responsible for delivering an order. Usually done right after confirming
 * the order, but works at any stage before it's Delivered.
 */

import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AssignDeliveryPanel = ({ orderId, currentDeliveryId, currentDeliveryName, disabled, onAssigned }) => {
  const [personnel, setPersonnel] = useState([]);
  const [selectedId, setSelectedId] = useState(currentDeliveryId || '');
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.get('/admin/delivery-personnel')
      .then((res) => setPersonnel(res.data.personnel || []))
      .catch(() => setErrorMsg('Could not load delivery personnel list.'))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    setSelectedId(currentDeliveryId || '');
  }, [currentDeliveryId]);

  const handleAssign = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = { delivery_person_id: selectedId ? Number(selectedId) : null };
      const res = await api.patch(`/admin/orders/${orderId}/assign-delivery`, payload);
      setSuccessMsg(selectedId ? '✓ Delivery person assigned.' : '✓ Assignment cleared.');
      if (onAssigned) onAssigned(res.data.order);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update delivery assignment.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanged = String(selectedId || '') !== String(currentDeliveryId || '');

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-1">Assign Delivery Person</h3>
      <p className="text-xs text-gray-500 mb-4">
        Pick who will deliver this order. They'll see it in their dashboard right away.
      </p>

      {currentDeliveryName && (
        <p className="text-sm text-gray-700 mb-3">
          Currently assigned to: <span className="font-semibold text-pink-700">{currentDeliveryName}</span>
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={loadingList || disabled}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-50"
        >
          <option value="">— Unassigned —</option>
          {personnel.map((p) => (
            <option key={p.id} value={p.id}>{p.name}{p.phone ? ` (${p.phone})` : ''}</option>
          ))}
        </select>

        <button
          onClick={handleAssign}
          disabled={saving || loadingList || disabled || !hasChanged}
          className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save Assignment'}
        </button>
      </div>

      {disabled && (
        <p className="text-xs text-gray-400 mt-2">This order has already been delivered — assignment is locked.</p>
      )}

      {successMsg && (
        <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default AssignDeliveryPanel;
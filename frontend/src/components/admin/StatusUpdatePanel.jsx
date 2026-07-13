/**
 * StatusUpdatePanel.jsx
 */

import { useState, Fragment } from 'react';
import api from '../../api/axios';

const STATUS_ORDER = [
  'Pending',
  'Confirmed',
  'Being Prepared',
  'Out for Delivery',
  'Delivered',
];

const STATUS_LABELS = {
  'Pending':          { label: 'Pending',          colour: 'bg-yellow-100 text-yellow-800 border-yellow-300'  },
  'Confirmed':        { label: 'Confirmed',         colour: 'bg-blue-100 text-blue-800 border-blue-300'        },
  'Being Prepared':   { label: 'Being Prepared',    colour: 'bg-orange-100 text-orange-800 border-orange-300'  },
  'Out for Delivery': { label: 'Out for Delivery',  colour: 'bg-purple-100 text-purple-800 border-purple-300'  },
  'Delivered':        { label: 'Delivered',         colour: 'bg-green-100 text-green-800 border-green-300'     },
};

const StatusUpdatePanel = ({ orderId, currentStatus, onStatusUpdated }) => {
  const [loading,    setLoading]    = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg,   setErrorMsg]   = useState('');

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const nextStatus   = currentIndex < STATUS_ORDER.length - 1
    ? STATUS_ORDER[currentIndex + 1]
    : null;
  const isDelivered  = currentStatus === 'Delivered';

  const handleUpdate = async (newStatus) => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setSuccessMsg(`✓ Status updated to "${newStatus}"`);
      if (onStatusUpdated) {
        onStatusUpdated(res.data.order.status); // ✅ FIX: .status add කළා
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Update Order Status</h3>

      <div className="flex items-center justify-between mb-6 overflow-x-auto pb-1">
        {STATUS_ORDER.map((status, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent   = idx === currentIndex;

          return (
            <Fragment key={status}>
              <div className="flex flex-col items-center min-w-[60px]">
                <div className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2',
                  isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : '',
                  isCurrent   ? 'bg-indigo-100 border-indigo-600 text-indigo-700' : '',
                  !isCompleted && !isCurrent ? 'bg-gray-100 border-gray-300 text-gray-400' : '',
                ].join(' ')}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={[
                  'text-xs text-center mt-1 leading-tight',
                  isCurrent   ? 'text-indigo-700 font-semibold' : '',
                  isCompleted ? 'text-indigo-500' : '',
                  !isCompleted && !isCurrent ? 'text-gray-400' : '',
                ].join(' ')}>
                  {status}
                </span>
              </div>

              {idx < STATUS_ORDER.length - 1 && (
                <div className={[
                  'flex-1 h-0.5 mx-1',
                  idx < currentIndex ? 'bg-indigo-400' : 'bg-gray-200',
                ].join(' ')} />
              )}
            </Fragment>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600 font-medium">Current:</span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_LABELS[currentStatus]?.colour || ''}`}>
          {currentStatus}
        </span>
      </div>

      {isDelivered ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <span className="text-green-600 font-semibold text-sm">🎉 Order Complete — All stages delivered.</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={() => handleUpdate(nextStatus)}
            disabled={loading || !nextStatus}
            className={[
              'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all',
              loading
                ? 'bg-indigo-300 text-white cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow',
            ].join(' ')}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Updating…
              </>
            ) : (
              `→ Update to "${nextStatus}"`
            )}
          </button>

          <p className="text-xs text-gray-500">
            Only the next stage can be selected. Status cannot be reversed.
          </p>
        </div>
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

export default StatusUpdatePanel;
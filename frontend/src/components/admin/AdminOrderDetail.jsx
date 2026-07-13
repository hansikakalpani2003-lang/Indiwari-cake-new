// frontend/src/components/admin/AdminOrderDetail.jsx
import { useEffect, useState } from 'react';
import api                     from '../../api/axios';
import StatusBadge             from '../common/StatusBadge';
import StatusUpdatePanel       from './StatusUpdatePanel';
import LoadingSpinner          from '../common/LoadingSpinner';
import { formatCurrency }      from '../../utils/formatCurrency';
import { formatDate }          from '../../utils/formatDate';

export default function AdminOrderDetail({ orderId, onClose, onStatusUpdated }) {
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setError('');
    api.get(`/admin/orders/${orderId}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError('Failed to load order details.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  function handleStatusUpdated(newStatus) {
    setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
    onStatusUpdated();
  }

  return (
    <>
      {/* ✅ Fixed: bg-black/40 (Tailwind v4 syntax) */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <aside className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Order Detail</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading && <LoadingSpinner />}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!loading && !error && order && (
            <>
              <section>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Order Reference</p>
                    <p className="text-xl font-bold font-mono text-gray-900">{order.order_reference}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Customer</dt>
                    <dd className="font-medium text-gray-800">{order.customer_name}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Email</dt>
                    <dd className="font-medium text-gray-800 break-all">{order.customer_email}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Phone</dt>
                    <dd className="font-medium text-gray-800">{order.customer_phone || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Placed</dt>
                    <dd className="font-medium text-gray-800">{formatDate(order.created_at)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-500">Delivery Address</dt>
                    <dd className="font-medium text-gray-800">{order.delivery_address}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Delivery Date</dt>
                    <dd className="font-medium text-gray-800">{formatDate(order.delivery_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Total</dt>
                    <dd className="font-bold text-pink-700 text-base">{formatCurrency(order.total_amount)}</dd>
                  </div>
                  {order.special_instructions && (
                    <div className="col-span-2">
                      <dt className="text-gray-500">Special Instructions</dt>
                      <dd className="font-medium text-gray-800">{order.special_instructions}</dd>
                    </div>
                  )}
                </dl>
              </section>

              <hr className="border-gray-100" />

              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs">
                      <tr>
                        <th className="px-3 py-2 text-left">Item</th>
                        <th className="px-3 py-2 text-left">Size</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2">
                            <p className="font-medium text-gray-800">{item.menu_item_name}</p>
                            {item.flavour && <p className="text-xs text-gray-500">Flavour: {item.flavour}</p>}
                            {item.decoration_note && <p className="text-xs text-gray-500">Note: {item.decoration_note}</p>}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{item.size || '—'}</td>
                          <td className="px-3 py-2 text-center text-gray-700">{item.quantity}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.item_subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200">
                        <td colSpan={3} className="px-3 py-2 text-right font-semibold text-gray-700">Total</td>
                        <td className="px-3 py-2 text-right font-bold text-pink-700">{formatCurrency(order.total_amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>

              <hr className="border-gray-100" />

              {order.qr_code_data_url && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">QR Code</h3>
                  <div className="flex items-center gap-5">
                    <img src={order.qr_code_data_url} alt={`QR code for order ${order.order_reference}`} className="w-32 h-32 border border-gray-200 rounded-lg" />
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Token: <code className="text-gray-700">{order.qr_code_token}</code></p>
                      <a href={order.qr_code_data_url} download={`${order.order_reference}-QR.png`} className="inline-block px-4 py-2 bg-gray-800 text-white text-xs rounded-lg hover:bg-gray-900 transition">
                        ⬇ Download QR
                      </a>
                    </div>
                  </div>
                </section>
              )}

              <hr className="border-gray-100" />

              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Status History</h3>
                {(order.status_history || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No status changes recorded yet.</p>
                ) : (
                  <ol className="relative border-l border-gray-200 ml-3 space-y-4">
                    {(order.status_history || []).map((h) => (
                      <li key={h.id} className="ml-5">
                        <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-pink-100 rounded-full ring-4 ring-white">
                          <span className="w-2 h-2 bg-pink-500 rounded-full" />
                        </span>
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">{h.old_status || 'New'}</span>
                          <span className="text-gray-400 mx-1">→</span>
                          <span className="font-medium text-pink-700">{h.new_status}</span>
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(h.changed_at)} · by {h.changed_by_name || 'System'}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <hr className="border-gray-100" />

              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Update Status</h3>
                <StatusUpdatePanel
                  orderId={order.id}
                  currentStatus={order.status}
                  onStatusUpdated={handleStatusUpdated}
                />
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
/**
 * AdminCustomersPage.jsx
 * Admin page for managing all customer accounts.
 *
 * Layout:
 *   - Left/top: CustomerTable with all customers, sortable and searchable
 *   - Right/bottom: Customer detail slide-out panel showing profile + order history
 *
 * Data:
 *   - On mount: GET /api/admin/customers → populates the table
 *   - On row click: GET /api/admin/customers/:id → loads full profile + orders
 *
 * Used by: App.jsx (admin protected route)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CustomerTable  from '../components/admin/CustomerTable';
import StatusBadge    from '../components/common/StatusBadge';
import { formatDate }     from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

export default function AdminCustomersPage() {
  // ── Customer list state ───────────────────────────────────────────────────
  const [customers, setCustomers]         = useState([]);
  const [listLoading, setListLoading]     = useState(true);
  const [listError, setListError]         = useState('');

  // ── Selected customer detail state ────────────────────────────────────────
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detail, setDetail]               = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError]     = useState('');

  // ── Load full customer list on mount ──────────────────────────────────────
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/admin/customers');
        setCustomers(res.data);
      } catch {
        setListError('Failed to load customers. Please refresh the page.');
      } finally {
        setListLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // ── Load customer detail when a row is selected ───────────────────────────
  useEffect(() => {
    if (!selectedCustomer) return;

    const fetchDetail = async () => {
      setDetailLoading(true);
      setDetailError('');
      setDetail(null);
      try {
        const res = await api.get(`/admin/customers/${selectedCustomer.id}`);
        setDetail(res.data);
      } catch {
        setDetailError('Failed to load customer details.');
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [selectedCustomer]);

  // ── Handle row click ──────────────────────────────────────────────────────
  const handleSelectCustomer = (customer) => {
    if (selectedCustomer?.id === customer.id) {
      // Clicking the same row closes the panel
      setSelectedCustomer(null);
      setDetail(null);
    } else {
      setSelectedCustomer(customer);
    }
  };

  // ── Close panel ───────────────────────────────────────────────────────────
  const handleClose = () => {
    setSelectedCustomer(null);
    setDetail(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFF8F3]">

      {/* Page Header */}
      <div className="bg-white border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-500 text-xs font-semibold tracking-widest uppercase mb-2">
                Customer Insights
              </p>
              <h1 className="font-serif italic text-3xl font-bold text-gray-800">Customer Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                View all registered customers, their order history, and lifetime spend.
              </p>
            </div>
            <Link
              to="/admin"
              className="text-sm text-gray-600 hover:text-pink-600 font-semibold transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {listError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">
            {listError}
          </div>
        )}

        {listLoading ? (
          <div className="text-center py-16 text-gray-400">Loading customers…</div>
        ) : (
          <div className="flex gap-5 items-start">

            {/* ── Customer Table ─────────────────────────────────────────── */}
            <div className={`flex-1 min-w-0 transition-all bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden ${selectedCustomer ? 'hidden lg:block' : ''}`}>
              <CustomerTable
                customers={customers}
                onSelectCustomer={handleSelectCustomer}
                selectedId={selectedCustomer?.id || null}
              />
            </div>

            {/* ── Customer Detail Panel ─────────────────────────────────── */}
            {selectedCustomer && (
              <div className="w-full lg:w-[480px] flex-shrink-0 bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">

                {/* Panel Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100 bg-pink-50/50">
                  <div>
                    <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
                    <p className="text-xs text-gray-400">{selectedCustomer.email}</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-pink-600 hover:bg-pink-100 transition-colors"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Panel Body */}
                <div className="p-5 overflow-y-auto max-h-[80vh]">

                  {detailLoading && (
                    <div className="text-center py-8 text-gray-400">Loading details…</div>
                  )}

                  {detailError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                      {detailError}
                    </div>
                  )}

                  {detail && !detailLoading && (
                    <>
                      {/* ── Stats Strip ── */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-pink-50 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-pink-700">
                            {detail.stats?.total_orders ?? 0}
                          </p>
                          <p className="text-xs text-pink-500 mt-0.5">Total Orders</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-green-700 leading-tight">
                            {formatCurrency(detail.stats?.lifetime_spend ?? 0)}
                          </p>
                          <p className="text-xs text-green-500 mt-0.5">Lifetime Spend</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-amber-700">
                            {detail.stats?.pending_count ?? 0}
                          </p>
                          <p className="text-xs text-amber-500 mt-0.5">Pending</p>
                        </div>
                      </div>

                      {/* ── Profile Details ── */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                        <h3 className="font-serif text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                          Profile
                        </h3>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Phone</span>
                          <span className="text-gray-800 font-medium">
                            {detail.phone || <span className="text-gray-300">Not set</span>}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Member since</span>
                          <span className="text-gray-800 font-medium">
                            {formatDate(detail.created_at)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Last order</span>
                          <span className="text-gray-800 font-medium">
                            {detail.stats?.last_order_date
                              ? formatDate(detail.stats.last_order_date)
                              : <span className="text-gray-300">Never</span>
                            }
                          </span>
                        </div>
                        {detail.delivery_address && (
                          <div className="pt-1">
                            <span className="text-xs text-gray-500 block mb-1">Default address</span>
                            <span className="text-sm text-gray-800">{detail.delivery_address}</span>
                          </div>
                        )}
                      </div>

                      {/* ── Order History ── */}
                      <div>
                        <h3 className="font-serif text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                          Order History ({detail.orders?.length ?? 0})
                        </h3>

                        {!detail.orders || detail.orders.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">
                            No orders placed yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {detail.orders.map(order => (
                              <div
                                key={order.id}
                                className="border border-pink-100 rounded-xl p-3 hover:border-pink-300 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                      {order.order_reference}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      {order.item_count} item{order.item_count !== 1 ? 's' : ''} ·
                                      Delivery: {formatDate(order.delivery_date)}
                                    </p>
                                  </div>
                                  <StatusBadge status={order.status} />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs text-gray-400">
                                    Placed {formatDate(order.created_at)}
                                  </span>
                                  <span className="text-sm font-bold text-gray-800">
                                    {formatCurrency(order.total_amount)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
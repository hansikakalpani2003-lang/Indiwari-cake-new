// frontend/src/pages/AdminOrdersPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link }                             from 'react-router-dom';
import api                                  from '../api/axios';
import AdminOrderTable                      from '../components/admin/AdminOrderTable';
import AdminOrderDetail                     from '../components/admin/AdminOrderDetail';
import LoadingSpinner                       from '../components/common/LoadingSpinner';

const STATUS_OPTIONS = [
  '', 'Pending', 'Confirmed', 'Being Prepared', 'Out for Delivery', 'Delivered',
];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter,   setDateFilter]   = useState('');
  const [search,       setSearch]       = useState('');
  const [searchInput,  setSearchInput]  = useState('');

  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 20;

  const [orders,          setOrders]          = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (statusFilter) params.set('status', statusFilter);
      if (dateFilter)   params.set('date',   dateFilter);
      if (search)       params.set('search', search);

      // ✅ /api/ prefix ඉවත් කළා
      const res = await api.get(`/admin/orders?${params.toString()}`);
      setOrders(res.data.orders);
      setTotalPages(res.data.total_pages);
      setTotalCount(res.data.total_count);
    } catch (err) {
      setError('Failed to load orders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function handleStatusChange(e) {
    setStatusFilter(e.target.value);
    setPage(1);
  }

  function handleDateChange(e) {
    setDateFilter(e.target.value);
    setPage(1);
  }

  function handleClearFilters() {
    setStatusFilter('');
    setDateFilter('');
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  function handleStatusUpdated() {
    fetchOrders();
  }

  const hasActiveFilters = statusFilter || dateFilter || search;

  return (
    <div className="min-h-screen bg-[#FFF8F3] p-6">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-pink-500 text-xs font-semibold tracking-widest uppercase mb-2">
              Order Management
            </p>
            <h1 className="font-serif italic text-3xl font-bold text-gray-800">Orders</h1>
            {!loading && (
              <p className="text-sm text-gray-500 mt-1">
                {totalCount} order{totalCount !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          <Link
            to="/admin"
            className="text-sm text-gray-600 hover:text-pink-600 font-semibold transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5 mb-5 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Search customer / reference
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. Kamal or IC-2026..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="min-w-40">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s || 'All statuses'}</option>
              ))}
            </select>
          </div>

          <div className="min-w-40">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Delivery date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition self-end"
            >
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
              <AdminOrderTable
                orders={orders}
                onSelectOrder={setSelectedOrderId}
                selectedOrderId={selectedOrderId}
              />
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-40 hover:bg-white transition bg-white/60"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-40 hover:bg-white transition bg-white/60"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {selectedOrderId && (
          <AdminOrderDetail
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
            onStatusUpdated={handleStatusUpdated}
          />
        )}
      </div>
    </div>
  );
}
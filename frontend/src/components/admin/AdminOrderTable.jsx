// frontend/src/components/admin/AdminOrderTable.jsx
import { useState } from 'react';
import StatusBadge   from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate }     from '../../utils/formatDate';

const SORT_FIELDS = {
  order_reference: 'Reference',
  customer_name:   'Customer',
  delivery_date:   'Delivery Date',
  total_amount:    'Total',
  status:          'Status',
  created_at:      'Placed',
};

export default function AdminOrderTable({ orders, onSelectOrder, selectedOrderId }) {
  const [sortField, setSortField]       = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  const sorted = [...orders].sort((a, b) => {
    const valA = a[sortField] ?? '';
    const valB = b[sortField] ?? '';
    const dir  = sortDirection === 'asc' ? 1 : -1;

    if (typeof valA === 'number') return (valA - valB) * dir;
    return String(valA).localeCompare(String(valB)) * dir;
  });

  function SortIcon({ field }) {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return (
      <span className="text-pink-500 ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
        No orders match the selected filters.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {Object.entries(SORT_FIELDS).map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="px-5 py-3 text-left cursor-pointer select-none hover:bg-gray-100 transition whitespace-nowrap"
                >
                  {label}
                  <SortIcon field={field} />
                </th>
              ))}
              <th className="px-5 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((order) => (
              <tr
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className={`cursor-pointer hover:bg-pink-50 transition ${
                  selectedOrderId === order.id ? 'bg-pink-50 border-l-4 border-pink-400' : ''
                }`}
              >
                <td className="px-5 py-3 font-mono font-medium text-gray-800 whitespace-nowrap">
                  {order.order_reference}
                </td>
                <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                  {order.customer_name}
                </td>
                <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                  {formatDate(order.delivery_date)}
                </td>
                <td className="px-5 py-3 text-right font-medium text-gray-800 whitespace-nowrap">
                  {formatCurrency(order.total_amount)}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectOrder(order.id); }}
                    className="text-pink-600 hover:underline text-xs font-medium"
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
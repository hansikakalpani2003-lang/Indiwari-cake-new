/**
 * CustomerTable.jsx
 * Admin component displaying the full customer list in a sortable, searchable table.
 *
 * Props:
 *   - customers:         Array of customer objects from GET /api/admin/customers
 *   - onSelectCustomer:  Callback(customer) — fires when admin clicks a customer row
 *   - selectedId:        number|null — highlights the currently selected row
 *
 * Features:
 *   - Search by name or email (client-side filter)
 *   - Sort by: Lifetime Spend (default), Total Orders, Name, Join Date
 *   - Highlights selected row in indigo
 *   - Shows lifetime spend in LKR, last order date, total & pending count
 *
 * Used by: AdminCustomersPage.jsx
 */

import { useState, useMemo } from 'react';
import { formatDate }     from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

// ── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'lifetime_spend', label: 'Lifetime Spend' },
  { value: 'total_orders',   label: 'Total Orders'   },
  { value: 'name',           label: 'Name (A–Z)'     },
  { value: 'created_at',     label: 'Join Date'      },
];

export default function CustomerTable({ customers = [], onSelectCustomer, selectedId }) {
  const [search, setSearch]     = useState('');
  const [sortBy, setSortBy]     = useState('lifetime_spend');
  const [sortDir, setSortDir]   = useState('desc');

  // ── Client-side filter + sort ─────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...customers];

    // Filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'name') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [customers, search, sortBy, sortDir]);

  // ── Toggle sort direction ─────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const sortIcon = (field) => {
    if (sortBy !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-indigo-500 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

      {/* Controls */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={sortBy}
          onChange={e => { setSortBy(e.target.value); setSortDir('desc'); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400">
          {displayed.length} customer{displayed.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:text-gray-700 select-none"
                onClick={() => handleSort('name')}
              >
                Customer {sortIcon('name')}
              </th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Phone</th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:text-gray-700 select-none"
                onClick={() => handleSort('total_orders')}
              >
                Orders {sortIcon('total_orders')}
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:text-gray-700 select-none"
                onClick={() => handleSort('lifetime_spend')}
              >
                Lifetime Spend {sortIcon('lifetime_spend')}
              </th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Last Order</th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:text-gray-700 select-none hidden lg:table-cell"
                onClick={() => handleSort('created_at')}
              >
                Joined {sortIcon('created_at')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {displayed.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  No customers found.
                </td>
              </tr>
            )}

            {displayed.map(customer => (
              <tr
                key={customer.id}
                onClick={() => onSelectCustomer(customer)}
                className={`cursor-pointer transition-colors ${
                  selectedId === customer.id
                    ? 'bg-indigo-50 border-l-4 border-l-indigo-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Name + Email */}
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{customer.email}</p>
                </td>

                {/* Phone */}
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                  {customer.phone || <span className="text-gray-300">—</span>}
                </td>

                {/* Total Orders */}
                <td className="px-4 py-3 text-right">
                  <span className="font-medium text-gray-800">{customer.total_orders}</span>
                </td>

                {/* Lifetime Spend */}
                <td className="px-4 py-3 text-right">
                  <span className={`font-semibold ${
                    parseFloat(customer.lifetime_spend) > 0
                      ? 'text-indigo-700'
                      : 'text-gray-400'
                  }`}>
                    {formatCurrency(customer.lifetime_spend)}
                  </span>
                </td>

                {/* Last Order Date */}
                <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">
                  {customer.last_order_date
                    ? formatDate(customer.last_order_date)
                    : <span className="text-gray-300">—</span>
                  }
                </td>

                {/* Join Date */}
                <td className="px-4 py-3 text-right text-gray-500 hidden lg:table-cell">
                  {formatDate(customer.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// frontend/src/pages/AdminReportsPage.jsx
import { useEffect, useState }              from 'react';
import api                                  from '../api/axios';
import { DailyChart, BestSellersChart }     from '../components/admin/ReportCharts';
import LoadingSpinner                       from '../components/common/LoadingSpinner';
import { formatCurrency }                   from '../utils/formatCurrency';

export default function AdminReportsPage() {
  const [dailyData,    setDailyData]    = useState([]);
  const [bestSellers,  setBestSellers]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [dailyRes, bestRes] = await Promise.all([
          api.get('/api/admin/reports/daily'),
          api.get('/api/admin/reports/bestsellers'),
        ]);
        setDailyData(dailyRes.data);
        setBestSellers(bestRes.data);
      } catch (err) {
        setError('Failed to load report data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute totals for summary row
  const totalOrders  = dailyData.reduce((s, d) => s + d.order_count, 0);
  const totalRevenue = dailyData.reduce((s, d) => s + d.revenue, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Last 30 days — updated in real time</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* ── 30-day summary KPIs ── */}
      {dailyData.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-500">Total Orders (30d)</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-500">Total Revenue (30d)</p>
            <p className="text-3xl font-bold text-pink-700 mt-1">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>
      )}

      {/* ── Daily Chart ── */}
      <DailyChart data={dailyData} />

      {/* ── Daily Data Table (text fallback) ── */}
      {dailyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Daily Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-center">Orders</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...dailyData].reverse().map((row) => (
                  <tr key={row.date} className="hover:bg-gray-50">
                    <td className="px-5 py-2 font-mono text-gray-700">{row.date}</td>
                    <td className="px-5 py-2 text-center text-gray-700">{row.order_count}</td>
                    <td className="px-5 py-2 text-right font-medium text-gray-800">
                      {formatCurrency(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                  <td className="px-5 py-3 text-gray-700">Total</td>
                  <td className="px-5 py-3 text-center text-gray-900">{totalOrders}</td>
                  <td className="px-5 py-3 text-right text-pink-700">
                    {formatCurrency(totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Best-sellers Chart ── */}
      <BestSellersChart data={bestSellers} />

      {/* ── Best-sellers Table ── */}
      {bestSellers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Best-Sellers Detail</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Rank</th>
                  <th className="px-5 py-3 text-left">Item</th>
                  <th className="px-5 py-3 text-center">Units Sold</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bestSellers.map((item, i) => (
                  <tr key={item.menu_item_name} className="hover:bg-gray-50">
                    <td className="px-5 py-2 text-gray-500 font-medium">#{i + 1}</td>
                    <td className="px-5 py-2 font-medium text-gray-800">{item.menu_item_name}</td>
                    <td className="px-5 py-2 text-center text-gray-700">{item.total_sold}</td>
                    <td className="px-5 py-2 text-right font-medium text-gray-800">
                      {formatCurrency(item.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
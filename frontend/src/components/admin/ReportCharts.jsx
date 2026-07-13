// frontend/src/components/admin/ReportCharts.jsx
import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register only the components we use (tree-shaking friendly)
Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ── Daily Orders & Revenue Chart ────────────────
export function DailyChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels   = data.map((d) => d.date.slice(5)); // MM-DD
    const counts   = data.map((d) => d.order_count);
    const revenues = data.map((d) => d.revenue);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Orders',
            data: counts,
            backgroundColor: 'rgba(236, 72, 153, 0.7)', // pink-500
            borderRadius: 4,
            yAxisID: 'yOrders',
          },
          {
            label: 'Revenue (LKR)',
            data: revenues,
            backgroundColor: 'rgba(99, 102, 241, 0.7)', // indigo-500
            borderRadius: 4,
            yAxisID: 'yRevenue',
          },
        ],
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.datasetIndex === 1) {
                  return ` LKR ${Number(ctx.raw).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
                }
                return ` ${ctx.raw} orders`;
              },
            },
          },
        },
        scales: {
          yOrders: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Orders' },
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
          yRevenue: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Revenue (LKR)' },
            beginAtZero: true,
            grid: { drawOnChartArea: false },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [data]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        Daily Orders & Revenue — Last 30 Days
      </h2>
      {(!data || data.length === 0) ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          No order data for the last 30 days.
        </p>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}

// ── Best-Sellers Chart ───────────────────────────
export function BestSellersChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels   = data.map((d) => d.menu_item_name);
    const sold     = data.map((d) => d.total_sold);
    const revenues = data.map((d) => d.total_revenue);

    // Generate N distinct colours
    const colours = [
      '#f43f5e','#ec4899','#a855f7','#6366f1','#3b82f6',
      '#06b6d4','#10b981','#f59e0b','#ef4444','#84cc16',
    ];

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Units Sold',
            data: sold,
            backgroundColor: colours.slice(0, data.length),
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: 'y',        // horizontal bars
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => {
                const rev = revenues[ctx.dataIndex];
                return `Revenue: LKR ${Number(rev).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: 'Units sold' },
            ticks: { stepSize: 1 },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [data]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        Best Sellers — Last 30 Days (excluding Pending orders)
      </h2>
      {(!data || data.length === 0) ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          No sales data for the last 30 days.
        </p>
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
}
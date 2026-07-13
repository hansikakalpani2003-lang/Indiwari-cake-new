'use strict';

const db = require('../config/db');

// ── Daily Orders + Revenue (Last 30 Days) ───────────────────────────────────────
async function getDailySummary() {
  const [rows] = await db.query(
    `SELECT
       DATE(created_at) AS date,
       COUNT(*)         AS order_count,
       SUM(total_amount) AS revenue
     FROM orders
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY DATE(created_at)
     ORDER BY date DESC`
  );

  return rows.map((row) => ({
    date: row.date,
    order_count: Number(row.order_count),
    revenue: parseFloat(row.revenue || 0),
  }));
}

// ── Best Sellers (Last 30 Days) ──────────────────────────────────────────────────
async function getBestSellers() {
  const [rows] = await db.query(
    `SELECT
       oi.menu_item_name,
       SUM(oi.quantity)      AS total_sold,
       SUM(oi.item_subtotal) AS total_revenue
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       AND o.status != 'Pending'
     GROUP BY oi.menu_item_name
     ORDER BY total_sold DESC
     LIMIT 10`
  );

  return rows.map((row) => ({
    menu_item_name: row.menu_item_name,
    total_sold: Number(row.total_sold),
    total_revenue: parseFloat(row.total_revenue || 0),
  }));
}

// ── Dashboard Summary Cards ───────────────────────────────────────────────────────
async function getDashboardSummary() {
  const [
    [[ordersTodayRow]],
    [[revenueTodayRow]],
    [[pendingRow]],
    [[outForDeliveryRow]],
  ] = await Promise.all([
    db.query(`SELECT COUNT(*) AS count FROM orders WHERE DATE(created_at) = CURDATE()`),
    db.query(`SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE DATE(created_at) = CURDATE()`),
    db.query(`SELECT COUNT(*) AS count FROM orders WHERE status = 'Pending'`),
    db.query(`SELECT COUNT(*) AS count FROM orders WHERE status = 'Out for Delivery'`),
  ]);

  return {
    orders_today: Number(ordersTodayRow.count),
    revenue_today: parseFloat(revenueTodayRow.total || 0),
    pending_count: Number(pendingRow.count),
    out_for_delivery_count: Number(outForDeliveryRow.count),
  };
}

module.exports = {
  getDailySummary,
  getBestSellers,
  getDashboardSummary,
};
// backend/src/controllers/reportController.js
const reportService = require('../services/reportService');
const asyncWrapper = require('../utils/asyncWrapper');

/**
 * GET /api/admin/reports/summary
 * Returns 4 operational metrics for the dashboard header cards.
 */
const getDashboardSummary = asyncWrapper(async (req, res) => {
  const summary = await reportService.getDashboardSummary();
  res.json(summary);
});

/**
 * GET /api/admin/reports/daily
 * Returns per-day order count + revenue for last 30 days.
 * Used by the daily bar chart on AdminReportsPage.
 */
const getDailySummary = asyncWrapper(async (req, res) => {
  const rows = await reportService.getDailySummary();
  res.json(rows);
});

/**
 * GET /api/admin/reports/bestsellers
 * Returns top-10 menu items by quantity sold in last 30 days.
 * Used by the best-sellers horizontal bar chart on AdminReportsPage.
 */
const getBestSellers = asyncWrapper(async (req, res) => {
  const rows = await reportService.getBestSellers();
  res.json(rows);
});

module.exports = { getDashboardSummary, getDailySummary, getBestSellers };
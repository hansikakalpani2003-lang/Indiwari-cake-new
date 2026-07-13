// backend/src/controllers/adminController.js
// Full file — includes M7, M8, and M10 additions
const pool = require('../config/db');
const orderService = require('../services/orderService');
const asyncWrapper = require('../utils/asyncWrapper');

// ─────────────────────────────────────────────
// M7 — Status Update
// ─────────────────────────────────────────────

/**
 * PATCH /api/admin/orders/:id/status
 * Advances an order to the next status.
 * Body: { status: 'Confirmed' | 'Being Prepared' | 'Out for Delivery' | 'Delivered' }
 */
const updateOrderStatus = asyncWrapper(async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'status field is required' });
  }

  const updated = await orderService.updateOrderStatus(
    orderId,
    status,
    req.user.userId
  );

  res.json({ message: 'Order status updated', order: updated });
});

// ─────────────────────────────────────────────
// M8 — Customer Management
// ─────────────────────────────────────────────

/**
 * GET /api/admin/customers
 * Returns all customer accounts with lifetime order count and total spend.
 * Supports ?search= query parameter to filter by name or email.
 */
const getAllCustomers = asyncWrapper(async (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : null;

  let sql = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      u.delivery_address,
      u.created_at,
      COUNT(o.id)              AS total_orders,
      COALESCE(SUM(o.total_amount), 0) AS lifetime_spend
    FROM users u
    LEFT JOIN orders o ON o.customer_id = u.id
    WHERE u.role = 'customer'
  `;
  const params = [];

  if (search) {
    sql += ' AND (u.name LIKE ? OR u.email LIKE ?)';
    params.push(search, search);
  }

  sql += ' GROUP BY u.id ORDER BY lifetime_spend DESC';

  const [customers] = await pool.query(sql, params);
  res.json(customers);
});

/**
 * GET /api/admin/customers/:id
 * Returns a single customer's profile plus their full order history and stats.
 */
const getCustomerDetail = asyncWrapper(async (req, res) => {
  const customerId = parseInt(req.params.id, 10);

  const [[customer]] = await pool.query(
    `SELECT id, name, email, phone, delivery_address, created_at
     FROM users WHERE id = ? AND role = 'customer'`,
    [customerId]
  );

  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const [orders] = await pool.query(
    `SELECT id, order_reference, status, total_amount, delivery_date, created_at
     FROM orders WHERE customer_id = ? ORDER BY created_at DESC`,
    [customerId]
  );

  // ── Compute stats from the orders we just fetched ──────────────────────
  const total_orders   = orders.length;
  const lifetime_spend = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pending_count  = orders.filter(o => o.status !== 'Delivered').length;
  const last_order_date = orders.length > 0 ? orders[0].created_at : null;

  res.json({
    ...customer,
    orders,
    stats: {
      total_orders,
      lifetime_spend,
      pending_count,
      last_order_date,
    },
  });
});

// ─────────────────────────────────────────────
// M10 — Admin Order Management (enhanced)
// ─────────────────────────────────────────────

/**
 * GET /api/admin/orders
 * Returns a paginated, filterable list of all orders with customer name.
 *
 * Query parameters:
 *   status  — filter by order status (exact match)
 *   date    — filter by delivery_date (YYYY-MM-DD)
 *   search  — partial match against customer name OR order_reference
 *   page    — page number (default 1)
 *   limit   — results per page (default 20, max 100)
 *
 * Response:
 *   { orders[], total_count, page, total_pages }
 */
const getAllOrders = asyncWrapper(async (req, res) => {
  const { status, date, search } = req.query;
  const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
  const offset = (page - 1) * limit;

  // Build WHERE clauses dynamically
  const conditions = [];
  const params     = [];

  if (status) {
    conditions.push('o.status = ?');
    params.push(status);
  }

  if (date) {
    conditions.push('DATE(o.delivery_date) = ?');
    params.push(date);
  }

  if (search) {
    conditions.push('(u.name LIKE ? OR o.order_reference LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0
    ? 'WHERE ' + conditions.join(' AND ')
    : '';

  // Count query (no pagination)
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM orders o
     JOIN users u ON o.customer_id = u.id
     ${whereClause}`,
    params
  );
  const total_count = countRows[0].total;
  const total_pages = Math.ceil(total_count / limit);

  // Data query with LIMIT/OFFSET
  const [orders] = await pool.query(
    `SELECT
       o.id,
       o.order_reference,
       o.status,
       o.total_amount,
       o.delivery_date,
       o.created_at,
       u.id   AS customer_id,
       u.name AS customer_name,
       u.email AS customer_email
     FROM orders o
     JOIN users u ON o.customer_id = u.id
     ${whereClause}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({ orders, total_count, page, total_pages });
});

/**
 * GET /api/admin/orders/:id
 * Returns a single order's complete data:
 *   - order fields (all columns)
 *   - customer info (name, email, phone)
 *   - items[] (menu_item_name, quantity, size, flavour, decoration_note, item_subtotal)
 *   - statusHistory[] (old_status, new_status, changed_by user name, changed_at)
 */
const getAdminOrderDetail = asyncWrapper(async (req, res) => {
  const orderId = parseInt(req.params.id, 10);

  // Main order + customer join
  const [[order]] = await pool.query(
    `SELECT
       o.id,
       o.order_reference,
       o.status,
       o.total_amount,
       o.delivery_date,
       o.delivery_address,
       o.special_instructions,
       o.qr_code_token,
       o.qr_code_data_url,
       o.created_at,
       u.id    AS customer_id,
       u.name  AS customer_name,
       u.email AS customer_email,
       u.phone AS customer_phone
     FROM orders o
     JOIN users u ON o.customer_id = u.id
     WHERE o.id = ?`,
    [orderId]
  );

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Order items
  const [items] = await pool.query(
    `SELECT
       id,
       menu_item_id,
       menu_item_name,
       quantity,
       size,
       flavour,
       decoration_note,
       unit_price,
       item_subtotal
     FROM order_items
     WHERE order_id = ?`,
    [orderId]
  );

  // Status history with changer's name
  const [statusHistory] = await pool.query(
    `SELECT
       h.id,
       h.old_status,
       h.new_status,
       h.changed_at,
       u.name AS changed_by_name
     FROM order_status_history h
     LEFT JOIN users u ON h.changed_by = u.id
     WHERE h.order_id = ?
     ORDER BY h.changed_at ASC`,
    [orderId]
  );

  res.json({ ...order, items, statusHistory });
});

module.exports = {
  // M7
  updateOrderStatus,
  // M8
  getAllCustomers,
  getCustomerDetail,
  // M10
  getAllOrders,
  getAdminOrderDetail,
};
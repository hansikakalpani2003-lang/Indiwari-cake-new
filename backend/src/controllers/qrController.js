/**
 * qrController.js
 * Handles the public-facing QR code order lookup endpoint and admin QR regeneration.
 *
 * Routes:
 *   GET   /order/:token               → publicOrderPage  (no auth — open to all)
 *   PATCH /api/admin/orders/:id/regenerate-qr → regenerateQR (admin only)
 *
 * The GET /order/:token endpoint is intentionally unauthenticated.
 * Anyone who physically scans the QR code can view the order — this is
 * by design, so delivery drivers and shop owners can check orders without
 * logging in.
 */

const qrService    = require('../services/qrService');
const asyncWrapper = require('../utils/asyncWrapper');
const db           = require('../config/db');

// ── GET /order/:token ─────────────────────────────────────────────────────────
/**
 * Public order display — no authentication required.
 * Looks up an order by its qr_code_token UUID.
 * Returns the full order including all items and the customer's name/phone.
 *
 * Response shape:
 * {
 *   order: {
 *     id, order_reference, status, total_amount, delivery_date,
 *     delivery_address, special_instructions, payment_method,
 *     qr_code_data_url, created_at, updated_at,
 *     customer_name, customer_phone,
 *     items: [{ menu_item_name, quantity, unit_price, size, flavour, decoration_note, item_subtotal }]
 *   }
 * }
 */
const publicOrderPage = asyncWrapper(async (req, res) => {
  const { token } = req.params;

  // Basic token format guard — UUID is 36 chars with hyphens
  if (!token || token.length < 10) {
    return res.status(400).json({ message: 'Invalid token format.' });
  }

  // ── Fetch the order by QR token ───────────────────────────────────────────
  const [orderRows] = await db.query(
    `SELECT
       o.id,
       o.order_reference,
       o.status,
       o.total_amount,
       o.delivery_date,
       o.delivery_address,
       o.special_instructions,
       o.payment_method,
       o.qr_code_data_url,
       o.created_at,
       o.updated_at,
       u.name  AS customer_name,
       u.phone AS customer_phone
     FROM orders o
     JOIN users u ON u.id = o.customer_id
     WHERE o.qr_code_token = ?`,
    [token]
  );

  if (orderRows.length === 0) {
    return res.status(404).json({ message: 'Order not found. The QR code may be invalid or expired.' });
  }

  const order = orderRows[0];

  // ── Fetch all order items ─────────────────────────────────────────────────
  const [itemRows] = await db.query(
    `SELECT
       oi.id,
       oi.menu_item_name,
       oi.quantity,
       oi.unit_price,
       oi.size,
       oi.flavour,
       oi.decoration_note,
       oi.item_subtotal
     FROM order_items oi
     WHERE oi.order_id = ?
     ORDER BY oi.id ASC`,
    [order.id]
  );

  // ── Fetch status history ──────────────────────────────────────────────────
  const [historyRows] = await db.query(
    `SELECT
       osh.old_status,
       osh.new_status,
       osh.changed_at
     FROM order_status_history osh
     WHERE osh.order_id = ?
     ORDER BY osh.changed_at ASC`,
    [order.id]
  );

  res.status(200).json({
    order: {
      ...order,
      items:          itemRows,
      status_history: historyRows,
    },
  });
});

// ── PATCH /api/admin/orders/:id/regenerate-qr ─────────────────────────────────
/**
 * Admin — regenerates the QR code PNG for an order.
 * Does NOT change the qr_code_token (the URL stays the same).
 * Simply re-runs qrcode.toDataURL and overwrites qr_code_data_url in DB.
 *
 * Use case: if the stored base64 PNG is corrupted or the original
 * async generation failed silently during order placement.
 */
const regenerateQR = asyncWrapper(async (req, res) => {
  const orderId = parseInt(req.params.id, 10);

  if (isNaN(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  // Fetch the existing token
  const [rows] = await db.query(
    'SELECT id, qr_code_token FROM orders WHERE id = ?',
    [orderId]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  const { qr_code_token } = rows[0];

  // Re-run QR generation — saves to DB via qrService
  const qrDataUrl = await qrService.generateAndSaveQR(orderId, qr_code_token);

  res.status(200).json({
    message:         'QR code regenerated successfully.',
    qr_code_data_url: qrDataUrl,
  });
});

module.exports = {
  publicOrderPage,
  regenerateQR,
};
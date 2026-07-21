const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateOrderRef = require('../utils/generateOrderRef');

const VALID_STATUSES = ['Pending', 'Confirmed', 'Being Prepared', 'Out for Delivery', 'Delivered'];

// Shared shape used whenever we return a full order (with items) to the client.
async function fetchFullOrder(conn, orderId) {
  const [orderRows] = await conn.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (orderRows.length === 0) return null;

  const [items] = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  return { ...orderRows[0], items };
}

// POST /api/orders — customer creates an order (starts unpaid/Pending).
// Prices are always re-read from menu_items server-side; the client only
// sends menu_item_id + quantity + customisation, never the price.
const createOrder = asyncHandler(async (req, res) => {
  const { items, delivery_address, delivery_date, special_instructions } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Order must include at least one item.');
  }
  if (!delivery_address || !delivery_date) {
    throw new ApiError(400, 'delivery_address and delivery_date are required.');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Look up current price/name for every menu item referenced, in one query.
    const menuItemIds = items.map((i) => i.menu_item_id);
    const [menuRows] = await conn.query(
      `SELECT id, name, base_price, is_available FROM menu_items WHERE id IN (?)`,
      [menuItemIds]
    );
    const menuById = new Map(menuRows.map((m) => [m.id, m]));

    let totalAmount = 0;
    const preparedItems = items.map((i) => {
      const menuItem = menuById.get(i.menu_item_id);
      if (!menuItem) {
        throw new ApiError(400, `Menu item ${i.menu_item_id} does not exist.`);
      }
      if (!menuItem.is_available) {
        throw new ApiError(400, `"${menuItem.name}" is currently unavailable.`);
      }
      const quantity = Number(i.quantity) || 1;
      const unitPrice = Number(menuItem.base_price);
      const subtotal = quantity * unitPrice;
      totalAmount += subtotal;

      return {
        menu_item_id: menuItem.id,
        menu_item_name: menuItem.name,
        quantity,
        unit_price: unitPrice,
        size: i.size || null,
        flavour: i.flavour || null,
        decoration_note: i.decoration_note || null,
        item_subtotal: subtotal,
      };
    });

    // order_reference has a UNIQUE constraint — retry a couple of times on collision.
    let orderReference;
    let insertResult;
    for (let attempt = 0; attempt < 5; attempt++) {
      orderReference = generateOrderRef();
      try {
        [insertResult] = await conn.query(
          `INSERT INTO orders
             (order_reference, customer_id, delivery_address, delivery_date, special_instructions, total_amount)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderReference, req.user.id, delivery_address, delivery_date, special_instructions || null, totalAmount]
        );
        break;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' && attempt < 4) continue;
        throw err;
      }
    }

    const orderId = insertResult.insertId;

    for (const item of preparedItems) {
      await conn.query(
        `INSERT INTO order_items
           (order_id, menu_item_id, menu_item_name, quantity, unit_price, size, flavour, decoration_note, item_subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.menu_item_id,
          item.menu_item_name,
          item.quantity,
          item.unit_price,
          item.size,
          item.flavour,
          item.decoration_note,
          item.item_subtotal,
        ]
      );
    }

    // QR code links to the public tracking page — no login required.
    const qrToken = uuidv4();
    const trackingUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/order/${qrToken}`;
    const qrDataUrl = await QRCode.toDataURL(trackingUrl);

    await conn.query('UPDATE orders SET qr_code_token = ?, qr_code_data_url = ? WHERE id = ?', [
      qrToken,
      qrDataUrl,
      orderId,
    ]);

    await conn.query(
      `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
       VALUES (?, NULL, 'Pending', ?)`,
      [orderId, req.user.id]
    );

    await conn.commit();

    const fullOrder = await fetchFullOrder(pool, orderId);
    res.status(201).json({ success: true, order: fullOrder });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// GET /api/orders/mine — logged-in customer's own orders
const getMyOrders = asyncHandler(async (req, res) => {
  const [orders] = await pool.query(
    'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json({ success: true, orders });
});

// GET /api/orders/:id — owner or admin
const getOrder = asyncHandler(async (req, res) => {
  const order = await fetchFullOrder(pool, req.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');

  if (req.user.role !== 'admin' && order.customer_id !== req.user.id) {
    throw new ApiError(403, 'You do not have access to this order.');
  }

  res.json({ success: true, order });
});

// GET /api/orders/track/:token — public QR tracking page, no auth
const trackOrder = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE qr_code_token = ?', [req.params.token]);
  if (rows.length === 0) throw new ApiError(404, 'Order not found.');

  const order = rows[0];
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  const [history] = await pool.query(
    'SELECT old_status, new_status, changed_at FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC',
    [order.id]
  );

  // Public view — deliberately omit customer_id / internal fields.
  res.json({
    success: true,
    order: {
      order_reference: order.order_reference,
      status: order.status,
      payment_status: order.payment_status,
      delivery_date: order.delivery_date,
      total_amount: order.total_amount,
      created_at: order.created_at,
      items,
      history,
    },
  });
});

// GET /api/orders — admin: list all orders (optionally filter by status)
const adminListOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const sql = status
    ? 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC'
    : 'SELECT * FROM orders ORDER BY created_at DESC';
  const params = status ? [status] : [];
  const [orders] = await pool.query(sql, params);
  res.json({ success: true, orders });
});

// PATCH /api/orders/:id/status — admin updates delivery status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (rows.length === 0) throw new ApiError(404, 'Order not found.');
  const order = rows[0];

  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, order.id]);
  await pool.query(
    `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
     VALUES (?, ?, ?, ?)`,
    [order.id, order.status, status, req.user.id]
  );

  const updated = await fetchFullOrder(pool, order.id);
  res.json({ success: true, order: updated });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  trackOrder,
  adminListOrders,
  updateOrderStatus,
};

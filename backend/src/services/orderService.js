'use strict';

const db           = require('../config/db');
const { randomUUID } = require('crypto');
const emailService = require('./emailService');
const qrService     = require('./qrService');

// ── Generate Order Reference ──────────────────────────────────────────────────
async function generateOrderRef() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM orders');
  return `IC-${date}-${String(Number(count) + 1).padStart(4, '0')}`;
}

// ── Create Order ──────────────────────────────────────────────────────────────
async function createOrder(customerId, orderData) {
  const { items, delivery_address, delivery_date, special_instructions } = orderData;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    let total_amount = 0;
    const resolvedItems = [];
    for (const item of items) {
      const [menuRows] = await connection.query('SELECT id, name, base_price, is_available FROM menu_items WHERE id = ?', [item.menu_item_id]);
      if (menuRows.length === 0) throw { statusCode: 422, message: `Menu item ${item.menu_item_id} does not exist.` };
      if (!menuRows[0].is_available) throw { statusCode: 422, message: `"${menuRows[0].name}" is not available.` };
      const unit_price = parseFloat(menuRows[0].base_price);
      const quantity = parseInt(item.quantity, 10);
      const item_subtotal = unit_price * quantity;
      total_amount += item_subtotal;
      resolvedItems.push({ menu_item_id: menuRows[0].id, menu_item_name: menuRows[0].name, unit_price, quantity, size: item.size || null, flavour: item.flavour || null, decoration_note: item.decoration_note || null, item_subtotal });
    }
    const order_reference = await generateOrderRef();
    const qr_code_token = randomUUID();
    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_reference, customer_id, delivery_address, delivery_date, special_instructions, status, total_amount, payment_method, qr_code_token) VALUES (?, ?, ?, ?, ?, 'Pending', ?, 'cash_on_delivery', ?)`,
      [order_reference, customerId, delivery_address, delivery_date, special_instructions || null, total_amount.toFixed(2), qr_code_token]
    );
    const orderId = orderResult.insertId;
    for (const ri of resolvedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, menu_item_id, menu_item_name, quantity, unit_price, size, flavour, decoration_note, item_subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, ri.menu_item_id, ri.menu_item_name, ri.quantity, ri.unit_price, ri.size, ri.flavour, ri.decoration_note, ri.item_subtotal.toFixed(2)]
      );
    }
    await connection.commit();

    // Record the initial status-history entry (old_status NULL → 'Pending')
    await db.query(
      'INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) VALUES (?, NULL, ?, ?)',
      [orderId, 'Pending', customerId]
    );

    // Generate and persist the QR code PNG for this order (fire-and-forget,
    // but awaited here so the response can include the data URL too)
    let qr_code_data_url = null;
    try {
      qr_code_data_url = await qrService.generateAndSaveQR(orderId, qr_code_token);
    } catch (qrErr) {
      console.error('[Order] QR generation failed for order', orderId, qrErr.message);
    }

    // Fire-and-forget: send 'Order Received' email to customer
    const [[customerRow]] = await db.query('SELECT name, email FROM users WHERE id = ?', [customerId]);
    if (customerRow) {
      emailService.sendOrderReceived(customerRow.email, {
        customer_name:  customerRow.name,
        order_reference,
        delivery_date:  orderData.delivery_date,
        total_amount:   parseFloat(total_amount.toFixed(2)),
        qr_code_token,
      });
    }

    return { orderId, order_reference, qr_code_token, qr_code_data_url, status: 'Pending', total_amount: parseFloat(total_amount.toFixed(2)) };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// ── Get Customer Orders ───────────────────────────────────────────────────────
async function getCustomerOrders(customerId) {
  const [rows] = await db.query(
    `SELECT o.id, o.order_reference, o.status, o.total_amount, o.delivery_date, o.delivery_address, o.qr_code_token, o.created_at, COUNT(oi.id) AS item_count FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id WHERE o.customer_id = ? GROUP BY o.id ORDER BY o.created_at DESC`,
    [customerId]
  );
  return rows;
}

// ── Get Order By ID (Customer) ────────────────────────────────────────────────
async function getOrderById(orderId, customerId) {
  const [orderRows] = await db.query(
    `SELECT o.id, o.order_reference, o.status, o.total_amount, o.delivery_date, o.delivery_address, o.special_instructions, o.qr_code_token, o.payment_method, o.created_at FROM orders o WHERE o.id = ? AND o.customer_id = ?`,
    [orderId, customerId]
  );
  if (orderRows.length === 0) return null;
  const [itemRows] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  const [historyRows] = await db.query('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC', [orderId]);
  return { ...orderRows[0], items: itemRows, status_history: historyRows };
}

// ── Get All Orders (Admin) ────────────────────────────────────────────────────
async function getAllOrdersAdmin(filters = {}, pagination = {}) {
  const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
  const limit = pagination.limit && pagination.limit > 0 ? pagination.limit : 10;
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  if (filters.status) { conditions.push('o.status = ?'); params.push(filters.status); }
  if (filters.search) { conditions.push('(u.name LIKE ? OR o.order_reference LIKE ?)'); params.push(`%${filters.search}%`, `%${filters.search}%`); }
  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  const [orders] = await db.query(`SELECT o.*, u.name AS customer_name, u.email AS customer_email FROM orders o JOIN users u ON u.id = o.customer_id ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM orders o JOIN users u ON u.id = o.customer_id ${where}`, params);
  return { orders, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) } };
}

// ── Get Order By ID (Admin) ───────────────────────────────────────────────────
async function getOrderByIdAdmin(orderId) {
  const [orderRows] = await db.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone FROM orders o JOIN users u ON u.id = o.customer_id WHERE o.id = ?`,
    [orderId]
  );
  if (orderRows.length === 0) return null;
  const [itemRows] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  const [historyRows] = await db.query(`SELECT h.*, u.name AS changed_by_name FROM order_status_history h LEFT JOIN users u ON u.id = h.changed_by WHERE h.order_id = ? ORDER BY h.changed_at ASC`, [orderId]);
  return { ...orderRows[0], items: itemRows, status_history: historyRows };
}

// ── Update Order Status ───────────────────────────────────────────────────────
async function updateOrderStatus(orderId, newStatus, adminId) {
  const validStatuses = ['Pending', 'Confirmed', 'Being Prepared', 'Out for Delivery', 'Delivered'];
  if (!validStatuses.includes(newStatus)) throw { statusCode: 400, message: `Invalid status: ${newStatus}` };
  const [[order]] = await db.query('SELECT id, status FROM orders WHERE id = ?', [orderId]);
  if (!order) throw { statusCode: 404, message: `Order ${orderId} not found.` };
  await db.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, orderId]);
  await db.query('INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)', [orderId, order.status, newStatus, adminId]);

  // Fire-and-forget: send status-update email to customer
  const updatedOrder = await getOrderByIdAdmin(orderId);
  if (updatedOrder) {
    emailService.sendStatusUpdate(
      updatedOrder.customer_email,
      {
        customer_name:   updatedOrder.customer_name,
        order_reference: updatedOrder.order_reference,
        delivery_date:   updatedOrder.delivery_date,
        total_amount:    updatedOrder.total_amount,
        qr_code_token:   updatedOrder.qr_code_token,
      },
      newStatus
    );
  }

  return updatedOrder;
}

module.exports = { createOrder, getCustomerOrders, getOrderById, getAllOrdersAdmin, getOrderByIdAdmin, updateOrderStatus };
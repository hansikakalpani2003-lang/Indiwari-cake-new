// backend/src/services/riderJobService.js
const pool = require('../config/db');

async function getCurrentJobs(riderId) {
  const [orders] = await pool.query(
    `SELECT o.id, o.order_reference, o.delivery_address, o.delivery_date,
            o.total_amount, o.special_instructions, o.assigned_at,
            u.name AS customer_name, u.phone AS customer_phone
     FROM orders o
     JOIN users u ON u.id = o.customer_id
     WHERE o.rider_id = ? AND o.status = 'Out for Delivery'
     ORDER BY o.assigned_at ASC`,
    [riderId]
  );
  return orders;
}

async function getHistory(riderId) {
  const [orders] = await pool.query(
    `SELECT o.id, o.order_reference, o.delivery_address, o.delivery_date,
            o.total_amount, o.updated_at AS delivered_at
     FROM orders o
     WHERE o.rider_id = ? AND o.status = 'Delivered'
     ORDER BY o.updated_at DESC
     LIMIT 50`,
    [riderId]
  );
  return orders;
}

async function markDelivered(riderId, orderId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[order]] = await connection.query(
      `SELECT id, status, rider_id FROM orders WHERE id = ? FOR UPDATE`, [orderId]
    );
    if (!order) {
      const err = new Error('Order not found.');
      err.statusCode = 404;
      throw err;
    }
    if (order.rider_id !== riderId) {
      const err = new Error('This job is not assigned to you.');
      err.statusCode = 403;
      throw err;
    }
    if (order.status !== 'Out for Delivery') {
      const err = new Error(`Order is currently '${order.status}', not out for delivery.`);
      err.statusCode = 409;
      throw err;
    }

    await connection.query(`UPDATE orders SET status = 'Delivered' WHERE id = ?`, [orderId]);
    await connection.query(
      `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by_rider_id)
       VALUES (?, 'Out for Delivery', 'Delivered', ?)`,
      [orderId, riderId]
    );

    const [[{ remaining }]] = await connection.query(
      `SELECT COUNT(*) AS remaining FROM orders WHERE rider_id = ? AND status = 'Out for Delivery'`,
      [riderId]
    );
    if (remaining === 0) {
      await connection.query(`UPDATE delivery_riders SET status = 'active' WHERE id = ?`, [riderId]);
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = { getCurrentJobs, getHistory, markDelivered };

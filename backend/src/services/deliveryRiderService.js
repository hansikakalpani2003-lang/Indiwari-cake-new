// backend/src/services/deliveryRiderService.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function listRiders(status) {
  let sql = `SELECT id, name, phone, vehicle_number, status, created_at, updated_at
             FROM delivery_riders`;
  const params = [];
  if (status) {
    sql += ` WHERE status = ?`;
    params.push(status);
  }
  sql += ` ORDER BY name ASC`;
  const [riders] = await pool.query(sql, params);
  return riders;
}

async function createRider({ name, phone, vehicle_number, pin }) {
  if (!/^\d{4,6}$/.test(pin)) {
    const err = new Error('PIN must be 4-6 digits.');
    err.statusCode = 400;
    throw err;
  }
  const pinHash = await bcrypt.hash(pin, 10);
  try {
    const [result] = await pool.query(
      `INSERT INTO delivery_riders (name, phone, vehicle_number, pin_hash, status)
       VALUES (?, ?, ?, ?, 'inactive')`,
      [name, phone, vehicle_number, pinHash]
    );
    return { id: result.insertId };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const dup = new Error('A rider with that phone number already exists.');
      dup.statusCode = 409;
      throw dup;
    }
    throw err;
  }
}

async function updateRider(id, { name, phone, vehicle_number, pin }) {
  const fields = [];
  const params = [];
  if (name)           { fields.push('name = ?');           params.push(name); }
  if (phone)          { fields.push('phone = ?');          params.push(phone); }
  if (vehicle_number) { fields.push('vehicle_number = ?'); params.push(vehicle_number); }
  if (pin) {
    if (!/^\d{4,6}$/.test(pin)) {
      const err = new Error('PIN must be 4-6 digits.');
      err.statusCode = 400;
      throw err;
    }
    fields.push('pin_hash = ?');
    params.push(await bcrypt.hash(pin, 10));
  }
  if (fields.length === 0) {
    const err = new Error('Nothing to update.');
    err.statusCode = 400;
    throw err;
  }

  params.push(id);
  try {
    await pool.query(`UPDATE delivery_riders SET ${fields.join(', ')} WHERE id = ?`, params);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const dup = new Error('A rider with that phone number already exists.');
      dup.statusCode = 409;
      throw dup;
    }
    throw err;
  }
}

async function deleteRider(id) {
  const [[rider]] = await pool.query('SELECT status FROM delivery_riders WHERE id = ?', [id]);
  if (!rider) {
    const err = new Error('Rider not found.');
    err.statusCode = 404;
    throw err;
  }
  if (rider.status === 'delivering') {
    const err = new Error('Cannot delete a rider who is currently out on a delivery.');
    err.statusCode = 409;
    throw err;
  }
  await pool.query('DELETE FROM delivery_riders WHERE id = ?', [id]);
}

async function setRiderStatus(id, status) {
  if (!['active', 'inactive'].includes(status)) {
    const err = new Error("status must be 'active' or 'inactive'.");
    err.statusCode = 400;
    throw err;
  }
  const [[rider]] = await pool.query('SELECT status FROM delivery_riders WHERE id = ?', [id]);
  if (!rider) {
    const err = new Error('Rider not found.');
    err.statusCode = 404;
    throw err;
  }
  if (rider.status === 'delivering') {
    const err = new Error('Rider is currently delivering. Wait until the job is completed before changing status.');
    err.statusCode = 409;
    throw err;
  }
  await pool.query('UPDATE delivery_riders SET status = ? WHERE id = ?', [status, id]);
}

async function assignOrderToRider(riderId, orderId, adminUserId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[rider]] = await connection.query(
      'SELECT id, status FROM delivery_riders WHERE id = ? FOR UPDATE', [riderId]
    );
    if (!rider) {
      const err = new Error('Rider not found.');
      err.statusCode = 404;
      throw err;
    }
    if (rider.status !== 'active') {
      const err = new Error('Rider must be Active before they can be assigned a job.');
      err.statusCode = 409;
      throw err;
    }

    const [[order]] = await connection.query(
      'SELECT id, status FROM orders WHERE id = ? FOR UPDATE', [orderId]
    );
    if (!order) {
      const err = new Error('Order not found.');
      err.statusCode = 404;
      throw err;
    }

    await connection.query(
      `UPDATE orders SET rider_id = ?, assigned_at = NOW(), status = 'Out for Delivery' WHERE id = ?`,
      [riderId, orderId]
    );
    await connection.query(`UPDATE delivery_riders SET status = 'delivering' WHERE id = ?`, [riderId]);
    await connection.query(
      `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
       VALUES (?, ?, 'Out for Delivery', ?)`,
      [orderId, order.status, adminUserId]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function getRiderJobs(riderId) {
  const [jobs] = await pool.query(
    `SELECT id, order_reference, customer_id, delivery_address, delivery_date,
            status, total_amount, assigned_at
     FROM orders
     WHERE rider_id = ?
     ORDER BY assigned_at DESC
     LIMIT 50`,
    [riderId]
  );
  return jobs;
}

module.exports = {
  listRiders,
  createRider,
  updateRider,
  deleteRider,
  setRiderStatus,
  assignOrderToRider,
  getRiderJobs,
};

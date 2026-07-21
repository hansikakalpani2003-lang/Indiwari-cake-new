'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const emailService = require('../services/emailService');
const asyncWrapper = require('../utils/asyncWrapper');

function publicPerson(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    vehicle_type: row.vehicle_type,
    vehicle_number: row.vehicle_number,
    status: row.status,
  };
}

async function getOrderEmailData(orderId) {
  const [[row]] = await db.query(`
    SELECT o.order_reference, o.delivery_date, o.total_amount, o.qr_code_token,
           u.name AS customer_name, u.email AS customer_email,
           dp.name AS delivery_person_name, dp.phone AS delivery_person_phone,
           dp.vehicle_type, dp.vehicle_number
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    LEFT JOIN delivery_persons dp ON dp.id = o.delivery_person_id
    WHERE o.id = ?
  `, [orderId]);
  return row;
}

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  const [[person]] = await db.query('SELECT * FROM delivery_persons WHERE email = ?', [email.trim().toLowerCase()]);
  if (!person || !(await bcrypt.compare(password, person.password_hash))) {
    return res.status(401).json({ message: 'Invalid delivery email or password.' });
  }
  if (person.status === 'Inactive') {
    return res.status(403).json({ message: 'This delivery account is inactive. Please contact the admin.' });
  }

  await db.query('UPDATE delivery_persons SET last_login_at = NOW() WHERE id = ?', [person.id]);
  const token = jwt.sign(
    { deliveryPersonId: person.id, type: 'delivery_person' },
    process.env.DELIVERY_JWT_SECRET || process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
  res.json({ message: 'Delivery login successful.', token, deliveryPerson: publicPerson(person) });
});

const me = asyncWrapper(async (req, res) => {
  const [[person]] = await db.query('SELECT * FROM delivery_persons WHERE id = ?', [req.deliveryPerson.id]);
  if (!person) return res.status(404).json({ message: 'Delivery person not found.' });
  res.json({ deliveryPerson: publicPerson(person) });
});

const availableOrders = asyncWrapper(async (req, res) => {
  const [orders] = await db.query(`
    SELECT o.id, o.order_reference, o.status, o.total_amount, o.delivery_address,
           o.delivery_date, o.special_instructions, o.created_at,
           u.name AS customer_name, u.phone AS customer_phone
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    WHERE o.delivery_person_id IS NULL
      AND o.status = 'Being Prepared'
    ORDER BY o.delivery_date ASC, o.created_at ASC
  `);
  res.json({ orders });
});

const myDeliveries = asyncWrapper(async (req, res) => {
  const [orders] = await db.query(`
    SELECT o.id, o.order_reference, o.status, o.total_amount, o.delivery_address,
           o.delivery_date, o.special_instructions, o.accepted_at,
           u.name AS customer_name, u.phone AS customer_phone
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    WHERE o.delivery_person_id = ? AND o.status = 'Out for Delivery'
    ORDER BY o.accepted_at ASC
  `, [req.deliveryPerson.id]);
  res.json({ orders });
});

const history = asyncWrapper(async (req, res) => {
  const [orders] = await db.query(`
    SELECT o.id, o.order_reference, o.status, o.total_amount, o.delivery_address,
           o.delivery_date, o.delivered_at,
           u.name AS customer_name, u.phone AS customer_phone
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    WHERE o.delivery_person_id = ? AND o.status = 'Delivered'
    ORDER BY o.delivered_at DESC
    LIMIT 100
  `, [req.deliveryPerson.id]);
  res.json({ orders });
});

const acceptOrder = asyncWrapper(async (req, res) => {
  const personId = req.deliveryPerson.id;
  const orderId = Number(req.params.id);
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[person]] = await connection.query('SELECT * FROM delivery_persons WHERE id = ? FOR UPDATE', [personId]);
    if (!person) return res.status(404).json({ message: 'Delivery person not found.' });
    if (person.status !== 'Available') {
      await connection.rollback();
      return res.status(409).json({ message: 'Complete your current delivery before accepting another order.' });
    }

    const [[order]] = await connection.query('SELECT id,status,delivery_person_id FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (!order) {
      await connection.rollback();
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (order.delivery_person_id || order.status !== 'Being Prepared') {
      await connection.rollback();
      return res.status(409).json({ message: 'This order is no longer available.' });
    }

    await connection.query(
      `UPDATE orders SET delivery_person_id = ?, accepted_at = NOW(), status = 'Out for Delivery' WHERE id = ?`,
      [personId, orderId]
    );
    await connection.query(`UPDATE delivery_persons SET status = 'Delivering' WHERE id = ?`, [personId]);
    await connection.query(
      `INSERT INTO order_status_history
       (order_id,old_status,new_status,changed_by_delivery_person_id)
       VALUES (?,?,'Out for Delivery',?)`,
      [orderId, order.status, personId]
    );
    await connection.commit();

    try {
      const emailData = await getOrderEmailData(orderId);
      if (emailData) emailService.sendStatusUpdate(emailData.customer_email, emailData, 'Out for Delivery');
    } catch (emailErr) {
      console.error('[Delivery] Out-for-delivery email lookup failed:', emailErr.message);
    }
    res.json({ message: 'Order accepted and marked Out for Delivery.' });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

const markDelivered = asyncWrapper(async (req, res) => {
  const personId = req.deliveryPerson.id;
  const orderId = Number(req.params.id);
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[order]] = await connection.query('SELECT id,status,delivery_person_id FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (!order) {
      await connection.rollback();
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (Number(order.delivery_person_id) !== Number(personId)) {
      await connection.rollback();
      return res.status(403).json({ message: 'This delivery is not assigned to your account.' });
    }
    if (order.status !== 'Out for Delivery') {
      await connection.rollback();
      return res.status(409).json({ message: 'Only an Out for Delivery order can be marked Delivered.' });
    }

    await connection.query(`UPDATE orders SET status = 'Delivered', delivered_at = NOW() WHERE id = ?`, [orderId]);
    await connection.query(`UPDATE delivery_persons SET status = 'Available' WHERE id = ?`, [personId]);
    await connection.query(
      `INSERT INTO order_status_history
       (order_id,old_status,new_status,changed_by_delivery_person_id)
       VALUES (?,'Out for Delivery','Delivered',?)`,
      [orderId, personId]
    );
    await connection.commit();

    try {
      const emailData = await getOrderEmailData(orderId);
      if (emailData) emailService.sendStatusUpdate(emailData.customer_email, emailData, 'Delivered');
    } catch (emailErr) {
      console.error('[Delivery] Delivered email lookup failed:', emailErr.message);
    }
    res.json({ message: 'Order marked as Delivered. Customer email notification has been triggered.' });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

module.exports = { login, me, availableOrders, myDeliveries, history, acceptOrder, markDelivered };

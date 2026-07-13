// backend/scripts/seedTestOrders.js
// Run once: node scripts/seedTestOrders.js
// Creates 5 test orders with QR codes for cross-device scanning.

'use strict';

require('dotenv').config({ path: '../.env' });
const db     = require('../src/config/db');
const qrcode = require('qrcode');
const crypto = require('crypto');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Adjust these IDs to match real rows in your database
const TEST_CUSTOMER_ID = 1;   // change to an existing user id with role='customer'
const TEST_MENU_ITEM_ID = 1;  // change to an existing menu_item id with is_available=1

async function pad(n) {
  return String(n).padStart(4, '0');
}

async function createOrder(index) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  // Count existing orders for reference number
  const [[{ cnt }]] = await db.query('SELECT COUNT(*) AS cnt FROM orders');
  const ref = `IC-${dateStr}-${await pad(Number(cnt) + index + 1)}`;
  const token = crypto.randomBytes(16).toString('hex');
  const qrUrl = `${CLIENT_URL}/order/${token}`;
  const qrDataUrl = await qrcode.toDataURL(qrUrl, { width: 300 });

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7 + index);

  const [orderResult] = await db.query(
    `INSERT INTO orders
       (user_id, order_reference, delivery_address, delivery_date,
        special_instructions, status, qr_code_token, qr_code_data_url, total_amount)
     VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, ?)`,
    [
      TEST_CUSTOMER_ID,
      ref,
      `${index + 1} QR Test Street, Kurunegala`,
      deliveryDate.toISOString().slice(0, 10),
      `Test order ${index + 1} for QR cross-device scan`,
      token,
      qrDataUrl,
      1500.00,
    ]
  );

  const orderId = orderResult.insertId;

  await db.query(
    `INSERT INTO order_items
       (order_id, menu_item_id, menu_item_name, quantity, size,
        flavour, decoration, unit_price, item_subtotal)
     VALUES (?, ?, 'Test Cake', 1, 'Medium', 'Chocolate', 'Happy Testing', 1500.00, 1500.00)`,
    [orderId, TEST_MENU_ITEM_ID]
  );

  await db.query(
    `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
     VALUES (?, NULL, 'Pending', ?)`,
    [orderId, TEST_CUSTOMER_ID]
  );

  console.log(`✅ Created order #${orderId}  ref: ${ref}  token: ${token}`);
  console.log(`   Scan URL: ${qrUrl}`);
  return { orderId, token, qrUrl };
}

async function main() {
  console.log('Seeding 5 test orders for QR cross-device validation...\n');
  const orders = [];
  for (let i = 0; i < 5; i++) {
    const o = await createOrder(i);
    orders.push(o);
  }
  console.log('\n✅ All 5 test orders created.');
  console.log('Open the frontend and visit the customer dashboard to see QR codes,');
  console.log('or visit each URL directly in a browser:\n');
  orders.forEach(o => console.log(`  ${o.qrUrl}`));
  process.exit(0);
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
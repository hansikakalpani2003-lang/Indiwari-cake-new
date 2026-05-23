require('dotenv').config();
const pool = require('./src/config/db');

(async () => {
  try {
    // 1. Basic connection test
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅  DB Connection: OK — 1+1 =', rows[0].result);

    // 2. Confirm all tables exist
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('✅  Tables found:', tableNames.join(', '));

    const required = ['users', 'menu_items', 'orders', 'order_items', 'order_status_history'];
    const missing = required.filter(t => !tableNames.includes(t));

    if (missing.length > 0) {
      console.error('❌  Missing tables:', missing.join(', '));
    } else {
      console.log('✅  All 5 required tables present');
    }

    // 3. Verify admin user was seeded
    const [adminRows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE email = 'admin@indiwari.lk'"
    );
    if (adminRows.length === 0) {
      console.error('❌  Admin user NOT found — run seed.sql');
    } else {
      console.log('✅  Admin user found:', adminRows[0].name, '|', adminRows[0].email, '| role:', adminRows[0].role);
    }

    // 4. Verify menu items were seeded
    const [menuRows] = await pool.query('SELECT COUNT(*) AS total FROM menu_items');
    console.log('✅  Menu items seeded:', menuRows[0].total);

    // 5. Describe orders table to verify columns
    const [cols] = await pool.query('DESCRIBE orders');
    const colNames = cols.map(c => c.Field);
    console.log('✅  orders columns:', colNames.join(', '));

    process.exit(0);
  } catch (err) {
    console.error('❌  Test failed:', err.message);
    process.exit(1);
  }
})();
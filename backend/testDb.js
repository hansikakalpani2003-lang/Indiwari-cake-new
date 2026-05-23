require('dotenv').config();
const pool = require('./src/config/db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ DB Test passed. Result:', rows[0].result);
    process.exit(0);
  } catch (err) {
    console.error('❌ DB Test failed:', err.message);
    process.exit(1);
  }
})();

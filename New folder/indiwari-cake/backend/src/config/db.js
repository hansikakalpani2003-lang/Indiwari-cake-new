const mysql = require('mysql2/promise');
require('dotenv').config();

// Central MySQL connection pool. Every model/controller reuses this
// instead of opening a fresh connection per request.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'indiwari_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true, // return DECIMAL columns as JS numbers, not strings
});

module.exports = pool;

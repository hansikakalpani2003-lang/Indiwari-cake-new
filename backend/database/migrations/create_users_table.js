const pool = require('../../src/config/db');

async function up() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(sql);
  console.log('✅ Users table created successfully!');
}

async function down() {
  await pool.query('DROP TABLE IF EXISTS users;');
  console.log('🗑️ Users table dropped.');
}

// මේක run වෙන්න පහලින් export කරන්න
module.exports = { up, down };
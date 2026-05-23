require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ─── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ─── BODY PARSERS ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── HEALTH CHECK ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Indiwari Cake API is running' });
});

// ─── ROUTES ────────────────────────────────────────────────────
// Uncomment each route as you build the corresponding module:
// const authRoutes    = require('./src/routes/authRoutes');
// const menuRoutes    = require('./src/routes/menuRoutes');
// const orderRoutes   = require('./src/routes/orderRoutes');
// const customerRoutes = require('./src/routes/customerRoutes');
// const adminRoutes   = require('./src/routes/adminRoutes');
// const qrRoutes      = require('./src/routes/qrRoutes');
// const reportRoutes  = require('./src/routes/reportRoutes');

// app.use('/api/auth',      authRoutes);
// app.use('/api/menu',      menuRoutes);
// app.use('/api/orders',    orderRoutes);
// app.use('/api/customer',  customerRoutes);
// app.use('/api/admin',     adminRoutes);
// app.use('/api/qr',        qrRoutes);
// app.use('/api/reports',   reportRoutes);

// ─── 404 HANDLER ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Test Route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Indiwari Cake API!" });
});

module.exports = app;
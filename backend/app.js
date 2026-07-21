//backend/app.js
'use strict';

require('dotenv').config({ quiet: true });
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

require('./src/config/db');

const authRoutes     = require('./src/routes/authRoutes');
const menuRoutes     = require('./src/routes/menuRoutes');
const adminRoutes    = require('./src/routes/adminRoutes');
const orderRoutes    = require('./src/routes/orderRoutes');    // ✅
const customerRoutes = require('./src/routes/customerRoutes'); // ✅
const qrRoutes       = require('./src/routes/qrRoutes');       // ✅ public QR order display (Module 6)
const deliveryRoutes = require('./src/routes/deliveryRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => { res.send('Indiwari Cake API running!'); });

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth',      authRoutes);
app.use('/api/menu',      menuRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/delivery',   deliveryRoutes);

// Public, unauthenticated QR order lookup — GET /order/:token
// (kept outside /api so a bare QR-code URL works: http://host/order/<token>)
app.use('/order', cors({ origin: '*' }), qrRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

module.exports = app;
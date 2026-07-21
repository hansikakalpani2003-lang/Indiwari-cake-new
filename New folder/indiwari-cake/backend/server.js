require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { handleWebhook } = require('./src/controllers/paymentController');
const authRoutes = require('./src/routes/authRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// IMPORTANT: the Stripe webhook route must receive the *raw* request body
// so its signature can be verified — it must be registered BEFORE
// express.json() below, and must use express.raw(), not express.json().
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Every other route gets normal JSON body parsing.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Indiwari Cake API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎂 Indiwari Cake API listening on http://localhost:${PORT}`);
});

module.exports = app;

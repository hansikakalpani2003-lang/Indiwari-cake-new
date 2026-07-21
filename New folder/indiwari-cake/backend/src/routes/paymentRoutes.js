const express = require('express');
const { createCheckoutSession, getSessionStatus } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// NOTE: the /webhook route is intentionally NOT here — it needs the raw
// request body for Stripe signature verification, so it's mounted
// directly in server.js with express.raw(), before express.json() runs.

router.post('/create-checkout-session/:orderId', verifyToken, createCheckoutSession);
router.get('/session/:sessionId', verifyToken, getSessionStatus);

module.exports = router;

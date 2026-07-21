const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrder,
  trackOrder,
  adminListOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public tracking (QR code page) — must come before the /:id route.
router.get('/track/:token', trackOrder);

router.post('/', verifyToken, createOrder);
router.get('/mine', verifyToken, getMyOrders);
router.get('/', verifyToken, requireAdmin, adminListOrders);
router.get('/:id', verifyToken, getOrder);
router.patch('/:id/status', verifyToken, requireAdmin, updateOrderStatus);

module.exports = router;

/**
 * orderRoutes.js
 
 */

const express      = require('express');
const router       = express.Router();
const { verifyToken }    = require('../middleware/authMiddleware');
const { validateOrder, handleValidationErrors } = require('../middleware/validators/orderValidator');
const orderController    = require('../controllers/orderController');


// GET  /api/orders/my   — customer's own order history
router.get('/my', verifyToken, orderController.getMyOrders);

// GET  /api/orders/:id  — single order detail (customer must own the order)
router.get('/:id', verifyToken, orderController.getOrderDetail);

// POST /api/orders      — place a new order
router.post(
  '/',
  verifyToken,
  validateOrder,
  handleValidationErrors,
  orderController.createOrder
);

module.exports = router;
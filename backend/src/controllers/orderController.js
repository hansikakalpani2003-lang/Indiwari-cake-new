/**
 * orderController.js
 * Route handler functions for order-related endpoints.
 *
 * Routes handled:
 *   POST /api/orders            → createOrder (customer)
 *   GET  /api/orders/my         → getMyOrders (customer)
 *   GET  /api/orders/:id        → getOrderDetail (customer — own orders only)
 *   GET  /api/admin/orders      → getAllOrdersAdmin (admin)
 *   GET  /api/admin/orders/:id  → getAdminOrderDetail (admin)
 */

const orderService  = require('../services/orderService');
const asyncWrapper  = require('../utils/asyncWrapper');

// ── POST /api/orders ─────────────────────────────────────────────────────────
/**
 * Customer places a new order.
 * Cart items + delivery details come from request body.
 * JWT customerId comes from req.user.userId (set by verifyToken).
 */
const createOrder = asyncWrapper(async (req, res) => {
  const customerId = req.user.userId;
  const { items, delivery_address, delivery_date, special_instructions } = req.body;

  const result = await orderService.createOrder(customerId, {
    items,
    delivery_address,
    delivery_date,
    special_instructions,
  });

  res.status(201).json({
    message: 'Order placed successfully.',
    orderId:         result.orderId,
    order_reference: result.order_reference,
    qr_code_token:   result.qr_code_token,
    qr_code_data_url: result.qr_code_data_url,
    status:          result.status,
    total_amount:    result.total_amount,
  });
});

// ── GET /api/orders/my ───────────────────────────────────────────────────────
/**
 * Returns all orders for the logged-in customer, newest first.
 */
const getMyOrders = asyncWrapper(async (req, res) => {
  const customerId = req.user.userId;
  const orders = await orderService.getCustomerOrders(customerId);

  res.status(200).json({ orders });
});

// ── GET /api/orders/:id ──────────────────────────────────────────────────────
/**
 * Returns full order detail for the logged-in customer.
 * Returns 404 if the order doesn't exist or belongs to another customer.
 */
const getOrderDetail = asyncWrapper(async (req, res) => {
  const customerId = req.user.userId;
  const orderId    = parseInt(req.params.id, 10);

  if (isNaN(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  const order = await orderService.getOrderById(orderId, customerId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  res.status(200).json({ order });
});

// ── GET /api/admin/orders ─────────────────────────────────────────────────────
/**
 * Admin — returns all orders, with optional filters:
 *   Query params: ?status=Pending&date_from=2026-05-01&date_to=2026-05-31&search=customer_name
 */
const getAllOrdersAdmin = asyncWrapper(async (req, res) => {
  const { status, date_from, date_to, search } = req.query;
  const orders = await orderService.getAllOrdersAdmin({ status, date_from, date_to, search });

  res.status(200).json({ orders });
});

// ── GET /api/admin/orders/:id ─────────────────────────────────────────────────
/**
 * Admin — returns full order detail including customer info and all items.
 */
const getAdminOrderDetail = asyncWrapper(async (req, res) => {
  const orderId = parseInt(req.params.id, 10);

  if (isNaN(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  const order = await orderService.getOrderByIdAdmin(orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  res.status(200).json({ order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetail,
  getAllOrdersAdmin,
  getAdminOrderDetail,
};
const stripe = require('../config/stripe');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Stripe wants amounts as the smallest currency unit. LKR has no
// sub-unit in Stripe's zero-decimal list, so amounts are passed as-is
// (whole rupees), not multiplied by 100.
// https://docs.stripe.com/currencies#zero-decimal
const CURRENCY = (process.env.STRIPE_CURRENCY || 'lkr').toLowerCase();
const ZERO_DECIMAL_CURRENCIES = ['lkr', 'jpy', 'krw', 'vnd']; // subset relevant here

function toStripeAmount(amount) {
  return ZERO_DECIMAL_CURRENCIES.includes(CURRENCY) ? Math.round(amount) : Math.round(amount * 100);
}

// POST /api/payments/create-checkout-session/:orderId
// Creates a Stripe-hosted Checkout page for an existing, unpaid order.
const createCheckoutSession = asyncHandler(async (req, res) => {
  const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
  if (orderRows.length === 0) throw new ApiError(404, 'Order not found.');
  const order = orderRows[0];

  if (order.customer_id !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have access to this order.');
  }
  if (order.payment_status === 'paid') {
    throw new ApiError(400, 'This order has already been paid for.');
  }

  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  if (items.length === 0) throw new ApiError(400, 'Order has no items.');

  const line_items = items.map((item) => ({
    price_data: {
      currency: CURRENCY,
      product_data: {
        name: item.menu_item_name,
        description: [item.size, item.flavour].filter(Boolean).join(' · ') || undefined,
      },
      unit_amount: toStripeAmount(item.unit_price),
    },
    quantity: item.quantity,
  }));

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items,
    customer_email: req.user.email,
    success_url: `${clientUrl}/orders/${order.id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/orders/${order.id}?payment=cancelled`,
    metadata: {
      order_id: String(order.id),
      order_reference: order.order_reference,
    },
  });

  await pool.query(
    `UPDATE orders SET payment_method = 'card', stripe_session_id = ? WHERE id = ?`,
    [session.id, order.id]
  );

  res.json({ success: true, checkout_url: session.url, session_id: session.id });
});

// GET /api/payments/session/:sessionId — used by the success page to
// confirm payment state immediately after redirect (webhook is the
// source of truth, but this gives instant UI feedback).
const getSessionStatus = asyncHandler(async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
  res.json({
    success: true,
    payment_status: session.payment_status,
    order_id: session.metadata?.order_id || null,
  });
});

// Marks an order as paid + moves it to Confirmed, recording the change
// in order_status_history. Idempotent — safe if Stripe retries the webhook.
async function markOrderPaid(orderId, paymentIntentId) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  const order = rows[0];
  if (!order || order.payment_status === 'paid') return;

  await pool.query(
    `UPDATE orders
     SET payment_status = 'paid', stripe_payment_intent_id = ?, status = 'Confirmed'
     WHERE id = ?`,
    [paymentIntentId || null, orderId]
  );

  await pool.query(
    `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
     VALUES (?, ?, 'Confirmed', ?)`,
    [orderId, order.status, order.customer_id]
  );
}

async function markOrderPaymentFailed(orderId) {
  await pool.query(`UPDATE orders SET payment_status = 'failed' WHERE id = ? AND payment_status != 'paid'`, [
    orderId,
  ]);
}

// POST /api/payments/webhook — Stripe calls this server-to-server.
// Mounted with express.raw() (NOT express.json()) so the signature can
// be verified against the exact raw request body.
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️  Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await markOrderPaid(orderId, session.payment_intent);
      }
      break;
    }
    case 'checkout.session.expired': {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId) await markOrderPaymentFailed(orderId);
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      // Only set if we can trace it back to an order via metadata.
      const orderId = intent.metadata?.order_id;
      if (orderId) await markOrderPaymentFailed(orderId);
      break;
    }
    default:
      // Unhandled event types are fine to ignore.
      break;
  }

  res.json({ received: true });
});

module.exports = { createCheckoutSession, getSessionStatus, handleWebhook };

/**
 * emailService.js
 * Loads HTML email templates, fills in placeholder tokens, and sends emails
 * via the Nodemailer transporter configured in config/nodemailer.js.
 *
 * Design principles:
 *   1. Fire-and-forget  — callers never await these functions.
 *                         Email failures must not block or fail the API response.
 *   2. Graceful errors  — every send is wrapped in try/catch; failures are
 *                         console.error'd but never re-thrown.
 *   3. Template-based   — HTML lives in /templates/*.html; token replacement
 *                         uses a simple {PLACEHOLDER} → value swap.
 *
 * Public API:
 *   sendOrderReceived(customerEmail, orderData)  — fires after order creation
 *   sendStatusUpdate(customerEmail, orderData, newStatus) — fires after status change
 *
 * Used by: orderService.js (createOrder, updateOrderStatus)
 */

'use strict';

const fs          = require('fs');
const path        = require('path');
const transporter = require('../config/nodemailer');

// ── Template Directory ─────────────────────────────────────────────────────────
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// ── Status → Template Map ──────────────────────────────────────────────────────
// Maps each order status (used after a transition) to its email template filename.
// 'Pending' is not included here because the order-received email is sent
// separately via sendOrderReceived(), not via sendStatusUpdate().
const STATUS_TEMPLATE_MAP = {
  'Confirmed':        'orderConfirmed',
  'Being Prepared':   'beingPrepared',
  'Out for Delivery': 'outForDelivery',
  'Delivered':        'delivered',
};

// ── Status → Subject Line Map ──────────────────────────────────────────────────
const STATUS_SUBJECT_MAP = {
  'Confirmed':        (ref) => `Your order ${ref} is confirmed! 🎂`,
  'Being Prepared':   (_)   => `Your cake is being prepared! 👨‍🍳`,
  'Out for Delivery': (ref) => `Your order ${ref} is on the way! 🚚`,
  'Delivered':        (ref) => `Order ${ref} delivered — enjoy! 🎉`,
};

// ── Template Loader & Token Replacer ──────────────────────────────────────────
/**
 * Reads an HTML template file from the templates directory and replaces every
 * occurrence of {TOKEN_NAME} with the corresponding value from the replacements
 * object. Returns the filled HTML string.
 *
 * @param {string} templateName    - Filename without .html extension
 * @param {Object} replacements    - { TOKEN_NAME: 'value', ... }
 * @returns {string}               - Filled HTML string ready to send
 *
 * @throws {Error} if the template file does not exist
 */
function loadTemplate(templateName, replacements) {
  const filePath = path.join(TEMPLATES_DIR, `${templateName}.html`);

  // readFileSync is fine here — this runs inside setImmediate / non-blocking context
  const raw = fs.readFileSync(filePath, 'utf-8');

  // Replace every {PLACEHOLDER} token with its value from replacements
  const filled = raw.replace(/\{([A-Z_]+)\}/g, (match, token) => {
    const value = replacements[token];
    // Leave the placeholder visible in output if a value is missing — makes
    // missing tokens easy to spot during development
    return value !== undefined ? value : match;
  });

  return filled;
}

// ── Format Delivery Date ────────────────────────────────────────────────────────
/**
 * Formats a MySQL date string (YYYY-MM-DD) or Date object into a human-readable
 * string like "Sunday, June 14, 2026".
 *
 * @param {string|Date} dateInput
 * @returns {string}
 */
function formatDeliveryDate(dateInput) {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
    timeZone: 'Asia/Colombo',
  });
}

// ── Format Currency ─────────────────────────────────────────────────────────────
/**
 * Formats a numeric amount as Sri Lankan Rupees.
 *
 * @param {number|string} amount
 * @returns {string}  e.g. "LKR 4,500.00"
 */
function formatCurrency(amount) {
  return `LKR ${parseFloat(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Build Common Replacements ───────────────────────────────────────────────────
/**
 * Builds the token replacement object used by all templates.
 *
 * @param {Object} orderData  - Must include: customer_name, order_reference,
 *                              delivery_date, total_amount, qr_code_token
 * @returns {Object}
 */
function buildReplacements(orderData) {
  const trackingLink = `${process.env.CLIENT_URL}/order/${orderData.qr_code_token}`;

  return {
    CUSTOMER_NAME:  orderData.customer_name  || 'Valued Customer',
    ORDER_REF:      orderData.order_reference,
    DELIVERY_DATE:  formatDeliveryDate(orderData.delivery_date),
    TOTAL_AMOUNT:   formatCurrency(orderData.total_amount),
    TRACKING_LINK:  trackingLink,
    CLIENT_URL:     process.env.CLIENT_URL,
    YEAR:           new Date().getFullYear().toString(),
  };
}

// ── Send: Order Received ───────────────────────────────────────────────────────
/**
 * Sends the "Order Received" email after a new order is placed.
 * Called from orderService.createOrder() — fire-and-forget.
 *
 * @param {string} customerEmail   - The customer's email address
 * @param {Object} orderData       - { customer_name, order_reference, delivery_date,
 *                                     total_amount, qr_code_token }
 */
async function sendOrderReceived(customerEmail, orderData) {
  try {
    const replacements = buildReplacements(orderData);
    const html = loadTemplate('orderReceived', replacements);

    await transporter.sendMail({
      from:    `"Indiwari Cake" <${process.env.SMTP_USER}>`,
      to:      customerEmail,
      subject: `Your Indiwari Cake order ${orderData.order_reference} has been received`,
      html,
    });

    console.log(`[Email] ✓  Order received email sent → ${customerEmail} (${orderData.order_reference})`);
  } catch (err) {
    console.error(`[Email] ✗  Failed to send order-received email → ${customerEmail}:`, err.message);
    // Do NOT re-throw — email failure must not affect the API response
  }
}

// ── Send: Status Update ────────────────────────────────────────────────────────
/**
 * Sends the appropriate status-change email based on the new order status.
 * Called from orderService.updateOrderStatus() — fire-and-forget.
 *
 * Handles: Confirmed, Being Prepared, Out for Delivery, Delivered
 * Does nothing (with a log) if newStatus has no matching template.
 *
 * @param {string} customerEmail   - The customer's email address
 * @param {Object} orderData       - { customer_name, order_reference, delivery_date,
 *                                     total_amount, qr_code_token }
 * @param {string} newStatus       - The status the order has just moved to
 */
async function sendStatusUpdate(customerEmail, orderData, newStatus) {
  const templateName = STATUS_TEMPLATE_MAP[newStatus];
  const subjectFn    = STATUS_SUBJECT_MAP[newStatus];

  if (!templateName || !subjectFn) {
    // No email defined for this status (e.g. 'Pending' → handled by sendOrderReceived)
    console.log(`[Email]    No template for status "${newStatus}" — skipping.`);
    return;
  }

  try {
    const replacements = buildReplacements(orderData);
    const html         = loadTemplate(templateName, replacements);
    const subject      = subjectFn(orderData.order_reference);

    await transporter.sendMail({
      from:    `"Indiwari Cake" <${process.env.SMTP_USER}>`,
      to:      customerEmail,
      subject,
      html,
    });

    console.log(`[Email] ✓  Status-update email (${newStatus}) sent → ${customerEmail} (${orderData.order_reference})`);
  } catch (err) {
    console.error(`[Email] ✗  Failed to send status-update email (${newStatus}) → ${customerEmail}:`, err.message);
    // Do NOT re-throw — email failure must not affect the API response
  }
}

module.exports = { sendOrderReceived, sendStatusUpdate };
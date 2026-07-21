const Stripe = require('stripe');
require('dotenv').config();

if (!process.env.STRIPE_SECRET_KEY) {
  // Don't crash the whole app on boot — just warn loudly, since a dev
  // may be working on non-payment features and hasn't set Stripe keys yet.
  console.warn(
    '⚠️  STRIPE_SECRET_KEY is not set in backend/.env — payment routes will fail until it is.'
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
});

module.exports = stripe;

-- 003_add_stripe_payment.sql
-- Adds Stripe online-payment support to the orders table.
-- Replaces the old "cash_on_delivery only" placeholder with a real
-- card-payment flow backed by Stripe Checkout.
--
-- Run this against an existing indiwari_db database that was created
-- from an earlier schema version. Fresh installs can just use the
-- updated backend/database/indiwari_complete.sql instead.

ALTER TABLE orders
  MODIFY COLUMN payment_method ENUM('card') NOT NULL DEFAULT 'card';

ALTER TABLE orders
  ADD COLUMN payment_status ENUM('unpaid', 'paid', 'failed', 'refunded')
    NOT NULL DEFAULT 'unpaid' AFTER payment_method,
  ADD COLUMN stripe_checkout_session_id VARCHAR(255) NULL AFTER payment_status,
  ADD COLUMN stripe_payment_intent_id   VARCHAR(255) NULL AFTER stripe_checkout_session_id,
  ADD COLUMN paid_at DATETIME NULL AFTER stripe_payment_intent_id;

CREATE INDEX idx_orders_stripe_session ON orders (stripe_checkout_session_id);

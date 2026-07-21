-- ============================================================
-- Migration: 002_add_stripe_payment
-- Description: Adds Stripe Checkout support to the orders table.
--   - payment_method gains a 'card' option (Stripe) alongside
--     the existing 'cash_on_delivery'.
--   - payment_status tracks whether the Stripe payment actually
--     succeeded, independent of the delivery `status` column.
--   - stripe_session_id / stripe_payment_intent_id let the
--     webhook handler find and update the right order.
-- Safe to run on a fresh DB (built on top of 001_initial_schema)
-- or on an existing indiwari_db that only has the original schema.
-- ============================================================

USE indiwari_db;

ALTER TABLE orders
  MODIFY COLUMN payment_method ENUM('cash_on_delivery', 'card') NOT NULL DEFAULT 'cash_on_delivery';

ALTER TABLE orders
  ADD COLUMN payment_status ENUM('unpaid', 'paid', 'failed', 'refunded')
    NOT NULL DEFAULT 'unpaid' AFTER payment_method;

ALTER TABLE orders
  ADD COLUMN stripe_session_id VARCHAR(255) NULL AFTER payment_status;

ALTER TABLE orders
  ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL AFTER stripe_session_id;

CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);

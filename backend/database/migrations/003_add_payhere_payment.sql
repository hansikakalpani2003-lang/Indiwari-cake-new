-- ============================================================
-- Migration 003: Replace Cash on Delivery with PayHere gateway
-- Adds payment_status + PayHere reference columns to orders,
-- and widens payment_method to record 'payhere'.
-- Run this against indiwari_db after 002_add_delivery_assignment.sql.
-- ============================================================

USE indiwari_db;

ALTER TABLE orders
  MODIFY COLUMN payment_method ENUM('payhere') NOT NULL DEFAULT 'payhere',
  ADD COLUMN payment_status ENUM('Pending', 'Paid', 'Failed', 'Cancelled')
              NOT NULL DEFAULT 'Pending' AFTER payment_method,
  ADD COLUMN payhere_payment_id VARCHAR(100) NULL AFTER payment_status;

CREATE INDEX idx_orders_payment_status ON orders(payment_status);

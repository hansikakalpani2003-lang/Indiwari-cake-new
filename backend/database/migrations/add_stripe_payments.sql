-- Migration: add Stripe card-payment support alongside existing Cash on Delivery
-- Run this against your MySQL database before deploying the new code.

ALTER TABLE orders
  ADD COLUMN payment_method ENUM('cod', 'card') NOT NULL DEFAULT 'cod' AFTER status,
  ADD COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending' AFTER payment_method,
  ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL AFTER payment_status;

-- Optional but recommended: a log table so every Stripe event/attempt is auditable,
-- separate from the single "current" status stored on the order itself.
CREATE TABLE IF NOT EXISTS payment_events (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  order_id                  INT NOT NULL,
  stripe_payment_intent_id  VARCHAR(255) NOT NULL,
  event_type                VARCHAR(100) NOT NULL,   -- e.g. payment_intent.succeeded
  amount                    DECIMAL(10,2) NULL,
  raw_status                VARCHAR(50) NULL,         -- Stripe's status string
  created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_events_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX idx_payment_events_intent ON payment_events (stripe_payment_intent_id);

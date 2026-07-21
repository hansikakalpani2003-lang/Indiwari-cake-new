-- ============================================================
-- Migration 002: Link orders to delivery_persons
-- Adds the column the admin dashboard needs to assign a
-- delivery person to an order, plus a helpful index.
-- Run this against indiwari_db after 001_schema.sql.
-- ============================================================

USE indiwari_db;

ALTER TABLE orders
  ADD COLUMN delivery_person_id INT NULL AFTER delivery_address,
  ADD CONSTRAINT fk_orders_delivery_person
    FOREIGN KEY (delivery_person_id) REFERENCES delivery_persons(id)
    ON DELETE SET NULL;

CREATE INDEX idx_orders_delivery_person ON orders(delivery_person_id);

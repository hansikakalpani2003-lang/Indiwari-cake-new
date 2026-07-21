-- ============================================================
-- Migration: 001_initial_schema
-- Description: Create all 5 tables for Indiwari Cake v1.0
-- Author: R.M.H.K. Bandaranayake (KUR/IT/2324/F/0029)
-- Date: May 2026
-- ============================================================

USE indiwari_db;

DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id               INT            AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(150)   NOT NULL,
  email            VARCHAR(255)   NOT NULL UNIQUE,
  password_hash    VARCHAR(255)   NOT NULL,
  role             ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  phone            VARCHAR(20),
  delivery_address TEXT,
  created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE menu_items (
  id             INT             AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(200)    NOT NULL,
  description    TEXT,
  base_price     DECIMAL(10, 2)  NOT NULL,
  image_url      VARCHAR(500),
  cloudinary_id  VARCHAR(300),
  category       VARCHAR(100),
  is_available   BOOLEAN         DEFAULT TRUE,
  created_at     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  id                   INT             AUTO_INCREMENT PRIMARY KEY,
  order_reference      VARCHAR(20)     NOT NULL UNIQUE,
  customer_id          INT             NOT NULL,
  delivery_address     TEXT            NOT NULL,
  delivery_date        DATE            NOT NULL,
  special_instructions TEXT,
  status               ENUM(
                         'Pending',
                         'Confirmed',
                         'Being Prepared',
                         'Out for Delivery',
                         'Delivered'
                       )               NOT NULL DEFAULT 'Pending',
  total_amount         DECIMAL(10, 2)  NOT NULL,
  payment_method       ENUM('cash_on_delivery') DEFAULT 'cash_on_delivery',
  qr_code_data_url     LONGTEXT,
  qr_code_token        VARCHAR(100)    UNIQUE,
  created_at           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
  id               INT             AUTO_INCREMENT PRIMARY KEY,
  order_id         INT             NOT NULL,
  menu_item_id     INT             NOT NULL,
  menu_item_name   VARCHAR(200)    NOT NULL,
  quantity         INT             NOT NULL DEFAULT 1,
  unit_price       DECIMAL(10, 2)  NOT NULL,
  size             VARCHAR(50),
  flavour          VARCHAR(100),
  decoration_note  VARCHAR(300),
  item_subtotal    DECIMAL(10, 2)  NOT NULL,
  FOREIGN KEY (order_id)     REFERENCES orders(id)     ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_status_history (
  id          INT         AUTO_INCREMENT PRIMARY KEY,
  order_id    INT         NOT NULL,
  old_status  VARCHAR(50),
  new_status  VARCHAR(50) NOT NULL,
  changed_by  INT         NOT NULL,
  changed_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_orders_customer      ON orders(customer_id);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_order_items_order    ON order_items(order_id);
CREATE INDEX idx_status_history_order ON order_status_history(order_id);
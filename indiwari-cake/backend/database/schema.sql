-- ============================================================
-- Indiwari Cake — Full Database Schema
-- Developer: R.M.H.K. Bandaranayake (KUR/IT/2324/F/0029)
-- SLIATE — ATI Kurunegala | IT4052 ICT Project | Batch 2324(FT)
-- ============================================================

-- Use the correct database
USE indiwari_db;

-- Drop tables in reverse dependency order (safe re-run)
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS users;

-- ─────────────────────────────────────────────────────────────
-- TABLE 1: users
-- Stores all registered users (customers and the admin).
-- role ENUM enforces only two valid roles in the system.
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- TABLE 2: menu_items
-- Stores all cake products offered by the business.
-- cloudinary_id is used to delete the image from Cloudinary if
-- the menu item is deleted.
-- is_available allows soft-disabling items without deleting them.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE menu_items (
  id             INT             AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(200)    NOT NULL,
  description    TEXT,
  base_price     DECIMAL(10, 2)  NOT NULL,
  image_url      VARCHAR(500),                     -- Cloudinary delivery URL
  cloudinary_id  VARCHAR(300),                     -- Cloudinary public_id for deletion
  category       VARCHAR(100),                     -- e.g. 'Birthday Cake', 'Tiffin', 'Special Order'
  is_available   BOOLEAN         DEFAULT TRUE,
  created_at     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 3: orders
-- Core order record. Links to a customer (users.id).
-- qr_code_token: UUID stored in the URL → /order/:token (public)
-- qr_code_data_url: base64 PNG of the QR image saved server-side
-- status ENUM enforces only the 5 valid delivery stages.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id                   INT             AUTO_INCREMENT PRIMARY KEY,
  order_reference      VARCHAR(20)     NOT NULL UNIQUE,   -- e.g. IC-20260530-0001
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
  qr_code_data_url     LONGTEXT,                          -- base64 encoded PNG
  qr_code_token        VARCHAR(100)    UNIQUE,            -- UUID token for public URL
  created_at           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 4: order_items
-- Each row = one line item within an order.
-- menu_item_name and unit_price are SNAPSHOTS taken at order time.
-- This ensures the order record is accurate even if the menu item
-- is later edited or deleted.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE order_items (
  id               INT             AUTO_INCREMENT PRIMARY KEY,
  order_id         INT             NOT NULL,
  menu_item_id     INT             NOT NULL,
  menu_item_name   VARCHAR(200)    NOT NULL,   -- snapshot of name at order time
  quantity         INT             NOT NULL DEFAULT 1,
  unit_price       DECIMAL(10, 2)  NOT NULL,   -- snapshot of price at order time
  size             VARCHAR(50),                -- e.g. '500g', '1kg', '2kg', 'Slice'
  flavour          VARCHAR(100),               -- e.g. 'Chocolate', 'Vanilla', 'Strawberry'
  decoration_note  VARCHAR(300),               -- e.g. 'Happy Birthday Amali ❤️'
  item_subtotal    DECIMAL(10, 2)  NOT NULL,   -- quantity × unit_price
  FOREIGN KEY (order_id)     REFERENCES orders(id)     ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 5: order_status_history
-- Immutable audit log of every status change made by an admin.
-- old_status is NULL for the very first transition from creation.
-- changed_by references the admin user who made the change.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE order_status_history (
  id          INT         AUTO_INCREMENT PRIMARY KEY,
  order_id    INT         NOT NULL,
  old_status  VARCHAR(50),                   -- NULL on first entry
  new_status  VARCHAR(50) NOT NULL,
  changed_by  INT         NOT NULL,          -- admin user id
  changed_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- Useful indexes for query performance
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_orders_customer     ON orders(customer_id);
CREATE INDEX idx_orders_status       ON orders(status);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_status_history_order ON order_status_history(order_id);
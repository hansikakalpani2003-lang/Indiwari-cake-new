CREATE DATABASE IF NOT EXISTS indiwari_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE indiwari_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS delivery_persons;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  phone VARCHAR(20),
  delivery_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE delivery_persons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  vehicle_type VARCHAR(80) NOT NULL,
  vehicle_number VARCHAR(50),
  status ENUM('Available','Delivering','Inactive') NOT NULL DEFAULT 'Available',
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  cloudinary_id VARCHAR(300),
  category VARCHAR(100),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_reference VARCHAR(30) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  delivery_person_id INT NULL,
  delivery_address TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  special_instructions TEXT,
  status ENUM('Pending','Confirmed','Being Prepared','Out for Delivery','Delivered') NOT NULL DEFAULT 'Pending',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash_on_delivery') NOT NULL DEFAULT 'cash_on_delivery',
  qr_code_data_url LONGTEXT,
  qr_code_token VARCHAR(100) UNIQUE,
  accepted_at DATETIME NULL,
  delivered_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_delivery FOREIGN KEY (delivery_person_id) REFERENCES delivery_persons(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  menu_item_name VARCHAR(200) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  size VARCHAR(50),
  flavour VARCHAR(100),
  decoration_note VARCHAR(300),
  item_subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_menu FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by INT NULL,
  changed_by_delivery_person_id INT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_history_delivery FOREIGN KEY (changed_by_delivery_person_id) REFERENCES delivery_persons(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_delivery_person ON orders(delivery_person_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_status_history_order ON order_status_history(order_id);

INSERT INTO users (name,email,password_hash,role,phone,delivery_address) VALUES
('Indiwari Admin','admin@indiwari.lk','$2b$12$t9/kKXGK4R289aCbiILeT.ink5jaxSO9ei.lCgB5uW7ATXpOXm2ku','admin','0770000000','Kurunegala, Sri Lanka');

INSERT INTO delivery_persons (name,email,phone,password_hash,vehicle_type,vehicle_number,status) VALUES
('Demo Delivery Person','delivery@indiwari.lk','0771112233','$2b$12$KLld6h5hckEKYRQP3gWawex7Cf/EhTMLuyGfe0EY0eduueU5orzny','Motorbike','NW ABC-1234','Available');

INSERT INTO menu_items (name,description,base_price,category,is_available) VALUES
('Classic Vanilla Birthday Cake','Soft vanilla sponge with fresh cream and strawberry filling.',2500.00,'Birthday Cake',TRUE),
('Chocolate Truffle Cake','Rich chocolate sponge with dark chocolate ganache.',3200.00,'Birthday Cake',TRUE),
('Rainbow Confetti Cake','Colourful layered cake with vanilla buttercream.',2800.00,'Birthday Cake',TRUE),
('Butter Sponge Loaf','Traditional buttery sponge loaf for tea time.',1200.00,'Tiffin',TRUE),
('Chocolate Brownie Box','A box of rich fudgy brownies.',1800.00,'Tiffin',TRUE),
('Wedding Celebration Cake','Custom celebration cake with elegant decoration.',6500.00,'Special Order',TRUE);

-- Migration: site_settings table
-- Stores editable homepage content (currently just the Hero section).
-- Single-row table (id always = 1) — admin edits it, public homepage reads it.

CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  hero_tagline VARCHAR(200) NOT NULL DEFAULT 'Freshly Baked Delicious',
  hero_title VARCHAR(300) NOT NULL DEFAULT 'Making your celebration sweeter, one slice at a time',
  hero_image_url VARCHAR(500) DEFAULT 'https://thumbs.dreamstime.com/b/soft-blurred-bakery-shop-background-creates-cozy-atmosphere-sweet-treats-soft-blurred-bakery-shop-background-creates-cozy-381989942.jpg',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_site_settings_single_row CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO site_settings (id) VALUES (1);

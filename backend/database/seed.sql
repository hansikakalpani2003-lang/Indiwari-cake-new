
USE indiwari_db;

-- ─────────────────────────────────────────────────────────────
-- ADMIN USER
-- Email:    admin@indiwari.lk
-- Password: Admin@1234
-- The hash below was generated with bcryptjs saltRounds=12.
-- NEVER store or commit the plain-text password.
-- ─────────────────────────────────────────────────────────────
INSERT INTO users (name, email, password_hash, role, phone, delivery_address)
VALUES (
  'Indiwari Admin',
  'admin@indiwari.lk',
  $2b$12$faDaZmt7BcmHvk0PVKrtI.DzT9H1ng9LOiOdxH5vCbLZwFlBSaGWe,
  'admin',
  '+94 77 000 0000',
  'Kurunegala, Sri Lanka'
);

-- ─────────────────────────────────────────────────────────────
-- NOTE: The hash above is a placeholder. Run the script below
-- in Node.js to generate a real hash and replace it:
--
--   node -e "
--     const bcrypt = require('bcryptjs');
--     bcrypt.hash('Admin@1234', 12).then(h => console.log(h));
--   "
--
-- Then replace the hash string in the INSERT above.
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- SAMPLE MENU ITEMS — 3 Categories, 8 Items
-- image_url is left NULL here; admin adds real images via the
-- admin panel (Cloudinary upload) after deployment.
-- ─────────────────────────────────────────────────────────────

-- Category 1: Birthday Cakes
INSERT INTO menu_items (name, description, base_price, category, is_available)
VALUES (
  'Classic Vanilla Birthday Cake',
  'Light, fluffy vanilla sponge layered with fresh cream and strawberry jam. Decorated with pastel buttercream swirls. Available in round or square tiers.',
  2500.00,
  'Birthday Cake',
  TRUE
);

INSERT INTO menu_items (name, description, base_price, category, is_available)
VALUES (
  'Chocolate Truffle Birthday Cake',
  'Rich Belgian chocolate sponge filled with dark chocolate ganache. Finished with glossy truffle glaze and edible gold dust accents.',
  3200.00,
  'Birthday Cake',
  TRUE
);

INSERT INTO menu_items (name, description, base_price, category, is_available)
VALUES (
  'Rainbow Confetti Cake',
  'Vibrant multi-layered sponge in six colours, filled with vanilla buttercream and rainbow sprinkles. Perfect for children\'s parties.',
  2800.00,
  'Birthday Cake',
  TRUE
);

-- Category 2: Tiffin (Daily / Regular Cakes)
INSERT INTO menu_items (name, description, base_price, category, is_available)
VALUES (
  'Butter Sponge Loaf',
  'Classic Sri Lankan-style butter loaf, lightly sweetened with vanilla essence. Ideal for morning or evening tea. Sold per 500g loaf.',
  650.00,
  'Tiffin',
  TRUE
);

INSERT INTO menu_items (name, description, base_price, category, is_available)
VALUES (
  'Love Cake',
  'Traditional Sri Lankan love cake with semolina, cashews, pumpkin preserve, and rose water. Dense, fragrant, and authentically made.',
  900.00,
  'Tiffin',
  TRUE
);

INSERT INTO menu_items (name, description, base_price, category, is_available)
VALUES (
  'Chocolate Fudge Brownies (6 pcs)',
  'Fudgy, dense chocolate brownies baked in a tray and cut into 6 generous pieces. Walnuts optional — specify in the decoration note.',
  750.00,
  'Tiffin',
  TRUE
);

-- Category 3: Special Orders
INSERT INTO menu_items (name, description, base_price, category, is_available)
VALUES (
  'Wedding Tier Cake',
  'Elegant 2 or 3-tier fondant wedding cake. Base price is for a 2-tier white fondant cake. Customise colour, flavour, and decoration in your order note. Price varies with complexity — admin will confirm total after review.',
  18000.00,
  'Special Order',
  TRUE
);

INSERT INTO menu_items (name, description, base_price, category, is_available)
VALUES (
  'Photo Print Cake',
  'Any flavour sponge topped with an edible image of your choice. Provide the image URL or upload instructions in the decoration note. 1kg round cake included in base price.',
  3500.00,
  'Special Order',
  TRUE
);
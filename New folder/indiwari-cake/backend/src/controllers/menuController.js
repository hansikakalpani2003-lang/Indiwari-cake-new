const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/menu — public list, only available items unless ?all=true (admin use)
const listMenuItems = asyncHandler(async (req, res) => {
  const showAll = req.query.all === 'true' && req.user?.role === 'admin';
  const sql = showAll
    ? 'SELECT * FROM menu_items ORDER BY category, name'
    : 'SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY category, name';
  const [rows] = await pool.query(sql);
  res.json({ success: true, items: rows });
});

// GET /api/menu/:id
const getMenuItem = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
  if (rows.length === 0) throw new ApiError(404, 'Menu item not found.');
  res.json({ success: true, item: rows[0] });
});

// POST /api/menu — admin only
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, base_price, image_url, category } = req.body;

  if (!name || base_price === undefined) {
    throw new ApiError(400, 'name and base_price are required.');
  }

  const [result] = await pool.query(
    `INSERT INTO menu_items (name, description, base_price, image_url, category, is_available)
     VALUES (?, ?, ?, ?, ?, TRUE)`,
    [name, description || null, base_price, image_url || null, category || null]
  );

  const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, item: rows[0] });
});

// PUT /api/menu/:id — admin only
const updateMenuItem = asyncHandler(async (req, res) => {
  const { name, description, base_price, image_url, category, is_available } = req.body;

  const [existing] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
  if (existing.length === 0) throw new ApiError(404, 'Menu item not found.');

  const current = existing[0];

  await pool.query(
    `UPDATE menu_items
     SET name = ?, description = ?, base_price = ?, image_url = ?, category = ?, is_available = ?
     WHERE id = ?`,
    [
      name ?? current.name,
      description ?? current.description,
      base_price ?? current.base_price,
      image_url ?? current.image_url,
      category ?? current.category,
      is_available ?? current.is_available,
      req.params.id,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
  res.json({ success: true, item: rows[0] });
});

// DELETE /api/menu/:id — admin only
const deleteMenuItem = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw new ApiError(404, 'Menu item not found.');
  res.json({ success: true, message: 'Menu item deleted.' });
});

module.exports = { listMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem };

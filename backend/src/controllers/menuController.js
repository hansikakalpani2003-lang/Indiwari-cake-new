/**
 * menuController.js
 * Route handlers for public menu routes and admin menu CRUD.
 */

const menuService = require('../services/menuService');
const asyncWrapper = require('../utils/asyncWrapper');

// ── PUBLIC ───────────────────────────────────────────────────────────────────

/**
 * GET /api/menu
 * Public — returns all available menu items grouped by category.
 */
const getAll = asyncWrapper(async (req, res) => {
  const items = await menuService.getAllAvailableItems();
  res.status(200).json({ items });
});

/**
 * GET /api/menu/:id
 * Public — returns a single menu item by ID.
 */
const getOne = asyncWrapper(async (req, res) => {
  const item = await menuService.getItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Menu item not found.' });
  }
  res.status(200).json({ item });
});

// ── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/menu
 * Admin only — returns all items including unavailable ones.
 */
const getAllAdmin = asyncWrapper(async (req, res) => {
  const items = await menuService.getAllItemsAdmin();
  res.status(200).json({ items });
});

/**
 * POST /api/admin/menu
 * Admin only — creates a new menu item.
 * Expects multipart/form-data (because of image upload).
 * If a file was uploaded, req.file.path is the Cloudinary URL.
 */
const create = asyncWrapper(async (req, res) => {
  const { name, description, base_price, category, is_available } = req.body;
  const image_url = req.file ? req.file.path : null;

  const newItem = await menuService.createItem({
    name,
    description,
    base_price,
    category,
    image_url,
    is_available,
  });

  res.status(201).json({ message: 'Menu item created successfully.', item: newItem });
});

/**
 * PATCH /api/admin/menu/:id
 * Admin only — updates a menu item. Image upload is optional.
 */
const update = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  // Check item exists
  const existing = await menuService.getItemById(id);
  if (!existing) {
    return res.status(404).json({ message: 'Menu item not found.' });
  }

  const updateData = { ...req.body };

  // If a new image was uploaded, override image_url
  if (req.file) {
    updateData.image_url = req.file.path;
  }

  const updatedItem = await menuService.updateItem(id, updateData);
  res.status(200).json({ message: 'Menu item updated successfully.', item: updatedItem });
});

/**
 * PATCH /api/admin/menu/:id/toggle
 * Admin only — flips the is_available flag.
 */
const toggleAvailability = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const db = require('../config/db');
  
  const [rows] = await db.query('SELECT id FROM menu_items WHERE id = ?', [id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Menu item not found.' });
  }
  
  const updatedItem = await menuService.toggleAvailability(id);
  const statusWord = updatedItem.is_available ? 'available' : 'unavailable';
  
  res.status(200).json({ message: `Menu item marked as ${statusWord}.`, item: updatedItem });
});

/**
 * DELETE /api/admin/menu/:id
 * Admin only — hard-deletes if no order history; soft-deletes otherwise.
 */
const remove = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  // Check item exists (including unavailable)
  const [rows] = await require('../config/db').query(
    'SELECT id FROM menu_items WHERE id = ?', [id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Menu item not found.' });
  }

  const result = await menuService.deleteItem(id);
  res.status(200).json(result);
});

module.exports = { getAll, getOne, getAllAdmin, create, update, toggleAvailability, remove };
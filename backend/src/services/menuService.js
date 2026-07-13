/**
 * menuService.js
 * All database operations for menu items.
 * Used by menuController.
 */

const db = require('../config/db');

// ── Get All Available Items (public) ────────────────────────────────────────

async function getAllAvailableItems() {
  const [rows] = await db.query(
    `SELECT id, name, description, base_price, category, image_url, is_available
     FROM menu_items
     WHERE is_available = TRUE
     ORDER BY category ASC, name ASC`
  );
  return rows;
}

// ── Get All Items (admin — includes unavailable) ────────────────────────────

async function getAllItemsAdmin() {
  const [rows] = await db.query(
    `SELECT id, name, description, base_price, category, image_url, is_available, created_at, updated_at
     FROM menu_items
     ORDER BY category ASC, name ASC`
  );
  return rows;
}

// ── Get Single Item by ID ────────────────────────────────────────────────────

async function getItemById(id) {
  const [rows] = await db.query(
    `SELECT id, name, description, base_price, category, image_url, is_available
     FROM menu_items
     WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

// ── Create Menu Item ─────────────────────────────────────────────────────────

async function createItem({ name, description, base_price, category, image_url, is_available }) {
  const isAvailable = is_available !== undefined ? Boolean(is_available) : true;

  const [result] = await db.query(
    `INSERT INTO menu_items (name, description, base_price, category, image_url, is_available)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, description || null, parseFloat(base_price), category, image_url || null, isAvailable]
  );

  return getItemById(result.insertId);
}

// ── Update Menu Item ─────────────────────────────────────────────────────────
// Only updates fields that are actually provided in the data object.

async function updateItem(id, data) {
  const allowedFields = ['name', 'description', 'base_price', 'category', 'image_url', 'is_available'];
  const setClauses = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(field === 'base_price' ? parseFloat(data[field]) : data[field]);
    }
  }

  if (setClauses.length === 0) {
    // Nothing to update — return current item
    return getItemById(id);
  }

  // Always update the updated_at timestamp
  setClauses.push('updated_at = NOW()');
  values.push(id); // for WHERE clause

  await db.query(
    `UPDATE menu_items SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  );

  return getItemById(id);
}

// ── Toggle Availability ───────────────────────────────────────────────────────

async function toggleAvailability(id) {
  await db.query(
    `UPDATE menu_items SET is_available = NOT is_available, updated_at = NOW() WHERE id = ?`,
    [id]
  );
  return getItemById(id);
}

// ── Delete Menu Item ──────────────────────────────────────────────────────────
// Hard-delete if no order_items reference this item.
// Soft-delete (is_available = FALSE) if it is referenced in any past order.

async function deleteItem(id) {
  const [orderRefs] = await db.query(
    `SELECT COUNT(*) AS ref_count FROM order_items WHERE menu_item_id = ?`,
    [id]
  );
  const refCount = orderRefs[0].ref_count;

  if (refCount > 0) {
    // Soft-delete: preserve data integrity for historical orders
    await db.query(
      `UPDATE menu_items SET is_available = FALSE, updated_at = NOW() WHERE id = ?`,
      [id]
    );
    return { deleted: false, softDeleted: true, message: 'Item hidden from menu (has order history).' };
  } else {
    // Hard-delete: no references exist
    await db.query(`DELETE FROM menu_items WHERE id = ?`, [id]);
    return { deleted: true, softDeleted: false, message: 'Item permanently deleted.' };
  }
}

module.exports = {
  getAllAvailableItems,
  getAllItemsAdmin,
  getItemById,
  createItem,
  updateItem,
  toggleAvailability,
  deleteItem,
};


import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // ── State ────────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = sessionStorage.getItem('indiwari_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ── Persist to sessionStorage on every change ─────────────────────────────
  useEffect(() => {
    sessionStorage.setItem('indiwari_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ── Computed: total price ─────────────────────────────────────────────────
  const cartTotal = cartItems.reduce((sum, item) => sum + item.item_subtotal, 0);

  // ── Computed: total item count ────────────────────────────────────────────
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ── Add Item ──────────────────────────────────────────────────────────────
  const addItem = ({ menu_item_id, name, base_price, quantity, size, flavour, decoration_note }) => {
    const item_subtotal = parseFloat(base_price) * parseInt(quantity, 10);
    const cartItemId = `${menu_item_id}-${size}-${Date.now()}`;

    setCartItems(prev => [
      ...prev,
      { cartItemId, menu_item_id, name, base_price: parseFloat(base_price), quantity: parseInt(quantity, 10), size, flavour, decoration_note, item_subtotal },
    ]);
  };

  // ── Remove Item ───────────────────────────────────────────────────────────
  const removeItem = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  // ── Update Item Quantity ──────────────────────────────────────────────────
  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQuantity, item_subtotal: item.base_price * newQuantity }
          : item
      )
    );
  };

  // ── Clear Cart ────────────────────────────────────────────────────────────
  const clearCart = () => {
    setCartItems([]);
    sessionStorage.removeItem('indiwari_cart');
  };

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, cartCount, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

export default CartContext;
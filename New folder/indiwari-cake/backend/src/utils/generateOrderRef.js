// Generates a human-readable order reference like IC-20260718-0431
// (prefix - date - random 4 digits). Uniqueness is enforced at the DB
// level via the UNIQUE constraint on orders.order_reference; the caller
// retries on the rare collision.
function generateOrderRef() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `IC-${y}${m}${d}-${rand}`;
}

module.exports = generateOrderRef;

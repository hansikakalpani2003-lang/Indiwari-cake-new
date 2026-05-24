/**
 * asyncWrapper
 * Wraps an async route handler so that any rejected promise or thrown error
 * is automatically passed to Express's next() error handler.
 *
 * Usage:
 *   router.get('/route', asyncWrapper(async (req, res) => {
 *     const data = await someService();
 *     res.json(data);
 *   }));
 */
const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncWrapper;
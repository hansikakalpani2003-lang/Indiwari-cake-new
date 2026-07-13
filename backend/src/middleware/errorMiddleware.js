// backend/src/middleware/errorMiddleware.js

'use strict';

/**
 * Global Express error-handling middleware.
 *
 * Mount this AFTER all route registrations in app.js:
 *   app.use(errorMiddleware);
 *
 * Any route/controller that calls next(err) or throws inside
 * an async wrapper will land here.
 *
 * HTTP status mapping:
 *   ValidationError  → 422 Unprocessable Entity
 *   AuthError        → 401 Unauthorized
 *   ForbiddenError   → 403 Forbidden
 *   NotFoundError    → 404 Not Found
 *   ConflictError    → 409 Conflict
 *   Default          → 500 Internal Server Error
 *
 * In development (NODE_ENV !== 'production') the stack trace
 * is included in the response for easier debugging.
 * In production it is omitted.
 */

const errorMiddleware = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const isDev = process.env.NODE_ENV !== 'production';

  // Log every error to the console so it appears in server logs
  if (isDev) {
    console.error('────────────────────────────────────────');
    console.error('[errorMiddleware] Caught error:');
    console.error('  Route  :', req.method, req.originalUrl);
    console.error('  Message:', err.message);
    if (err.stack) console.error(err.stack);
    console.error('────────────────────────────────────────');
  } else {
    // Production: log the message only, not the full stack
    console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);
  }

  // ── Determine HTTP status code ──────────────────────────────
  let statusCode = err.statusCode || err.status || 500;

  // Map error type names to standard HTTP codes when no
  // explicit statusCode was attached by the throwing code
  if (!err.statusCode && !err.status) {
    switch (err.name) {
      case 'ValidationError':
        statusCode = 422;
        break;
      case 'AuthError':
        statusCode = 401;
        break;
      case 'ForbiddenError':
        statusCode = 403;
        break;
      case 'NotFoundError':
        statusCode = 404;
        break;
      case 'ConflictError':
        statusCode = 409;
        break;
      default:
        statusCode = 500;
    }
  }

  // ── Build response payload ──────────────────────────────────
  const payload = {
    success: false,
    message: err.message || 'An unexpected server error occurred.',
  };

  // Include stack trace in development only
  if (isDev && err.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = errorMiddleware;
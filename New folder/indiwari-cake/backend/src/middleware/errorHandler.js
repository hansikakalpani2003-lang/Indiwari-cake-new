// Central error handler — every route either calls next(err) or throws
// inside an asyncHandler-wrapped function, and it all lands here.
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server.';

  if (statusCode === 500) {
    // Only log unexpected errors with full detail; 4xx are normal traffic.
    console.error('❌ Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

// 404 fallback for unmatched routes.
function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };

// Small helper so controllers can `throw new ApiError(404, 'Order not found')`
// and the central error handler will turn it into the right HTTP response.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;

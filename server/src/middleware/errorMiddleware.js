/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

/**
 * Centralized Express Error Handler
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.message || err);

  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred on the server',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

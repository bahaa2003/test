import { logError } from './logger.js';

/**
 * Error handler for async functions
 * @param {Function} fn - Function to execute
 * @returns {Function} Error handling function
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error handler for async functions with logging
 * @param {Function} fn - Function to execute
 * @param {string} operation - Operation name for logging
 * @returns {Function} Error handling function
 */
export const catchAsyncWithLogging = (fn, operation = 'Unknown operation') => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      logError(`Error in ${operation}`, {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        user: req.user?.id
      });
      next(error);
    }
  };
};

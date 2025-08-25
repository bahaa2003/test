// middlewares/errorHandler.js
import { AppError } from '../utils/AppError.js';
import { logError } from '../utils/logger.js';

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack
    });
  } else if (process.env.NODE_ENV === 'production') {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      logError('Unhandled application error', { error: err.message, stack: err.stack });
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
};

export default globalErrorHandler;

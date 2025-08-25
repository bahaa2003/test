import winston from 'winston';
import path from 'path';

// Color configuration for different log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Standardized log format: [TIMESTAMP] LEVEL: message
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
  )
);

// JSON format for file logs
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Log directory path
const logDir = 'logs';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: jsonFormat,
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport in development environment
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: logFormat
  }));
}

// Helper logging functions with standardized format
export const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

export const logError = (message, meta = {}) => {
  logger.error(message, meta);
};

export const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

export const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

export const logHttp = (message, meta = {}) => {
  logger.http(message, meta);
};

// Export main logger instance
export default logger;

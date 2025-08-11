import winston from 'winston';
import path from 'path';

// تكوين الألوان للمستويات المختلفة
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// تنسيق السجلات
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// تنسيق JSON للسجلات
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// إنشاء المسارات للملفات
const logDir = 'logs';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: jsonFormat,
  transports: [
    // سجل الأخطاء
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // سجل جميع الرسائل
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// إضافة console transport في بيئة التطوير
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: logFormat,
  }));
}

// دوال مساعدة للتسجيل
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

// تصدير الكائن الرئيسي
export default logger;

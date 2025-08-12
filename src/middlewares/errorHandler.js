import {AppError} from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * معالج الأخطاء العام
 */
export const errorHandler = (err, req, res, next) => {
  let error = {...err};
  error.message = err.message;

  // تسجيل الخطأ
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // خطأ في Mongoose - معرف غير صحيح
  if (err.name === 'CastError') {
    const message = 'المورد غير موجود';
    error = new AppError(message, 400);
  }

  // خطأ في Mongoose - تكرار قيمة فريدة
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} مستخدم بالفعل`;
    error = new AppError(message, 400);
  }

  // خطأ في Mongoose - خطأ في التحقق من صحة البيانات
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message)
      .join(', ');
    error = new AppError(message, 400);
  }

  // خطأ في JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'توكن غير صالح';
    error = new AppError(message, 401);
  }

  // انتهاء صلاحية JWT
  if (err.name === 'TokenExpiredError') {
    const message = 'انتهت صلاحية التوكن';
    error = new AppError(message, 401);
  }

  // خطأ في Multer (رفع الملفات)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'حجم الملف كبير جداً';
    error = new AppError(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'حقل ملف غير متوقع';
    error = new AppError(message, 400);
  }

  // خطأ في MongoDB
  if (err.name === 'MongoError') {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `${field} مستخدم بالفعل`;
      error = new AppError(message, 400);
    } else {
      const message = 'خطأ في قاعدة البيانات';
      error = new AppError(message, 500);
    }
  }

  // خطأ في Mongoose - اتصال قاعدة البيانات
  if (err.name === 'MongooseServerSelectionError') {
    const message = 'لا يمكن الاتصال بقاعدة البيانات';
    error = new AppError(message, 500);
  }

  // خطأ في Mongoose - timeout
  if (err.name === 'MongooseError' && err.message.includes('timeout')) {
    const message = 'انتهت مهلة الاتصال بقاعدة البيانات';
    error = new AppError(message, 500);
  }

  // إرسال الاستجابة
  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'خطأ داخلي في الخادم',
    ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
  });
};

/**
 * معالج المسارات غير الموجودة
 */
export const notFound = (req, res, next) => {
  const error = new AppError(`المسار ${req.originalUrl} غير موجود`, 404);
  next(error);
};

/**
 * معالج الأخطاء غير المتوقعة
 */
export const unhandledRejection = (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
};

/**
 * معالج الأخطاء غير المعالجة
 */
export const uncaughtException = (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
};

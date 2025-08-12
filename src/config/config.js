/**
 * إعدادات التشغيل للتطبيق
 * هذه الإعدادات تستخدم في وقت التشغيل فقط
 */

export default {
  // إعدادات البيئة
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  host: process.env.HOST || 'localhost',

  // إعدادات JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },

  // إعدادات قاعدة البيانات
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    }
  },

  // إعدادات الأمان
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // إعدادات السجلات
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },

  // إعدادات NFC
  nfc: {
    cardExpiryYears: parseInt(process.env.NFC_EXPIRY_YEARS) || 4,
    maxRetries: parseInt(process.env.NFC_MAX_RETRIES) || 3
  }
};

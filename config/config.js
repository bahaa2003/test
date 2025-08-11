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
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },

  // إعدادات قاعدة البيانات
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system'
  },

  // إعدادات الأمان
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // إعدادات السجلات
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

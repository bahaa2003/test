/**
 * نموذج إعدادات التطبيق
 * انسخ هذا الملف إلى config.js وعدل القيم حسب احتياجاتك
 */

export default {
  // إعدادات الخادم
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // إعدادات قاعدة البيانات
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },

  // إعدادات JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-change-this',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },

  // إعدادات البريد الإلكتروني
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
    from: process.env.EMAIL_FROM || 'noreply@attendance-system.com'
  },

  // إعدادات الأمان
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // إعدادات الملفات
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'application/pdf'],
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },

  // إعدادات التقارير
  reports: {
    outputPath: process.env.REPORTS_PATH || './reports',
    backupPath: process.env.BACKUP_PATH || './backups',
    retentionDays: parseInt(process.env.REPORT_RETENTION_DAYS) || 30
  },

  // إعدادات NFC
  nfc: {
    deviceTimeout: parseInt(process.env.NFC_DEVICE_TIMEOUT) || 30000, // 30 seconds
    maxRetries: parseInt(process.env.NFC_MAX_RETRIES) || 3,
    pollingInterval: parseInt(process.env.NFC_POLLING_INTERVAL) || 1000 // 1 second
  },

  // إعدادات السجلات
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d'
  },

  // إعدادات Redis (اختياري)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0
  },

  // إعدادات خارجية
  external: {
    apiUrl: process.env.EXTERNAL_API_URL,
    apiKey: process.env.EXTERNAL_API_KEY
  }
};

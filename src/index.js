/**
 * نقطة الدخول الرئيسية للتطبيق
 * يمكن استخدام هذا الملف كبديل لـ server.js أو كواجهة برمجة للتطبيق
 */

import app from './app.js';
import config from '../config/config.js';
import { connectDB } from '../config/db.js';
import logger from './utils/logger.js';

/**
 * تشغيل التطبيق
 */
const startServer = async () => {
  try {
    // الاتصال بقاعدة البيانات
    await connectDB();

    // بدء الخادم
    const server = app.listen(config.port, config.host, () => {
      logger.info(`Server running on http://${config.host}:${config.port} in ${config.env} mode`);
    });

    // معالجة إغلاق الخادم بشكل آمن
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// تشغيل التطبيق إذا تم استدعاء هذا الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default startServer;

import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import config from './config.js';

/**
 * الاتصال بقاعدة البيانات MongoDB
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database.uri, {
      ...config.database.options
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // مراقبة اتصال قاعدة البيانات
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', err => {
      logger.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // إغلاق الاتصال عند إغلاق التطبيق
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

/**
 * إغلاق الاتصال بقاعدة البيانات
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
};

/**
 * التحقق من حالة الاتصال بقاعدة البيانات
 */
export const checkDBConnection = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * الحصول على معلومات الاتصال
 */
export const getDBInfo = () => {
  return {
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    readyState: mongoose.connection.readyState,
    models: Object.keys(mongoose.models)
  };
};

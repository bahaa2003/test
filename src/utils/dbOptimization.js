import mongoose from 'mongoose';
import logger from './logger.js';

/**
 * تحسين إعدادات قاعدة البيانات
 */
export const optimizeDatabaseSettings = () => {
  try {
    // تحسين إعدادات Mongoose
    mongoose.set('debug', process.env.NODE_ENV === 'development');

    // تحسين إعدادات الاتصال
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferMaxEntries', 0);

    // تحسين إعدادات الاستعلام
    mongoose.set('strictQuery', true);

    logger.info('تم تحسين إعدادات قاعدة البيانات');
  } catch (error) {
    logger.error('خطأ في تحسين إعدادات قاعدة البيانات:', error);
  }
};

/**
 * تنظيف البيانات القديمة
 */
export const cleanupOldData = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // حذف سجلات الحضور القديمة (أكثر من 30 يوم)
    const Attendance = mongoose.model('Attendance');
    const result = await Attendance.deleteMany({
      date: { $lt: thirtyDaysAgo }
    });

    logger.info(`تم حذف ${result.deletedCount} سجل حضور قديم`);
  } catch (error) {
    logger.error('خطأ في تنظيف البيانات القديمة:', error);
  }
};

/**
 * تحليل أداء قاعدة البيانات
 */
export const analyzeDatabasePerformance = async () => {
  try {
    const stats = await mongoose.connection.db.stats();

    logger.info('إحصائيات قاعدة البيانات:', {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize
    });

    return stats;
  } catch (error) {
    logger.error('خطأ في تحليل أداء قاعدة البيانات:', error);
    throw error;
  }
};

/**
 * مراقبة اتصال قاعدة البيانات
 */
export const monitorDatabaseConnection = () => {
  mongoose.connection.on('connected', () => {
    logger.info('تم الاتصال بقاعدة البيانات بنجاح');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('خطأ في الاتصال بقاعدة البيانات:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('انقطع الاتصال بقاعدة البيانات');
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('تم إغلاق الاتصال بقاعدة البيانات');
    process.exit(0);
  });
};

/**
 * تحسين الاستعلامات
 */
export const optimizeQueries = {
  /**
   * تحسين استعلام الحضور
   */
  attendance: {
    lean: true,
    select: 'studentId facultyId scheduleId date status notes',
    populate: {
      path: 'scheduleId',
      select: 'subjectId dayOfWeek startTime endTime',
      populate: {
        path: 'subjectId',
        select: 'name code'
      }
    }
  },

  /**
   * تحسين استعلام المستخدمين
   */
  users: {
    lean: true,
    select: 'name email role isActive createdAt',
    populate: {
      path: 'departmentId collegeId',
      select: 'name code'
    }
  },

  /**
   * تحسين استعلام المواد الدراسية
   */
  subjects: {
    lean: true,
    select: 'name code credits description isActive',
    populate: {
      path: 'departmentId',
      select: 'name code'
    }
  }
};

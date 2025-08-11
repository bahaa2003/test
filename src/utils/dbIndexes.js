import { College } from '../models/academic/College.js';
import { Department } from '../models/academic/Department.js';
import { Subject } from '../models/academic/Subject.js';
import { Schedule } from '../models/academic/Schedule.js';
import { Attendance } from '../models/operational/Attendance.js';
import { NfcDevice } from '../models/operational/NfcDevice.js';
import { Admin } from '../models/user/Admin.js';
import { Faculty } from '../models/user/Faculty.js';
import { Student } from '../models/user/Student.js';
import logger from './logger.js';

/**
 * إنشاء فهارس قاعدة البيانات لتحسين الأداء
 */
export const createDatabaseIndexes = async () => {
  try {
    logger.info('إنشاء فهارس قاعدة البيانات...');

    // فهارس الكليات
    await College.collection.createIndex({ code: 1 }, { unique: true });
    await College.collection.createIndex({ isActive: 1 });
    await College.collection.createIndex({ name: 'text' });

    // فهارس الأقسام
    await Department.collection.createIndex({ code: 1 }, { unique: true });
    await Department.collection.createIndex({ collegeId: 1 });
    await Department.collection.createIndex({ isActive: 1 });
    await Department.collection.createIndex({ name: 'text' });

    // فهارس المواد الدراسية
    await Subject.collection.createIndex({ code: 1 }, { unique: true });
    await Subject.collection.createIndex({ departmentId: 1 });
    await Subject.collection.createIndex({ isActive: 1 });
    await Subject.collection.createIndex({ name: 'text', code: 'text' });

    // فهارس الجداول الدراسية
    await Schedule.collection.createIndex({ subjectId: 1 });
    await Schedule.collection.createIndex({ facultyId: 1 });
    await Schedule.collection.createIndex({ isActive: 1 });
    await Schedule.collection.createIndex({ dayOfWeek: 1, startTime: 1 });
    await Schedule.collection.createIndex({ subjectId: 1, facultyId: 1 });

    // فهارس الحضور
    await Attendance.collection.createIndex({ studentId: 1, date: 1 });
    await Attendance.collection.createIndex({ facultyId: 1, date: 1 });
    await Attendance.collection.createIndex({ scheduleId: 1, date: 1 });
    await Attendance.collection.createIndex({ date: 1 });
    await Attendance.collection.createIndex({ status: 1 });
    await Attendance.collection.createIndex({ type: 1 });
    await Attendance.collection.createIndex({
      studentId: 1,
      scheduleId: 1,
      date: 1
    }, { unique: true });

    // فهارس أجهزة NFC
    await NfcDevice.collection.createIndex({ deviceId: 1 }, { unique: true });
    await NfcDevice.collection.createIndex({ isActive: 1 });
    await NfcDevice.collection.createIndex({ location: 1 });

    // فهارس المستخدمين
    await Admin.collection.createIndex({ email: 1 }, { unique: true });
    await Admin.collection.createIndex({ isActive: 1 });

    await Faculty.collection.createIndex({ email: 1 }, { unique: true });
    await Faculty.collection.createIndex({ employeeId: 1 }, { unique: true });
    await Faculty.collection.createIndex({ departmentId: 1 });
    await Faculty.collection.createIndex({ collegeId: 1 });
    await Faculty.collection.createIndex({ isActive: 1 });
    await Faculty.collection.createIndex({ name: 'text', email: 'text' });

    await Student.collection.createIndex({ email: 1 }, { unique: true });
    await Student.collection.createIndex({ studentId: 1 }, { unique: true });
    await Student.collection.createIndex({ cardId: 1 }, { unique: true });
    await Student.collection.createIndex({ departmentId: 1 });
    await Student.collection.createIndex({ collegeId: 1 });
    await Student.collection.createIndex({ isActive: 1 });
    await Student.collection.createIndex({ name: 'text', email: 'text', studentId: 'text' });

    logger.info('تم إنشاء فهارس قاعدة البيانات بنجاح');
  } catch (error) {
    logger.error('خطأ في إنشاء فهارس قاعدة البيانات:', error);
    throw error;
  }
};

/**
 * حذف فهارس قاعدة البيانات
 */
export const dropDatabaseIndexes = async () => {
  try {
    logger.info('حذف فهارس قاعدة البيانات...');

    await College.collection.dropIndexes();
    await Department.collection.dropIndexes();
    await Subject.collection.dropIndexes();
    await Schedule.collection.dropIndexes();
    await Attendance.collection.dropIndexes();
    await NfcDevice.collection.dropIndexes();
    await Admin.collection.dropIndexes();
    await Faculty.collection.dropIndexes();
    await Student.collection.dropIndexes();

    logger.info('تم حذف فهارس قاعدة البيانات بنجاح');
  } catch (error) {
    logger.error('خطأ في حذف فهارس قاعدة البيانات:', error);
    throw error;
  }
};

/**
 * إعادة إنشاء فهارس قاعدة البيانات
 */
export const recreateDatabaseIndexes = async () => {
  try {
    await dropDatabaseIndexes();
    await createDatabaseIndexes();
    logger.info('تم إعادة إنشاء فهارس قاعدة البيانات بنجاح');
  } catch (error) {
    logger.error('خطأ في إعادة إنشاء فهارس قاعدة البيانات:', error);
    throw error;
  }
};

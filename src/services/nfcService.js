import {NfcDevice} from '../models/operational/NfcDevice.js';
import {Attendance} from '../models/operational/Attendance.js';
import {Student} from '../models/user/Student.js';
import {AppError} from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * خدمة إدارة أجهزة NFC
 */
class NfcService {
  /**
   * تسجيل جهاز NFC جديد
   */
  async registerDevice (deviceData) {
    try {
      const device = await NfcDevice.create(deviceData);
      logger.info(`NFC device registered: ${device.deviceId}`);
      return device;
    } catch (error) {
      logger.error('Error registering NFC device:', error);
      throw new AppError('فشل في تسجيل جهاز NFC', 500);
    }
  }

  /**
   * التحقق من صحة جهاز NFC
   */
  async validateDevice (deviceId) {
    try {
      const device = await NfcDevice.findOne({
        deviceId,
        isActive: true
      });

      if (!device) {
        throw new AppError('جهاز NFC غير صالح أو غير نشط', 401);
      }

      return device;
    } catch (error) {
      logger.error('Error validating NFC device:', error);
      throw error;
    }
  }

  /**
   * تسجيل الحضور عبر NFC
   */
  async recordAttendance (attendanceData) {
    try {
      const {deviceId, userId, userType, scheduleId, timestamp} = attendanceData;

      // التحقق من صحة الجهاز
      const device = await this.validateDevice(deviceId);

      // التحقق من وجود المستخدم
      let user;
      if (userType === 'student') {
        user = await Student.findById(userId);
      } else {
        user = await Faculty.findById(userId);
      }

      if (!user) {
        throw new AppError('المستخدم غير موجود', 404);
      }

      // التحقق من عدم تسجيل الحضور مسبقاً
      const existingAttendance = await Attendance.findOne({
        student: userType === 'student' ? userId : undefined,
        faculty: userType === 'faculty' ? userId : undefined,
        schedule: scheduleId,
        date: {
          $gte: new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate()),
          $lt: new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate() + 1)
        }
      });

      if (existingAttendance) {
        throw new AppError('تم تسجيل الحضور مسبقاً', 409);
      }

      // تسجيل الحضور
      const attendanceDataToSave = {
        schedule: scheduleId,
        date: timestamp,
        status: 'present',
        recordedBy: 'nfc',
        device: device._id
      };

      if (userType === 'student') {
        attendanceDataToSave.student = userId;
      } else {
        attendanceDataToSave.faculty = userId;
      }

      const attendance = await Attendance.create(attendanceDataToSave);

      logger.info(`Attendance recorded via NFC: User ${userId}, Schedule ${scheduleId}`);
      return attendance;
    } catch (error) {
      logger.error('Error recording attendance via NFC:', error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات الجهاز
   */
  async getDeviceStats (deviceId, startDate, endDate) {
    try {
      const device = await this.validateDevice(deviceId);

      const stats = await Attendance.aggregate([
        {
          $match: {
            device: device._id,
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $group: {
            _id: '$status',
            count: {$sum: 1}
          }
        }
      ]);

      return {
        deviceId: device.deviceId,
        deviceName: device.name,
        period: {startDate, endDate},
        stats
      };
    } catch (error) {
      logger.error('Error getting device stats:', error);
      throw error;
    }
  }

  /**
   * تحديث حالة الجهاز
   */
  async updateDeviceStatus (deviceId, isActive) {
    try {
      const device = await NfcDevice.findOneAndUpdate({deviceId}, {isActive}, {new: true});

      if (!device) {
        throw new AppError('جهاز NFC غير موجود', 404);
      }

      logger.info(`NFC device status updated: ${deviceId} - ${isActive ? 'Active' : 'Inactive'}`);
      return device;
    } catch (error) {
      logger.error('Error updating device status:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الأجهزة النشطة
   */
  async getActiveDevices () {
    try {
      const devices = await NfcDevice.find({isActive: true});
      return devices;
    } catch (error) {
      logger.error('Error getting active devices:', error);
      throw new AppError('فشل في الحصول على الأجهزة النشطة', 500);
    }
  }

  /**
   * حذف جهاز NFC
   */
  async deleteDevice (deviceId) {
    try {
      const device = await NfcDevice.findOneAndDelete({deviceId});

      if (!device) {
        throw new AppError('جهاز NFC غير موجود', 404);
      }

      logger.info(`NFC device deleted: ${deviceId}`);
      return device;
    } catch (error) {
      logger.error('Error deleting device:', error);
      throw error;
    }
  }
}

export default new NfcService();

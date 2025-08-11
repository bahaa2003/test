import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';
import config from '../../config/config.js';

const execAsync = promisify(exec);

/**
 * خدمة النسخ الاحتياطي لقاعدة البيانات
 */
class BackupService {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDirectory();
  }

  /**
   * التأكد من وجود مجلد النسخ الاحتياطي
   */
  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch (error) {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info('Backup directory created');
    }
  }

  /**
   * إنشاء نسخة احتياطية من قاعدة البيانات
   */
  async createBackup(backupName = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = backupName || `backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, `${backupFileName}.gz`);

      // استخراج معلومات الاتصال من URI
      const dbUri = config.database.uri;
      const dbName = dbUri.split('/').pop().split('?')[0];

      // أمر النسخ الاحتياطي
      const backupCommand = `mongodump --uri="${dbUri}" --archive="${backupPath}" --gzip`;

      logger.info(`Starting database backup: ${backupFileName}`);

      const { stdout, stderr } = await execAsync(backupCommand);

      if (stderr) {
        logger.warn('Backup stderr:', stderr);
      }

      // التحقق من حجم الملف
      const stats = await fs.stat(backupPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      logger.info(`Backup completed successfully: ${backupFileName} (${fileSizeInMB} MB)`);

      return {
        fileName: backupFileName,
        filePath: backupPath,
        size: fileSizeInMB,
        timestamp: new Date(),
        status: 'success'
      };
    } catch (error) {
      logger.error('Backup failed:', error);
      throw new AppError('فشل في إنشاء النسخة الاحتياطية', 500);
    }
  }

  /**
   * استعادة قاعدة البيانات من نسخة احتياطية
   */
  async restoreBackup(backupFileName) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);

      // التحقق من وجود الملف
      await fs.access(backupPath);

      const dbUri = config.database.uri;

      logger.info(`Starting database restore from: ${backupFileName}`);

      // أمر الاستعادة
      const restoreCommand = `mongorestore --uri="${dbUri}" --archive="${backupPath}" --gzip --drop`;

      const { stdout, stderr } = await execAsync(restoreCommand);

      if (stderr) {
        logger.warn('Restore stderr:', stderr);
      }

      logger.info(`Database restore completed successfully from: ${backupFileName}`);

      return {
        fileName: backupFileName,
        timestamp: new Date(),
        status: 'success'
      };
    } catch (error) {
      logger.error('Restore failed:', error);
      throw new AppError('فشل في استعادة قاعدة البيانات', 500);
    }
  }

  /**
   * الحصول على قائمة النسخ الاحتياطية
   */
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.endsWith('.gz'));

      const backups = [];

      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);

        backups.push({
          fileName: file,
          filePath,
          size: (stats.size / (1024 * 1024)).toFixed(2),
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        });
      }

      // ترتيب حسب تاريخ الإنشاء (الأحدث أولاً)
      backups.sort((a, b) => b.createdAt - a.createdAt);

      return backups;
    } catch (error) {
      logger.error('Error listing backups:', error);
      throw new AppError('فشل في الحصول على قائمة النسخ الاحتياطية', 500);
    }
  }

  /**
   * حذف نسخة احتياطية
   */
  async deleteBackup(backupFileName) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);

      // التحقق من وجود الملف
      await fs.access(backupPath);

      await fs.unlink(backupPath);

      logger.info(`Backup deleted: ${backupFileName}`);

      return {
        fileName: backupFileName,
        timestamp: new Date(),
        status: 'deleted'
      };
    } catch (error) {
      logger.error('Error deleting backup:', error);
      throw new AppError('فشل في حذف النسخة الاحتياطية', 500);
    }
  }

  /**
   * تنظيف النسخ الاحتياطية القديمة
   */
  async cleanupOldBackups(retentionDays = 30) {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const oldBackups = backups.filter(backup =>
        backup.createdAt < cutoffDate
      );

      const deletedBackups = [];

      for (const backup of oldBackups) {
        try {
          await this.deleteBackup(backup.fileName);
          deletedBackups.push(backup.fileName);
        } catch (error) {
          logger.error(`Failed to delete backup ${backup.fileName}:`, error);
        }
      }

      logger.info(`Cleanup completed: ${deletedBackups.length} old backups deleted`);

      return {
        deletedCount: deletedBackups.length,
        deletedFiles: deletedBackups,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error during cleanup:', error);
      throw new AppError('فشل في تنظيف النسخ الاحتياطية القديمة', 500);
    }
  }

  /**
   * التحقق من صحة النسخة الاحتياطية
   */
  async validateBackup(backupFileName) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);

      // التحقق من وجود الملف
      await fs.access(backupPath);

      // التحقق من حجم الملف
      const stats = await fs.stat(backupPath);
      const fileSizeInMB = (stats.size / (1024 * 1024));

      if (fileSizeInMB < 0.1) { // أقل من 100KB
        throw new AppError('النسخة الاحتياطية صغيرة جداً وقد تكون تالفة', 400);
      }

      logger.info(`Backup validation passed: ${backupFileName}`);

      return {
        fileName: backupFileName,
        isValid: true,
        size: fileSizeInMB.toFixed(2),
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Backup validation failed:', error);
      throw error;
    }
  }
}

export default new BackupService();

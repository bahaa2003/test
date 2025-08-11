import cron from 'node-cron';
import backupService from '../services/backupService.js';
import logger from '../utils/logger.js';
import config from '../../config/config.js';

/**
 * وظيفة النسخ الاحتياطي التلقائي
 */
class BackupJob {
  constructor() {
    this.isRunning = false;
    this.lastBackup = null;
    this.backupSchedule = null;
  }

  /**
   * بدء وظيفة النسخ الاحتياطي التلقائي
   */
  start() {
    try {
      // جدولة النسخ الاحتياطي اليومي في الساعة 2 صباحاً
      this.backupSchedule = cron.schedule('0 2 * * *', async () => {
        await this.performDailyBackup();
      }, {
        scheduled: true,
        timezone: 'Asia/Riyadh' // توقيت السعودية
      });

      // جدولة تنظيف النسخ الاحتياطية القديمة كل أسبوع
      cron.schedule('0 3 * * 0', async () => {
        await this.performCleanup();
      }, {
        scheduled: true,
        timezone: 'Asia/Riyadh'
      });

      logger.info('Backup jobs started successfully');
    } catch (error) {
      logger.error('Failed to start backup jobs:', error);
    }
  }

  /**
   * إيقاف وظيفة النسخ الاحتياطي
   */
  stop() {
    if (this.backupSchedule) {
      this.backupSchedule.stop();
      logger.info('Backup jobs stopped');
    }
  }

  /**
   * تنفيذ النسخ الاحتياطي اليومي
   */
  async performDailyBackup() {
    if (this.isRunning) {
      logger.warn('Backup job is already running, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      logger.info('Starting daily backup job...');

      const timestamp = new Date().toISOString().split('T')[0];
      const backupName = `daily-backup-${timestamp}`;

      const result = await backupService.createBackup(backupName);

      this.lastBackup = {
        timestamp: result.timestamp,
        fileName: result.fileName,
        size: result.size
      };

      logger.info(`Daily backup completed: ${result.fileName} (${result.size} MB)`);

      // التحقق من صحة النسخة الاحتياطية
      await backupService.validateBackup(`${backupName}.gz`);

    } catch (error) {
      logger.error('Daily backup job failed:', error);

      // إرسال إشعار في حالة الفشل (يمكن إضافة خدمة إشعارات هنا)
      this.sendBackupFailureNotification(error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * تنفيذ تنظيف النسخ الاحتياطية القديمة
   */
  async performCleanup() {
    try {
      logger.info('Starting backup cleanup job...');

      const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
      const result = await backupService.cleanupOldBackups(retentionDays);

      logger.info(`Backup cleanup completed: ${result.deletedCount} files deleted`);

    } catch (error) {
      logger.error('Backup cleanup job failed:', error);
    }
  }

  /**
   * تنفيذ نسخة احتياطية فورية
   */
  async performImmediateBackup(backupName = null) {
    if (this.isRunning) {
      throw new Error('Backup job is already running');
    }

    this.isRunning = true;

    try {
      logger.info('Starting immediate backup...');

      const result = await backupService.createBackup(backupName);

      this.lastBackup = {
        timestamp: result.timestamp,
        fileName: result.fileName,
        size: result.size
      };

      logger.info(`Immediate backup completed: ${result.fileName} (${result.size} MB)`);

      return result;
    } catch (error) {
      logger.error('Immediate backup failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * الحصول على حالة الوظيفة
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastBackup: this.lastBackup,
      isScheduled: this.backupSchedule ? this.backupSchedule.running : false,
      nextBackup: this.getNextBackupTime()
    };
  }

  /**
   * الحصول على وقت النسخ الاحتياطي التالي
   */
  getNextBackupTime() {
    if (!this.backupSchedule) {
      return null;
    }

    // حساب الوقت التالي للنسخ الاحتياطي (2 صباحاً)
    const now = new Date();
    const nextBackup = new Date(now);
    nextBackup.setHours(2, 0, 0, 0);

    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }

    return nextBackup;
  }

  /**
   * إرسال إشعار فشل النسخ الاحتياطي
   */
  sendBackupFailureNotification(error) {
    // يمكن إضافة خدمة إشعارات هنا (بريد إلكتروني، Slack، إلخ)
    logger.error('Backup failure notification:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: config.env
    });
  }

  /**
   * التحقق من صحة النسخ الاحتياطية
   */
  async validateBackups() {
    try {
      logger.info('Starting backup validation...');

      const backups = await backupService.listBackups();
      const validationResults = [];

      for (const backup of backups.slice(0, 5)) { // التحقق من آخر 5 نسخ فقط
        try {
          const validation = await backupService.validateBackup(backup.fileName);
          validationResults.push({
            fileName: backup.fileName,
            isValid: validation.isValid,
            size: validation.size
          });
        } catch (error) {
          validationResults.push({
            fileName: backup.fileName,
            isValid: false,
            error: error.message
          });
        }
      }

      logger.info(`Backup validation completed: ${validationResults.length} backups checked`);
      return validationResults;
    } catch (error) {
      logger.error('Backup validation failed:', error);
      throw error;
    }
  }
}

// إنشاء مثيل واحد من الوظيفة
const backupJob = new BackupJob();

// بدء الوظيفة عند تحميل الملف
if (config.env === 'production') {
  backupJob.start();
}

export default backupJob;

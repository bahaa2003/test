// utils/backupService.js
import {exec} from 'child_process';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';
import cron from 'node-cron';
import {logError, logInfo} from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createBackup = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupPath = path.join(backupDir, `backup-${timestamp}.gz`);
  const command = `mongodump --uri="${process.env.MONGODB_URI}" --archive="${backupPath}" --gzip`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      logError('Backup service failed', { error: error.message, backupPath });
      return;
    }
    logInfo(`Backup created successfully: ${backupPath}`);
  });
};

// جدولة نسخ احتياطي يومي في 2 صباحًا
cron.schedule('0 2 * * *', createBackup);

export {createBackup};

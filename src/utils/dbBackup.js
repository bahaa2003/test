// utils/dbBackup.js
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { logError, logInfo } from './logger.js';

const backupDir = path.join(process.cwd(), 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `backup-${timestamp}.gz`);
const command = `mongodump --uri="${process.env.MONGODB_URI}" --archive="${backupPath}" --gzip`;

exec(command, (error) => {
  if (error) {
    logError('Database backup failed', { error: error.message, backupPath });
    process.exit(1);
  }
  logInfo(`Database backup created successfully at: ${backupPath}`);
});

// utils/backupService.js
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const backupDB = () => {
  const backupDir = path.join(__dirname, '../../backups');
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${dateStr}.gz`);

  const command = `mongodump --uri="${process.env.MONGODB_URI}" --archive=${backupPath} --gzip`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('فشل النسخ الاحتياطي:', error);
      return;
    }
    console.log(`تم إنشاء النسخ الاحتياطي: ${backupPath}`);
  });
};

// جدولة نسخ احتياطي يومي في 2 صباحًا
cron.schedule('0 2 * * *', backupDB);

export { backupDB };

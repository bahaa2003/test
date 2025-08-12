// utils/dbBackup.js
import {exec} from 'child_process';
import moment from 'moment';
import path from 'path';

const backupDir = path.resolve('./backups');
const dateStr = moment().format('YYYY-MM-DD_HH-mm');
const backupPath = path.join(backupDir, `backup-${dateStr}.gz`);

const command = `mongodump --uri="${process.env.MONGODB_URI}" --archive=${backupPath} --gzip`;

exec(command, (error) => {
  if (error) {
    console.error('فشل النسخ الاحتياطي:', error);
    process.exit(1);
  }
  console.log(`تم إنشاء النسخ الاحتياطي في: ${backupPath}`);
});

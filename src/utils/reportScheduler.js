import cron from 'node-cron';
import { DailyReport } from '../models/report/DailyReport.js';
import { SemesterReport } from '../models/report/SemesterReport.js';
import { generatePDF } from './reportGenerators/pdfGenerator.js';
import { sendEmailWithAttachment } from './emailService.js';
import moment from 'moment';

// جدولة التقرير اليومي الساعة 11 مساءً
cron.schedule('0 23 * * *', async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // تجنب أيام العطلة
    if (yesterday.getDay() === 5 || yesterday.getDay() === 6) {
      return; // الجمعة أو السبت
    }

    // إنشاء التقرير
    const report = await generateDailyReport(yesterday);

    // توليد PDF
    const pdfBuffer = await generatePDF({
      title: `تقرير الحضور اليومي - ${moment(yesterday).format('YYYY-MM-DD')}`,
      data: report,
      type: 'daily'
    });

    // إرسال بالبريد
    await sendEmailWithAttachment({
      to: 'reports@university.edu',
      subject: `تقرير الحضور ${moment(yesterday).format('YYYY-MM-DD')}`,
      text: 'مرفق تقرير الحضور اليومي',
      attachments: [{
        filename: `attendance-report-${moment(yesterday).format('YYYY-MM-DD')}.pdf`,
        content: pdfBuffer
      }]
    });

    console.log(`تم إرسال التقرير اليومي لـ ${moment(yesterday).format('YYYY-MM-DD')}`);
  } catch (err) {
    console.error('فشل في إنشاء التقرير اليومي:', err);
  }
});

// جدولة التقرير الفصلي في نهاية كل فصل
cron.schedule('0 0 1 1,5,9 *', async () => {
  try {
    const semesterMap = {
      1: 'fall',
      5: 'spring',
      9: 'summer'
    };
    const currentMonth = new Date().getMonth() + 1;
    const semester = semesterMap[currentMonth];

    const report = await generateSemesterReport(semester);

    // تخزين التقرير في قاعدة البيانات
    await SemesterReport.create(report);

    console.log(`تم إنشاء التقرير الفصلي للفصل ${semester}`);
  } catch (err) {
    console.error('فشل في إنشاء التقرير الفصلي:', err);
  }
});

// وظيفة مساعدة لإنشاء التقرير اليومي
async function generateDailyReport(date) {
  // ... (تنفيذ جمع البيانات من قاعدة البيانات)
  return processedData;
}

// وظيفة مساعدة لإنشاء التقرير الفصلي
async function generateSemesterReport(semester) {
  // ... (تنفيذ جمع البيانات من قاعدة البيانات)
  return processedData;
}

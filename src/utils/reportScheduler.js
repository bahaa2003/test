import cron from 'node-cron';
// import {DailyReport} from '../models/report/DailyReport.js'; // TODO: Implement when needed
import {SemesterReport} from '../models/report/SemesterReport.js';
import {generatePDF} from './reportGenerators/pdfGenerator.js';
import {sendEmailWithAttachment} from './emailService.js';
import moment from 'moment';
import logger from './logger.js';

// جدولة التقرير اليومي الساعة 11 مساءً
cron.schedule('0 23 * * *', async () => {
  try {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const DAILY_REPORT_HOUR = 5;
    const DAILY_REPORT_MINUTE = 6;

    // تشغيل التقرير اليومي في الساعة 5:30 صباحاً
    if (hour !== DAILY_REPORT_HOUR || minute !== DAILY_REPORT_MINUTE) {
      return;
    }

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
      html: '<p>مرفق تقرير الحضور اليومي</p>',
      attachments: [{
        filename: `attendance-report-${moment(yesterday).format('YYYY-MM-DD')}.pdf`,
        content: pdfBuffer
      }]
    });

    logger.info(`تشغيل مولد التقارير اليومية... لـ ${moment(yesterday).format('YYYY-MM-DD')}`);
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

    logger.info(`تشغيل مولد التقارير الفصلية... للفصل ${semester}`);
  } catch (err) {
    console.error('فشل في إنشاء التقرير الفصلي:', err);
  }
});

// وظيفة مساعدة لإنشاء التقرير اليومي
const generateDailyReport = async (_date) => {
  // TODO: تنفيذ جمع البيانات من قاعدة البيانات
  const processedData = {
    date: _date,
    status: 'generated',
    message: 'تم إنشاء التقرير اليومي'
  };
  return processedData;
};

// وظيفة مساعدة لإنشاء التقرير الفصلي
const generateSemesterReport = async (_semester) => {
  // TODO: تنفيذ جمع البيانات من قاعدة البيانات
  const processedData = {
    semester: _semester,
    status: 'generated',
    message: 'تم إنشاء التقرير الفصلي'
  };
  return processedData;
};

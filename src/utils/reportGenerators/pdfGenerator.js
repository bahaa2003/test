// import {createWriteStream} from 'fs'; // Unused import
import PDFDocument from 'pdfkit';
import moment from 'moment-hijri';
// import arabic from 'pdfkit-arabic'; // TODO: Reinstall when dependency is available

export const generatePDF = (options) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    layout: 'portrait',
    lang: 'ar'
  });

  // دعم النصوص العربية
  // doc.use(arabic); // TODO: Enable when pdfkit-arabic is available

  // إنشاء buffer للPDF
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  // الهيدر
  doc.image('assets/university-logo.png', 50, 45, {width: 50})
    .fillColor('#333333')
    .font('fonts/arabic.ttf')
    .fontSize(20)
    .text('نظام الحضور الجامعي', {align: 'right'})
    .fontSize(10)
    .text(`تاريخ التقرير: ${moment().format('iD / iMMMM / iYYYY')}`, {align: 'right'});

  // إضافة محتوى التقرير حسب النوع
  switch (options.type) {
    case 'daily':
      generateDailyPDF(doc, options.data);
      break;
    case 'student':
      generateStudentPDF(doc, options.data);
      break;
    default:
      generateDefaultPDF(doc, options.data);
      break;
  }

  // التذييل
  const FOOTER_Y = 780;
  const FOOTER_WIDTH = 500;
  const FOOTER_FONT_SIZE = 8;
  
  doc.fontSize(FOOTER_FONT_SIZE)
    .text('تم إنشاء هذا التقرير تلقائياً عبر نظام الحضور الجامعي', 50, FOOTER_Y, {
      align: 'center',
      width: FOOTER_WIDTH
    });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
  });
};

// توليد تقرير يومي
const generateDailyPDF = (doc, data) => {
  doc.moveDown()
    .fontSize(16)
    .text('التقرير اليومي للحضور', {align: 'center'})
    .moveDown();

  // جدول الإحصائيات
  const table = {
    headers: ['النسبة', 'الحاضرون', 'الغائبون', 'المتأخرون'],
    rows: [
      [
        `${data.overallStats.attendanceRate}%`,
        data.overallStats.present,
        data.overallStats.absent,
        data.overallStats.late
      ]
    ]
  };

  drawTable(doc, table);

  // إحصائيات الكليات
  doc.moveDown().text('إحصائيات الكليات:', {align: 'right'});
  data.collegeStats.forEach(college => {
    doc.fontSize(10)
      .text(`${college.college.name}: ${college.attendanceRate}%`, {align: 'right'});
  });
};

// توليد تقرير الطالب
const generateStudentPDF = (doc, data) => {
  doc.moveDown()
    .fontSize(16)
    .text(`تقرير الحضور للطالب: ${data.student.name}`, {align: 'center'})
    .moveDown();

  // جدول المواد
  const table = {
    headers: ['المادة', 'المحاضر', 'النسبة', 'الحضور', 'الغياب'],
    rows: data.attendanceDetails.map(item => [
      item.subject.name,
      item.faculty.name,
      `${item.attendanceRate}%`,
      item.attended,
      item.absent
    ])
  };

  drawTable(doc, table);

  // الملخص العام
  doc.moveDown()
    .text(`النسبة العامة للحضور: ${data.overallStats.attendanceRate}%`, {align: 'right'});
};

// توليد تقرير افتراضي
const generateDefaultPDF = (doc, data) => {
  doc.moveDown()
    .fontSize(16)
    .text('تقرير عام', {align: 'center'})
    .moveDown();

  if (data && typeof data === 'object') {
    doc.fontSize(12)
      .text(JSON.stringify(data, null, 2), {align: 'right'});
  } else {
    doc.fontSize(12)
      .text('لا توجد بيانات متاحة', {align: 'center'});
  }
};

// دالة مساعدة لرسم الجداول
const drawTable = (doc, table) => {
  const startX = 50;
  const startY = doc.y;
  const CELL_PADDING = 10;
  const COL_WIDTH_1 = 100;
  const COL_WIDTH_2 = 100;
  const COL_WIDTH_3 = 80;
  const COL_WIDTH_4 = 80;
  const COL_WIDTH_5 = 80;
  const colWidths = [COL_WIDTH_1, COL_WIDTH_2, COL_WIDTH_3, COL_WIDTH_4, COL_WIDTH_5];

  // رسم الهيدر
  doc.font('fonts/arabic-bold.ttf');
  table.headers.forEach((header, i) => {
    doc.text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, {
      width: colWidths[i],
      align: 'center'
    });
  });

  // رسم الصفوف
  doc.font('fonts/arabic.ttf');
  table.rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const ROW_HEIGHT = 25;
      doc.text(cell, startX + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
        startY + (rowIndex + 1) * ROW_HEIGHT, {
          width: colWidths[colIndex],
          align: 'center'
        });
    });
  });

  // رسم الحدود
  const ROW_HEIGHT = 25;
  doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), (table.rows.length + 1) * ROW_HEIGHT)
    .stroke();
};

import ExcelJS from 'exceljs';
import moment from 'moment-hijri';

export const generateExcel = async (data, type = 'daily') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('تقرير الحضور');

  // إعداد الخط العربي
  workbook.creator = 'النظام الجامعي';
  workbook.lastModifiedBy = 'النظام الجامعي';
  workbook.created = new Date();

  // أنماط الخلايا
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFF' }, name: 'Arial', size: 12 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5496' } },
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: { top: { style: 'thin' }, bottom: { style: 'thin' } }
  };

  // توليد المحتوى حسب النوع
  switch(type) {
    case 'daily':
      generateDailyExcel(worksheet, data, headerStyle);
      break;
    case 'student':
      generateStudentExcel(worksheet, data, headerStyle);
      break;
  }

  // توليد الملف
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

// تقرير يومي
const generateDailyExcel = (worksheet, data, headerStyle) => {
  // العنوان الرئيسي
  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = 'التقرير اليومي للحضور';
  worksheet.getCell('A1').style = {
    font: { bold: true, size: 16, name: 'Arial' },
    alignment: { horizontal: 'center' }
  };

  // بيانات التقرير
  worksheet.addRow(['تاريخ التقرير', moment(data.date).format('iD / iMMMM / iYYYY')]);

  // جدول الإحصائيات
  worksheet.addRow(['النسبة', 'الحاضرون', 'الغائبون', 'المتأخرون']);
  const headerRow = worksheet.lastRow;
  headerRow.eachCell(cell => { cell.style = headerStyle; });

  worksheet.addRow([
    `${data.overallStats.attendanceRate}%`,
    data.overallStats.present,
    data.overallStats.absent,
    data.overallStats.late
  ]);

  // إحصائيات الكليات
  worksheet.addRow([]);
  worksheet.addRow(['الكليات', 'النسبة', 'الحاضرون', 'الغائبون']).eachCell(cell => {
    cell.style = headerStyle;
  });

  data.collegeStats.forEach(college => {
    worksheet.addRow([
      college.college.name,
      `${college.attendanceRate}%`,
      college.present,
      college.absent
    ]);
  });

  // ضبط عرض الأعمدة
  worksheet.columns = [
    { width: 30 }, { width: 15 }, { width: 15 }, { width: 15 }
  ];
};

// تقرير الطالب
const generateStudentExcel = (worksheet, data, headerStyle) => {
  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = `تقرير الحضور للطالب: ${data.student.name}`;
  worksheet.getCell('A1').style = {
    font: { bold: true, size: 16 },
    alignment: { horizontal: 'center' }
  };

  // جدول المواد
  worksheet.addRow(['المادة', 'المحاضر', 'النسبة', 'الحضور', 'الغياب']);
  worksheet.lastRow.eachCell(cell => { cell.style = headerStyle; });

  data.attendanceDetails.forEach(item => {
    worksheet.addRow([
      item.subject.name,
      item.faculty.name,
      `${item.attendanceRate}%`,
      item.attended,
      item.absent
    ]);
  });

  // الملخص
  worksheet.addRow([]);
  worksheet.addRow(['النسبة العامة', `${data.overallStats.attendanceRate}%`]);
};

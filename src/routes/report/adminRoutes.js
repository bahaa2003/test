import express from 'express';
import {
  getSystemOverview,
  getAttendanceReport,
  getCollegesReport,
  getDepartmentsReport,
  getSubjectsReport,
  exportReportToPdf
} from '../../controllers/report/adminReportController.js';
import {
  getStudentAttendancePercentageReport,
  getHighestAbsenceSubjectsReport,
  getFacultyAttendanceBySectionReport,
  getDepartmentAttendanceComparisonReport
} from '../../controllers/report/advancedReportController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة والتفويض على جميع المسارات
router.use(authenticate);
router.use(authorize(['system_admin', 'admin']));

// مسارات تقارير الإدارة
router.get('/overview', getSystemOverview);
router.get('/attendance', getAttendanceReport);
router.get('/colleges', getCollegesReport);
router.get('/departments', getDepartmentsReport);
router.get('/subjects', getSubjectsReport);

// مسارات التقارير المتقدمة
router.get('/advanced/student-attendance-percentage', getStudentAttendancePercentageReport);
router.get('/advanced/highest-absence-subjects', getHighestAbsenceSubjectsReport);
router.get('/advanced/faculty-attendance-by-section', getFacultyAttendanceBySectionReport);
router.get('/advanced/department-attendance-comparison', getDepartmentAttendanceComparisonReport);

// مسار تصدير التقارير
router.get('/export/pdf', exportReportToPdf);

export default router;

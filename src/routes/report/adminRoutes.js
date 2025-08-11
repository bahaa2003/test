import express from 'express';
import {
  getSystemOverview,
  getAttendanceReport,
  getCollegesReport,
  getDepartmentsReport,
  getSubjectsReport,
  exportReportToPdf
} from '../../controllers/report/adminReportController.js';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة والتفويض على جميع المسارات
router.use(authenticate);
router.use(authorize(['admin']));

// مسارات تقارير الإدارة
router.get('/overview', getSystemOverview);
router.get('/attendance', getAttendanceReport);
router.get('/colleges', getCollegesReport);
router.get('/departments', getDepartmentsReport);
router.get('/subjects', getSubjectsReport);

// مسار تصدير التقارير
router.get('/export/pdf', exportReportToPdf);

export default router;

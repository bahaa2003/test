import express from 'express';
import {
  getStudentAttendanceReport,
  getStudentSubjectsReport,
  getStudentSubjectReport,
  getStudentDailyReport,
  getStudentMonthlyReport,
  getStudentOverview
} from '../../controllers/report/studentReportController.js';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة والتفويض على جميع المسارات
router.use(authenticate);
router.use(authorize(['student', 'faculty', 'admin']));

// مسارات تقارير الطلاب
router.get('/attendance', getStudentAttendanceReport);
router.get('/subjects', getStudentSubjectsReport);
router.get('/subject/:subjectId', getStudentSubjectReport);
router.get('/daily', getStudentDailyReport);
router.get('/monthly', getStudentMonthlyReport);
router.get('/overview', getStudentOverview);

export default router;

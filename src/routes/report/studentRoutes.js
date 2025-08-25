import express from 'express';
import {
  getStudentAttendanceReport,
  getStudentSubjectsReport,
  getStudentSubjectReport,
  getStudentDailyReport,
  getStudentMonthlyReport,
  getStudentOverview
} from '../../controllers/report/studentReportController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة على جميع المسارات
router.use(authenticate);

// مسارات تقارير الطلاب
router.get('/attendance', authorize(['student', 'faculty', 'admin']), getStudentAttendanceReport);
router.get('/subjects', authorize(['student', 'faculty', 'admin']), getStudentSubjectsReport);
router.get('/subject/:subjectId', authorize(['student', 'faculty', 'admin']), getStudentSubjectReport);
router.get('/daily', authorize(['student', 'faculty', 'admin']), getStudentDailyReport);
router.get('/monthly', authorize(['student', 'faculty', 'admin']), getStudentMonthlyReport);
router.get('/overview', authorize(['student', 'faculty', 'admin']), getStudentOverview);

export default router;

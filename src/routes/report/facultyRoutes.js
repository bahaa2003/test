import express from 'express';
import {
  getFacultyAttendanceReport,
  getFacultySubjectsReport,
  getSubjectStudentsReport,
  getFacultyDailyReport,
  getFacultyMonthlyReport
} from '../../controllers/report/facultyReportController.js';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة والتفويض على جميع المسارات
router.use(authenticate);
router.use(authorize(['faculty', 'admin']));

// مسارات تقارير أعضاء هيئة التدريس
router.get('/attendance', getFacultyAttendanceReport);
router.get('/subjects', getFacultySubjectsReport);
router.get('/subject/:subjectId/students', getSubjectStudentsReport);
router.get('/daily', getFacultyDailyReport);
router.get('/monthly', getFacultyMonthlyReport);

export default router;

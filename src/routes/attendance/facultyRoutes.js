import express from 'express';
import {
  recordFacultyAttendance,
  getFacultyAttendance,
  updateFacultyAttendance,
  getFacultyAttendanceStats,
  getFacultySchedules
} from '../../controllers/attendance/facultyController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة على جميع المسارات
router.use(authenticate);

// مسارات حضور أعضاء هيئة التدريس
router
  .route('/')
  .get(authorize(['faculty', 'admin']), getFacultyAttendance)
  .post(authorize(['faculty']), recordFacultyAttendance);

router.get('/stats', authorize(['faculty', 'admin']), getFacultyAttendanceStats);
router.get('/schedules', authorize(['faculty', 'admin']), getFacultySchedules);

router
  .route('/:id')
  .patch(authorize(['faculty', 'admin']), updateFacultyAttendance);

export default router;

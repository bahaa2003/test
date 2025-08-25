import express from 'express';
import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getSchedulesBySubject,
  getSchedulesByFaculty,
  getActiveSchedules,
  getSchedulesByDay
} from '../../controllers/academic/scheduleController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';
import {validateSchedule} from '../../middlewares/validations/academicValidation.js';

const router = express.Router();

// تطبيق middleware للمصادقة على جميع المسارات
router.use(authenticate);

// مسارات الجداول الدراسية
router
  .route('/')
  .get(getAllSchedules)
  .post(authorize(['system_admin', 'admin', 'faculty']), validateSchedule, createSchedule);

router.get('/active', getActiveSchedules);
router.get('/subject/:subjectId', getSchedulesBySubject);
router.get('/faculty/:facultyId', getSchedulesByFaculty);
router.get('/day/:dayOfWeek', getSchedulesByDay);

router
  .route('/:id')
  .get(getScheduleById)
  .patch(authorize(['system_admin', 'admin', 'faculty']), validateSchedule, updateSchedule)
  .delete(authorize(['system_admin', 'admin']), deleteSchedule);

export default router;

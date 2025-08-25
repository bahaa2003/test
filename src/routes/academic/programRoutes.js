import express from 'express';
import {
  createProgram,
  getAllPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
  getProgramsByDepartment
} from '../../controllers/academic/programController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';
import {validateProgram} from '../../middlewares/validations/academicValidation.js';

const router = express.Router();

// تطبيق middleware للمصادقة على جميع المسارات
router.use(authenticate);

// مسارات البرامج الأكاديمية
router
  .route('/')
  .get(getAllPrograms)
  .post(authorize(['system_admin', 'admin']), validateProgram, createProgram);

router
  .route('/:id')
  .get(getProgramById)
  .patch(authorize(['system_admin', 'admin']), validateProgram, updateProgram)
  .delete(authorize(['system_admin', 'admin']), deleteProgram);

// مسار للحصول على برامج قسم معين
router.get('/department/:departmentId', getProgramsByDepartment);

export default router;

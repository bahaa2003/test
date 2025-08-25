import express from 'express';
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByCollege,
  getActiveDepartments,
  getDepartmentStats
} from '../../controllers/academic/departmentController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة على جميع المسارات
router.use(authenticate);

// مسارات الأقسام
router
  .route('/')
  .get(getAllDepartments)
  .post(authorize(['system_admin', 'admin']), createDepartment);

router.get('/stats', getDepartmentStats);
router.get('/active', getActiveDepartments);
router.get('/college/:collegeId', getDepartmentsByCollege);

router
  .route('/:id')
  .get(getDepartmentById)
  .patch(authorize(['system_admin', 'admin']), updateDepartment)
  .delete(authorize(['system_admin', 'admin']), deleteDepartment);

export default router;

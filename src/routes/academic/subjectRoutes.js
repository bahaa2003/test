import express from 'express';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getSubjectsByDepartment,
  getActiveSubjects,
  searchSubjects
} from '../../controllers/academic/subjectController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';
import {validateSubject} from '../../middlewares/validations/academicValidation.js';

const router = express.Router();

// تطبيق middleware للمصادقة على جميع المسارات
router.use(authenticate);

// مسارات المواد الدراسية
router
  .route('/')
  .get(getAllSubjects)
  .post(authorize(['system_admin', 'admin']), validateSubject, createSubject);

router.get('/active', getActiveSubjects);
router.get('/search', searchSubjects);
router.get('/department/:departmentId', getSubjectsByDepartment);

router
  .route('/:id')
  .get(getSubjectById)
  .patch(authorize(['system_admin', 'admin']), validateSubject, updateSubject)
  .delete(authorize(['system_admin', 'admin']), deleteSubject);

export default router;

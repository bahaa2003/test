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

const router = express.Router();

// تطبيق middleware للمصادقة على جميع المسارات
router.use(authenticate);

// مسارات المواد الدراسية
router
  .route('/')
  .get(getAllSubjects)
  .post(authorize(['admin', 'faculty']), createSubject);

router.get('/active', getActiveSubjects);
router.get('/search', searchSubjects);
router.get('/department/:departmentId', getSubjectsByDepartment);

router
  .route('/:id')
  .get(getSubjectById)
  .patch(authorize(['admin', 'faculty']), updateSubject)
  .delete(authorize(['admin']), deleteSubject);

export default router;

import express from 'express';
import {
  createUniversity,
  getAllUniversities,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
  getActiveUniversities,
  toggleUniversityStatus,
  getUniversitiesByCountry
} from '../../controllers/academic/universityController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة على جميع المسارات
router.use(authenticate);

// مسارات الجامعات
router
  .route('/')
  .get(getAllUniversities)
  .post(authorize(['system_admin', 'admin']), createUniversity);

router.get('/active', getActiveUniversities);

router.get('/country/:country', getUniversitiesByCountry);

router
  .route('/:id')
  .get(getUniversityById)
  .patch(authorize(['system_admin', 'admin']), updateUniversity)
  .delete(authorize(['system_admin', 'admin']), deleteUniversity);

router.patch('/:id/toggle', authorize(['system_admin', 'admin']), toggleUniversityStatus);

export default router;

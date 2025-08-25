import express from 'express';
import {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
  getActiveColleges,
  getCollegeStats
} from '../../controllers/academic/collegeController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة على جميع المسارات
router.use(authenticate);

// مسارات الكليات
router
  .route('/')
  .get(getAllColleges)
  .post(authorize(['system_admin', 'admin']), createCollege);

router.get('/active', getActiveColleges);
router.get('/stats', getCollegeStats);

router
  .route('/:id')
  .get(getCollegeById)
  .patch(authorize(['system_admin', 'admin']), updateCollege)
  .delete(authorize(['system_admin', 'admin']), deleteCollege);

export default router;

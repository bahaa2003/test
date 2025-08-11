import express from 'express';
import {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
  getActiveColleges
} from '../../controllers/academic/collegeController.js';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة على جميع المسارات
router.use(authenticate);

// مسارات الكليات
router
  .route('/')
  .get(getAllColleges)
  .post(authorize(['admin']), createCollege);

router.get('/active', getActiveColleges);

router
  .route('/:id')
  .get(getCollegeById)
  .patch(authorize(['admin']), updateCollege)
  .delete(authorize(['admin']), deleteCollege);

export default router;

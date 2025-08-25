import express from 'express';
import {
  createSection,
  getAllSections,
  getSectionById,
  updateSection,
  deleteSection,
  getActiveSections,
  toggleSectionStatus,
  getSectionsByFaculty,
  getSectionsByCourse,
  addStudentToSection,
  removeStudentFromSection
} from '../../controllers/academic/sectionController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة على جميع المسارات
router.use(authenticate);

// مسارات الشعب
router
  .route('/')
  .get(getAllSections)
  .post(authorize(['admin', 'faculty']), createSection);

router.get('/active', getActiveSections);

router.get('/faculty/:facultyId', getSectionsByFaculty);

router.get('/course/:courseId', getSectionsByCourse);

router
  .route('/:id')
  .get(getSectionById)
  .patch(authorize(['admin', 'faculty']), updateSection)
  .post(authorize(['system_admin', 'admin']), createSection)
  .delete(authorize(['admin']), deleteSection);

router.patch('/:id/toggle', authorize(['admin', 'faculty']), toggleSectionStatus);

// Student management in sections
router.post('/:id/students', authorize(['admin']), addStudentToSection);

router.delete('/:id/students/:studentId', authorize(['admin']), removeStudentFromSection);

export default router;

import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  getUserStats
} from '../../controllers/admin/userManagementController.js';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';

const router = express.Router();

// تطبيق middleware للمصادقة والتفويض على جميع المسارات
router.use(authenticate);
router.use(authorize(['admin']));

// مسارات إدارة المستخدمين
router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router.get('/stats', getUserStats);

router
  .route('/:role/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUser);

router.patch('/:role/:id/toggle-status', toggleUserStatus);
router.post('/:role/:id/reset-password', resetUserPassword);

export default router;

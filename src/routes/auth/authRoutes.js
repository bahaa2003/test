import express from 'express';
import {
  login,
  logout,
  updatePassword,
  refreshToken,
  getMe
} from '../../controllers/auth/authController.js';
import {
  getProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
  getProfileStats
} from '../../controllers/auth/userController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {validateLogin, validateUpdatePassword} from '../../middlewares/validations/authValidation.js';

const router = express.Router();

// مسارات المصادقة (عامة)
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);

// مسارات تتطلب مصادقة
router.use(authenticate);

router.post('/logout', logout);
router.patch('/update-password', validateUpdatePassword, updatePassword);
router.get('/me', getMe);

// مسارات الملف الشخصي
router
  .route('/profile')
  .get(getProfile)
  .patch(updateProfile)
  .delete(deleteProfile);

router.get('/profile/stats', getProfileStats);
router.post('/profile/avatar', uploadAvatar);

export default router;

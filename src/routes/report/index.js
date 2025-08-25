import express from 'express';
import adminRoutes from './adminRoutes.js';
import facultyRoutes from './facultyRoutes.js';
import studentRoutes from './studentRoutes.js';
import { getSystemOverview } from '../../controllers/report/adminReportController.js';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';

const router = express.Router();

// مسار إحصائيات لوحة التحكم للمديرين العامين
router.get('/dashboard-stats', authenticate, authorize(['system_admin', 'admin']), getSystemOverview);

// استخدام مسارات التقارير
router.use('/admin', adminRoutes);
router.use('/faculty', facultyRoutes);
router.use('/student', studentRoutes);

export default router;

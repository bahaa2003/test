import express from 'express';
import collegeRoutes from './collegeRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import programRoutes from './programRoutes.js';
import subjectRoutes from './subjectRoutes.js';
import scheduleRoutes from './scheduleRoutes.js';

const router = express.Router();

// استخدام المسارات الأكاديمية
router.use('/colleges', collegeRoutes);
router.use('/departments', departmentRoutes);
router.use('/programs', programRoutes);
router.use('/subjects', subjectRoutes);
router.use('/schedules', scheduleRoutes);

export default router;

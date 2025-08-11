import express from 'express';
import adminRoutes from './adminRoutes.js';
import facultyRoutes from './facultyRoutes.js';
import studentRoutes from './studentRoutes.js';

const router = express.Router();

// استخدام مسارات التقارير
router.use('/admin', adminRoutes);
router.use('/faculty', facultyRoutes);
router.use('/student', studentRoutes);

export default router;

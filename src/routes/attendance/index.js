import express from 'express';
import facultyRoutes from './facultyRoutes.js';
import nfcRoutes from './nfcRoutes.js';
import timeslotRoutes from './timeslotRoutes.js';

const router = express.Router();

// استخدام مسارات الحضور
router.use('/faculty', facultyRoutes);
router.use('/nfc', nfcRoutes);
router.use('/timeslots', timeslotRoutes);

export default router;

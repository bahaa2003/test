import express from 'express';
import {
  registerNfcDevice,
  getAllNfcDevices,
  getNfcDeviceById,
  updateNfcDevice,
  deleteNfcDevice,
  recordNfcAttendance,
  getNfcDeviceStats,
  updateNfcDeviceStatus,
  getNfcAttendanceRecords
} from '../../controllers/attendance/nfcController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';

const router = express.Router();

// مسارات أجهزة NFC
router
  .route('/devices')
  .get(authenticate, authorize(['admin']), getAllNfcDevices)
  .post(authenticate, authorize(['admin']), registerNfcDevice);

router
  .route('/devices/:id')
  .get(authenticate, authorize(['admin']), getNfcDeviceById)
  .patch(authenticate, authorize(['admin']), updateNfcDevice)
  .delete(authenticate, authorize(['admin']), deleteNfcDevice);

router.patch('/devices/:id/status', authenticate, authorize(['admin']), updateNfcDeviceStatus);
router.get('/devices/:id/stats', authenticate, authorize(['admin']), getNfcDeviceStats);

// مسار تسجيل الحضور عبر NFC (للأجهزة)
router.post('/record', recordNfcAttendance);

// مسار سجلات الحضور عبر NFC
router.get('/records', authenticate, authorize(['admin', 'faculty']), getNfcAttendanceRecords);

export default router;

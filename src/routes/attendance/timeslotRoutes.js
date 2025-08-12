import express from 'express';
import {
  createTimeSlot,
  getAllTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot,
  getActiveTimeSlots,
  toggleTimeSlotStatus
} from '../../controllers/attendance/timeslotController.js';
import {authenticate} from '../../middlewares/auth/authenticate.js';
import {authorize} from '../../middlewares/auth/authorize.js';

const router = express.Router();

// مسارات الفترات الزمنية
router
  .route('/')
  .get(getAllTimeSlots)
  .post(authenticate, authorize(['admin', 'faculty']), createTimeSlot);

router.get('/active', getActiveTimeSlots);

router
  .route('/:id')
  .get(getTimeSlotById)
  .patch(authenticate, authorize(['admin', 'faculty']), updateTimeSlot)
  .delete(authenticate, authorize(['admin']), deleteTimeSlot);

router.patch('/:id/toggle', authenticate, authorize(['admin']), toggleTimeSlotStatus);

export default router;

import {TimeSlot} from '../../models/operational/TimeSlot.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import {ApiFeatures} from '../../utils/ApiFeatures.js';

/**
 * @desc    إنشاء فترة زمنية جديدة
 * @route   POST /api/v1/timeslots
 * @access  private (admin, faculty)
 */
export const createTimeSlot = catchAsync(async (req, res, next) => {
  const timeSlot = await TimeSlot.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      timeSlot
    }
  });
});

/**
 * @desc    الحصول على جميع الفترات الزمنية
 * @route   GET /api/v1/timeslots
 * @access  public
 */
export const getAllTimeSlots = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(TimeSlot.find(), req.query)
    .filter()
    .search(['name', 'description'])
    .sort()
    .limitFields()
    .paginate();

  const timeSlots = await features.mongooseQuery;
  const stats = await features.getPaginationStats();

  res.status(200).json({
    status: 'success',
    results: timeSlots.length,
    pagination: stats,
    data: {
      timeSlots
    }
  });
});

/**
 * @desc    الحصول على فترة زمنية محددة
 * @route   GET /api/v1/timeslots/:id
 * @access  public
 */
export const getTimeSlotById = catchAsync(async (req, res, next) => {
  const timeSlot = await TimeSlot.findById(req.params.id);

  if (!timeSlot) {
    return next(AppError.notFound('الفترة الزمنية غير موجودة'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      timeSlot
    }
  });
});

/**
 * @desc    تحديث فترة زمنية
 * @route   PATCH /api/v1/timeslots/:id
 * @access  private (admin, faculty)
 */
export const updateTimeSlot = catchAsync(async (req, res, next) => {
  const timeSlot = await TimeSlot.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!timeSlot) {
    return next(AppError.notFound('الفترة الزمنية غير موجودة'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      timeSlot
    }
  });
});

/**
 * @desc    حذف فترة زمنية
 * @route   DELETE /api/v1/timeslots/:id
 * @access  private (admin)
 */
export const deleteTimeSlot = catchAsync(async (req, res, next) => {
  const timeSlot = await TimeSlot.findByIdAndDelete(req.params.id);

  if (!timeSlot) {
    return next(AppError.notFound('الفترة الزمنية غير موجودة'));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * @desc    الحصول على الفترات الزمنية النشطة
 * @route   GET /api/v1/timeslots/active
 * @access  public
 */
export const getActiveTimeSlots = catchAsync(async (req, res, next) => {
  const timeSlots = await TimeSlot.find({isActive: true}).sort('startTime');

  res.status(200).json({
    status: 'success',
    results: timeSlots.length,
    data: {
      timeSlots
    }
  });
});

/**
 * @desc    تفعيل/إلغاء تفعيل فترة زمنية
 * @route   PATCH /api/v1/timeslots/:id/toggle
 * @access  private (admin)
 */
export const toggleTimeSlotStatus = catchAsync(async (req, res, next) => {
  const timeSlot = await TimeSlot.findById(req.params.id);

  if (!timeSlot) {
    return next(AppError.notFound('الفترة الزمنية غير موجودة'));
  }

  timeSlot.isActive = !timeSlot.isActive;
  await timeSlot.save();

  res.status(200).json({
    status: 'success',
    data: {
      timeSlot
    }
  });
});

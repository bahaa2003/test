import {Schedule} from '../../models/academic/Schedule.js';
import {Subject} from '../../models/academic/Subject.js';
import {Faculty} from '../../models/user/Faculty.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import {ApiFeatures} from '../../utils/ApiFeatures.js';

/**
 * @desc    إنشاء جدول جديد
 * @route   POST /api/v1/schedules
 * @access  private (admin, faculty)
 */
export const createSchedule = catchAsync(async (req, res, next) => {
  // التحقق من وجود المادة
  const subject = await Subject.findById(req.body.subjectId);
  if (!subject) {
    return next(new AppError('المادة غير موجودة', 404));
  }

  // التحقق من وجود الأستاذ
  const faculty = await Faculty.findById(req.body.facultyId);
  if (!faculty) {
    return next(new AppError('الأستاذ غير موجود', 404));
  }

  const schedule = await Schedule.create(req.body);
  res.status(201).json({status: 'success', data: {schedule}});
});

/**
 * @desc    الحصول على جميع الجداول
 * @route   GET /api/v1/schedules
 * @access  public
 */
export const getAllSchedules = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(
    Schedule.find()
      .populate('subjectId', 'name code')
      .populate('facultyId', 'name email'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const schedules = await features.query;
  const total = await Schedule.countDocuments(features.filterQuery);

  res.status(200).json({
    status: 'success',
    results: schedules.length,
    total,
    data: {schedules}
  });
});

/**
 * @desc    الحصول على جدول بواسطة المعرف
 * @route   GET /api/v1/schedules/:id
 * @access  public
 */
export const getScheduleById = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('subjectId', 'name code')
    .populate('facultyId', 'name email');

  if (!schedule) {
    return next(new AppError('الجدول غير موجود', 404));
  }

  res.status(200).json({status: 'success', data: {schedule}});
});

/**
 * @desc    تحديث جدول
 * @route   PATCH /api/v1/schedules/:id
 * @access  private (admin, faculty)
 */
export const updateSchedule = catchAsync(async (req, res, next) => {
  // التحقق من المادة إذا تم تحديثها
  if (req.body.subjectId) {
    const subject = await Subject.findById(req.body.subjectId);
    if (!subject) {
      return next(new AppError('المادة غير موجودة', 404));
    }
  }

  // التحقق من الأستاذ إذا تم تحديثه
  if (req.body.facultyId) {
    const faculty = await Faculty.findById(req.body.facultyId);
    if (!faculty) {
      return next(new AppError('الأستاذ غير موجود', 404));
    }
  }

  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('subjectId', 'name code')
    .populate('facultyId', 'name email');

  if (!schedule) {
    return next(new AppError('الجدول غير موجود', 404));
  }

  res.status(200).json({status: 'success', data: {schedule}});
});

/**
 * @desc    حذف جدول
 * @route   DELETE /api/v1/schedules/:id
 * @access  private (admin)
 */
export const deleteSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);

  if (!schedule) {
    return next(new AppError('الجدول غير موجود', 404));
  }

  res.status(204).json({status: 'success', data: null});
});

/**
 * @desc    الحصول على جداول مادة معينة
 * @route   GET /api/v1/schedules/subject/:subjectId
 * @access  public
 */
export const getSchedulesBySubject = catchAsync(async (req, res, next) => {
  const schedules = await Schedule.find({
    subjectId: req.params.subjectId,
    isActive: true
  })
    .populate('facultyId', 'name email')
    .select('dayOfWeek startTime endTime room facultyId');

  res.status(200).json({
    status: 'success',
    results: schedules.length,
    data: {schedules}
  });
});

/**
 * @desc    الحصول على جداول أستاذ معين
 * @route   GET /api/v1/schedules/faculty/:facultyId
 * @access  public
 */
export const getSchedulesByFaculty = catchAsync(async (req, res, next) => {
  const schedules = await Schedule.find({
    facultyId: req.params.facultyId,
    isActive: true
  })
    .populate('subjectId', 'name code')
    .select('dayOfWeek startTime endTime room subjectId');

  res.status(200).json({
    status: 'success',
    results: schedules.length,
    data: {schedules}
  });
});

/**
 * @desc    الحصول على الجداول النشطة فقط
 * @route   GET /api/v1/schedules/active
 * @access  public
 */
export const getActiveSchedules = catchAsync(async (req, res, next) => {
  const schedules = await Schedule.find({isActive: true})
    .populate('subjectId', 'name code')
    .populate('facultyId', 'name email')
    .select('dayOfWeek startTime endTime room subjectId facultyId');

  res.status(200).json({
    status: 'success',
    results: schedules.length,
    data: {schedules}
  });
});

/**
 * @desc    الحصول على جداول يوم معين
 * @route   GET /api/v1/schedules/day/:dayOfWeek
 * @access  public
 */
export const getSchedulesByDay = catchAsync(async (req, res, next) => {
  const {dayOfWeek} = req.params;
  const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  if (!validDays.includes(dayOfWeek.toLowerCase())) {
    return next(new AppError('يوم غير صحيح', 400));
  }

  const schedules = await Schedule.find({
    dayOfWeek: dayOfWeek.toLowerCase(),
    isActive: true
  })
    .populate('subjectId', 'name code')
    .populate('facultyId', 'name email')
    .sort('startTime');

  res.status(200).json({
    status: 'success',
    results: schedules.length,
    data: {schedules}
  });
});

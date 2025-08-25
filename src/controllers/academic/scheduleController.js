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
  const schedule = await Schedule.create({
    ...req.body,
    university: req.user.university
  });
  res.status(201).json({status: 'success', data: {schedule}});
});

/**
 * @desc    الحصول على جميع الجداول
 * @route   GET /api/v1/schedules
 * @access  public
 */
export const getAllSchedules = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(
    Schedule.find({university: req.user.university})
      .populate('subjectId', 'name code')
      .populate('facultyId', 'name email'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const schedules = await features.mongooseQuery;
  const total = await Schedule.countDocuments({university: req.user.university});

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
  const schedule = await Schedule.findOne({
    _id: req.params.id,
    university: req.user.university
  })
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
  const schedule = await Schedule.findOneAndUpdate(
    {_id: req.params.id, university: req.user.university},
    req.body,
    {new: true, runValidators: true}
  )
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
  const schedule = await Schedule.findOneAndDelete({
    _id: req.params.id,
    university: req.user.university
  });

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
    university: req.user.university,
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
    university: req.user.university,
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
  const schedules = await Schedule.find({
    university: req.user.university,
    isActive: true
  })
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
    university: req.user.university,
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

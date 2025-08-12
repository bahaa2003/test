import {Faculty} from '../../models/user/Faculty.js';
import {Attendance} from '../../models/operational/Attendance.js';
import {Schedule} from '../../models/academic/Schedule.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import {ApiFeatures} from '../../utils/ApiFeatures.js';

/**
 * @desc    تسجيل حضور عضو هيئة التدريس
 * @route   POST /api/v1/attendance/faculty
 * @access  private (faculty)
 */
export const recordFacultyAttendance = catchAsync(async (req, res, next) => {
  const {scheduleId, date, status, notes} = req.body;

  // التحقق من وجود الجدول
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    return next(new AppError('الجدول غير موجود', 404));
  }

  // التحقق من أن الأستاذ هو من يدرس هذا الجدول
  if (!schedule.facultyId.equals(req.user._id)) {
    return next(new AppError('غير مصرح لك بتسجيل الحضور لهذا الجدول', 403));
  }

  // التحقق من عدم وجود تسجيل حضور سابق لنفس اليوم والجدول
  const existingAttendance = await Attendance.findOne({
    scheduleId,
    facultyId: req.user._id,
    date: new Date(date)
  });

  if (existingAttendance) {
    return next(new AppError('تم تسجيل الحضور مسبقاً لهذا اليوم', 400));
  }

  const attendance = await Attendance.create({
    scheduleId,
    facultyId: req.user._id,
    date: new Date(date),
    status: status || 'present',
    notes,
    type: 'faculty'
  });

  res.status(201).json({status: 'success', data: {attendance}});
});

/**
 * @desc    الحصول على سجل حضور عضو هيئة التدريس
 * @route   GET /api/v1/attendance/faculty
 * @access  private (faculty, admin)
 */
export const getFacultyAttendance = catchAsync(async (req, res, next) => {
  const {facultyId, startDate, endDate, scheduleId} = req.query;

  // تحديد معرف الأستاذ (يمكن للأدمن الوصول لأي أستاذ)
  const targetFacultyId = req.user.role === 'admin' ? facultyId : req.user._id;

  if (!targetFacultyId) {
    return next(new AppError('معرف الأستاذ مطلوب', 400));
  }

  const filterQuery = {
    facultyId: targetFacultyId,
    type: 'faculty'
  };

  if (startDate && endDate) {
    filterQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  if (scheduleId) {
    filterQuery.scheduleId = scheduleId;
  }

  const features = new ApiFeatures(
    Attendance.find(filterQuery)
      .populate('scheduleId', 'subjectId facultyId')
      .populate('scheduleId.subjectId', 'name code'),
    req.query
  )
    .sort()
    .paginate();

  const attendance = await features.query;
  const total = await Attendance.countDocuments(filterQuery);

  res.status(200).json({
    status: 'success',
    results: attendance.length,
    total,
    data: {attendance}
  });
});

/**
 * @desc    تحديث سجل حضور عضو هيئة التدريس
 * @route   PATCH /api/v1/attendance/faculty/:id
 * @access  private (faculty, admin)
 */
export const updateFacultyAttendance = catchAsync(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return next(new AppError('سجل الحضور غير موجود', 404));
  }

  // التحقق من الصلاحيات
  if (req.user.role === 'faculty' && !attendance.facultyId.equals(req.user._id)) {
    return next(new AppError('غير مصرح لك بتعديل هذا السجل', 403));
  }

  const updatedAttendance = await Attendance.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new: true, runValidators: true}
  ).populate('scheduleId', 'subjectId facultyId');

  res.status(200).json({status: 'success', data: {attendance: updatedAttendance}});
});

/**
 * @desc    الحصول على إحصائيات حضور عضو هيئة التدريس
 * @route   GET /api/v1/attendance/faculty/stats
 * @access  private (faculty, admin)
 */
export const getFacultyAttendanceStats = catchAsync(async (req, res, next) => {
  const {facultyId, startDate, endDate} = req.query;

  const targetFacultyId = req.user.role === 'admin' ? facultyId : req.user._id;

  if (!targetFacultyId) {
    return next(new AppError('معرف الأستاذ مطلوب', 400));
  }

  const filterQuery = {
    facultyId: targetFacultyId,
    type: 'faculty'
  };

  if (startDate && endDate) {
    filterQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const stats = await Attendance.aggregate([
    {$match: filterQuery},
    {
      $group: {
        _id: '$status',
        count: {$sum: 1}
      }
    }
  ]);

  const totalDays = await Attendance.countDocuments(filterQuery);
  const presentDays = stats.find(s => s._id === 'present')?.count || 0;
  const absentDays = stats.find(s => s._id === 'absent')?.count || 0;
  const lateDays = stats.find(s => s._id === 'late')?.count || 0;

  const attendanceRate = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;

  res.status(200).json({
    status: 'success',
    data: {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendanceRate: Math.round(attendanceRate * 100) / 100
    }
  });
});

/**
 * @desc    الحصول على جداول عضو هيئة التدريس
 * @route   GET /api/v1/attendance/faculty/schedules
 * @access  private (faculty, admin)
 */
export const getFacultySchedules = catchAsync(async (req, res, next) => {
  const {facultyId} = req.query;

  const targetFacultyId = req.user.role === 'admin' ? facultyId : req.user._id;

  if (!targetFacultyId) {
    return next(new AppError('معرف الأستاذ مطلوب', 400));
  }

  const schedules = await Schedule.find({
    facultyId: targetFacultyId,
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

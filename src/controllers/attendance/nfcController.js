import { NfcDevice } from '../../models/operational/NfcDevice.js';
import { Attendance } from '../../models/operational/Attendance.js';
import { Student } from '../../models/user/Student.js';
import { Faculty } from '../../models/user/Faculty.js';
import { Schedule } from '../../models/academic/Schedule.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';
import { ApiFeatures } from '../../utils/ApiFeatures.js';
import nfcService from '../../services/nfcService.js';

/**
 * @desc    تسجيل جهاز NFC جديد
 * @route   POST /api/v1/attendance/nfc/devices
 * @access  private (admin)
 */
export const registerNfcDevice = catchAsync(async (req, res, next) => {
  const device = await nfcService.registerDevice(req.body);
  res.status(201).json({ status: 'success', data: { device } });
});

/**
 * @desc    الحصول على جميع أجهزة NFC
 * @route   GET /api/v1/attendance/nfc/devices
 * @access  private (admin)
 */
export const getAllNfcDevices = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(NfcDevice.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const devices = await features.query;
  const total = await NfcDevice.countDocuments(features.filterQuery);

  res.status(200).json({
    status: 'success',
    results: devices.length,
    total,
    data: { devices }
  });
});

/**
 * @desc    الحصول على جهاز NFC بواسطة المعرف
 * @route   GET /api/v1/attendance/nfc/devices/:id
 * @access  private (admin)
 */
export const getNfcDeviceById = catchAsync(async (req, res, next) => {
  const device = await NfcDevice.findById(req.params.id);

  if (!device) {
    return next(new AppError('جهاز NFC غير موجود', 404));
  }

  res.status(200).json({ status: 'success', data: { device } });
});

/**
 * @desc    تحديث جهاز NFC
 * @route   PATCH /api/v1/attendance/nfc/devices/:id
 * @access  private (admin)
 */
export const updateNfcDevice = catchAsync(async (req, res, next) => {
  const device = await NfcDevice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!device) {
    return next(new AppError('جهاز NFC غير موجود', 404));
  }

  res.status(200).json({ status: 'success', data: { device } });
});

/**
 * @desc    حذف جهاز NFC
 * @route   DELETE /api/v1/attendance/nfc/devices/:id
 * @access  private (admin)
 */
export const deleteNfcDevice = catchAsync(async (req, res, next) => {
  const device = await NfcDevice.findByIdAndDelete(req.params.id);

  if (!device) {
    return next(new AppError('جهاز NFC غير موجود', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});

/**
 * @desc    تسجيل الحضور عبر NFC
 * @route   POST /api/v1/attendance/nfc/record
 * @access  public (للأجهزة)
 */
export const recordNfcAttendance = catchAsync(async (req, res, next) => {
  const { deviceId, cardId, scheduleId, timestamp } = req.body;

  // التحقق من الجهاز
  const device = await NfcDevice.findOne({ deviceId, isActive: true });
  if (!device) {
    return next(new AppError('جهاز NFC غير صالح', 401));
  }

  // التحقق من الجدول
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule || !schedule.isActive) {
    return next(new AppError('الجدول غير موجود أو غير مفعل', 404));
  }

  // البحث عن الطالب أو الأستاذ
  let user = await Student.findOne({ cardId, isActive: true });
  let userType = 'student';

  if (!user) {
    user = await Faculty.findOne({ cardId, isActive: true });
    userType = 'faculty';
  }

  if (!user) {
    return next(new AppError('البطاقة غير مسجلة', 404));
  }

  // تسجيل الحضور
  const attendance = await nfcService.recordAttendance({
    deviceId: device._id,
    userId: user._id,
    userType,
    scheduleId,
    timestamp: timestamp || new Date()
  });

  res.status(201).json({
    status: 'success',
    message: 'تم تسجيل الحضور بنجاح',
    data: { attendance }
  });
});

/**
 * @desc    الحصول على إحصائيات جهاز NFC
 * @route   GET /api/v1/attendance/nfc/devices/:id/stats
 * @access  private (admin)
 */
export const getNfcDeviceStats = catchAsync(async (req, res, next) => {
  const stats = await nfcService.getDeviceStats(req.params.id);
  res.status(200).json({ status: 'success', data: { stats } });
});

/**
 * @desc    تحديث حالة جهاز NFC
 * @route   PATCH /api/v1/attendance/nfc/devices/:id/status
 * @access  private (admin)
 */
export const updateNfcDeviceStatus = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;

  const device = await NfcDevice.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true }
  );

  if (!device) {
    return next(new AppError('جهاز NFC غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    message: `تم ${isActive ? 'تفعيل' : 'تعطيل'} الجهاز بنجاح`,
    data: { device }
  });
});

/**
 * @desc    الحصول على سجلات الحضور عبر NFC
 * @route   GET /api/v1/attendance/nfc/records
 * @access  private (admin, faculty)
 */
export const getNfcAttendanceRecords = catchAsync(async (req, res, next) => {
  const { deviceId, startDate, endDate, userType } = req.query;

  const filterQuery = { recordedBy: 'nfc' };

  if (deviceId) {
    filterQuery.deviceId = deviceId;
  }

  if (userType) {
    filterQuery.userType = userType;
  }

  if (startDate && endDate) {
    filterQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const features = new ApiFeatures(
    Attendance.find(filterQuery)
      .populate('deviceId', 'deviceId location')
      .populate('userId', 'name cardId')
      .populate('scheduleId', 'subjectId'),
    req.query
  )
    .sort()
    .paginate();

  const records = await features.query;
  const total = await Attendance.countDocuments(filterQuery);

  res.status(200).json({
    status: 'success',
    results: records.length,
    total,
    data: { records }
  });
});

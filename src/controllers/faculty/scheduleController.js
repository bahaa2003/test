import { catchAsync } from '../../utils/catchError.js';
import { Schedule } from '../../models/academic/Schedule.js';
import { AppError } from '../../utils/AppError.js';
import { Section } from '../../models/academic/Section.js';

// إنشاء جدول محاضرات جديد
export const createSchedule = catchAsync(async (req, res, next) => {
  const faculty = req.user;
  
  // التحقق من أن المحاضر مسجل في المادة
  const section = await Section.findById(req.body.section);
  if (!section.faculty.equals(faculty._id)) {
    return next(new AppError('غير مصرح لك بإضافة جدول لهذه المادة', 403));
  }

  const scheduleData = {
    ...req.body,
    faculty: faculty._id,
    college: faculty.college,
    department: faculty.department || null
  };

  // التحقق من عدم وجود تعارض في الجدول
  const conflictingSchedule = await Schedule.findOne({
    faculty: faculty._id,
    'timeSlots.day': req.body.timeSlots.day,
    'timeSlots.startTime': { $lt: req.body.timeSlots.endTime },
    'timeSlots.endTime': { $gt: req.body.timeSlots.startTime }
  });

  if (conflictingSchedule) {
    return next(new AppError('هناك تعارض في جدول المحاضرات', 400));
  }

  const schedule = await Schedule.create(scheduleData);

  // تحديث القسم بإضافة الجدول الجديد
  await Section.findByIdAndUpdate(
    req.body.section,
    { $push: { schedules: schedule._id } }
  );

  res.status(201).json({
    status: 'success',
    data: { schedule }
  });
});

// الحصول على جدول محاضر معين مع تفاصيل كاملة
export const getFacultySchedule = catchAsync(async (req, res, next) => {
  const schedules = await Schedule.find({ faculty: req.user._id })
    .populate({
      path: 'section',
      populate: {
        path: 'course',
        select: 'name code creditHours'
      }
    })
    .populate({
      path: 'section.students',
      select: 'name academicId'
    })
    .sort('timeSlots.day timeSlots.startTime');

  res.status(200).json({
    status: 'success',
    results: schedules.length,
    data: { schedules }
  });
});

// تحديث جدول المحاضرات مع التحقق من الصلاحيات
export const updateSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findOneAndUpdate(
    { 
      _id: req.params.id, 
      faculty: req.user._id 
    },
    req.body,
    { 
      new: true,
      runValidators: true 
    }
  );

  if (!schedule) {
    return next(new AppError('لم يتم العثور على الجدول أو ليس لديك صلاحية التعديل', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { schedule }
  });
});

// حذف جدول محاضرات
export const deleteSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findOneAndDelete({
    _id: req.params.id,
    faculty: req.user._id
  });

  if (!schedule) {
    return next(new AppError('لم يتم العثور على الجدول أو ليس لديك صلاحية الحذف', 404));
  }

  // إزالة الجدول من القسم المرتبط
  await Section.findByIdAndUpdate(
    schedule.section,
    { $pull: { schedules: schedule._id } }
  );

  res.status(204).json({
    status: 'success',
    data: null
  });
});
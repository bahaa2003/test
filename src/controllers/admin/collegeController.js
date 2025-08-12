import {catchAsync} from '../../utils/catchAsync.js';
import {College} from '../../models/academic/College.js';
import {AppError} from '../../utils/AppError.js';

// إنشاء كلية جديدة
export const createCollege = catchAsync(async (req, res, next) => {
  const {name, type, totalYears, hasDepartments} = req.body;

  const college = await College.create({
    name,
    type,
    totalYears,
    hasDepartments
  });

  res.status(201).json({
    status: 'success',
    data: {college}
  });
});

// الحصول على جميع الكليات
export const getAllColleges = catchAsync(async (req, res, next) => {
  const colleges = await College.find().populate('departments');

  res.status(200).json({
    status: 'success',
    results: colleges.length,
    data: {colleges}
  });
});

// تحديث بيانات كلية
export const updateCollege = catchAsync(async (req, res, next) => {
  const college = await College.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new: true, runValidators: true}
  );

  if (!college) {
    return next(new AppError('No college found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {college}
  });
});

// حذف كلية
export const deleteCollege = catchAsync(async (req, res, next) => {
  const college = await College.findByIdAndDelete(req.params.id);

  if (!college) {
    return next(new AppError('No college found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

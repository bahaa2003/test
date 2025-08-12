import {catchAsync} from '../../utils/catchAsync.js';
import {Department} from '../../models/academic/Department.js';
import {College} from '../../models/academic/College.js';
import {AppError} from '../../utils/AppError.js';

// إنشاء قسم جديد
export const createDepartment = catchAsync(async (req, res, next) => {
  const {name, code, collegeId, totalYears} = req.body;

  const college = await College.findById(collegeId);
  if (!college.hasDepartments) {
    return next(new AppError('هذه الكلية لا تحتوي على أقسام', 400));
  }

  const department = await Department.create({
    name,
    code,
    college: collegeId,
    totalYears
  });

  res.status(201).json({
    status: 'success',
    data: {department}
  });
});

// الحصول على أقسام كلية معينة
export const getCollegeDepartments = catchAsync(async (req, res, next) => {
  const departments = await Department.find({college: req.params.collegeId});

  res.status(200).json({
    status: 'success',
    results: departments.length,
    data: {departments}
  });
});

// إدارة رؤساء الأقسام
export const assignHeadOfDepartment = catchAsync(async (req, res, next) => {
  const {facultyId} = req.body;

  const department = await Department.findByIdAndUpdate(
    req.params.id,
    {headOfDepartment: facultyId},
    {new: true}
  );

  res.status(200).json({
    status: 'success',
    data: {department}
  });
});

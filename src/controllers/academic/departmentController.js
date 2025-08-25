import {Department} from '../../models/academic/Department.js';
import {College} from '../../models/academic/College.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import {ApiFeatures} from '../../utils/ApiFeatures.js';

/**
 * @desc    إنشاء قسم جديد
 * @route   POST /api/v1/departments
 * @access  private (admin)
 */
export const createDepartment = catchAsync(async (req, res, next) => {
  // التحقق من وجود الكلية
  const college = await College.findById(req.body.college);
  if (!college) {
    return next(new AppError('الكلية غير موجودة', 404));
  }

  const department = await Department.create(req.body);
  res.status(201).json({status: 'success', data: {department}});
});

/**
 * @desc    الحصول على جميع الأقسام
 * @route   GET /api/v1/departments
 * @access  public
 */
export const getAllDepartments = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Department.find().populate('college', 'name code'), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const departments = await features.mongooseQuery;
  const total = await Department.countDocuments();

  res.status(200).json({
    status: 'success',
    results: departments.length,
    total,
    data: {departments}
  });
});

/**
 * @desc    الحصول على قسم بواسطة المعرف
 * @route   GET /api/v1/departments/:id
 * @access  public
 */
export const getDepartmentById = catchAsync(async (req, res, next) => {
  const department = await Department.findById(req.params.id).populate('college', 'name code');

  if (!department) {
    return next(new AppError('القسم غير موجود', 404));
  }

  res.status(200).json({status: 'success', data: {department}});
});

/**
 * @desc    تحديث قسم
 * @route   PATCH /api/v1/departments/:id
 * @access  private (admin)
 */
export const updateDepartment = catchAsync(async (req, res, next) => {
  // التحقق من الكلية إذا تم تحديثها
  if (req.body.college) {
    const college = await College.findById(req.body.college);
    if (!college) {
      return next(new AppError('الكلية غير موجودة', 404));
    }
  }

  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('college', 'name code');

  if (!department) {
    return next(new AppError('القسم غير موجود', 404));
  }

  res.status(200).json({status: 'success', data: {department}});
});

/**
 * @desc    حذف قسم
 * @route   DELETE /api/v1/departments/:id
 * @access  private (admin)
 */
export const deleteDepartment = catchAsync(async (req, res, next) => {
  const department = await Department.findByIdAndDelete(req.params.id);

  if (!department) {
    return next(new AppError('القسم غير موجود', 404));
  }

  res.status(204).json({status: 'success', data: null});
});

/**
 * @desc    الحصول على أقسام كلية معينة
 * @route   GET /api/v1/departments/college/:collegeId
 * @access  public
 */
export const getDepartmentsByCollege = catchAsync(async (req, res, next) => {
  const departments = await Department.find({
    college: req.params.collegeId,
    isActive: true
  }).select('name code description');

  res.status(200).json({
    status: 'success',
    results: departments.length,
    data: {departments}
  });
});

/**
 * @desc    الحصول على الأقسام النشطة فقط
 * @route   GET /api/v1/departments/active
 * @access  public
 */
export const getActiveDepartments = catchAsync(async (req, res, next) => {
  const departments = await Department.find({isActive: true})
    .populate('college', 'name')
    .select('name code college');

  res.status(200).json({
    status: 'success',
    results: departments.length,
    data: {departments}
  });
});

/**
 * @desc    Get department statistics
 * @route   GET /api/v1/academic/departments/stats
 * @access  Public
 */
export const getDepartmentStats = catchAsync(async (req, res, next) => {
  const totalDepartments = await Department.countDocuments();
  const activeDepartments = await Department.countDocuments({isActive: true});
  const inactiveDepartments = totalDepartments - activeDepartments;

  // Get departments by college
  const departmentsByCollege = await Department.aggregate([
    {
      $group: {
        _id: '$college',
        count: {$sum: 1}
      }
    },
    {
      $lookup: {
        from: 'colleges',
        localField: '_id',
        foreignField: '_id',
        as: 'college'
      }
    },
    {
      $unwind: '$college'
    },
    {
      $project: {
        collegeName: '$college.name',
        count: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalDepartments,
      activeDepartments,
      inactiveDepartments,
      departmentsByCollege
    }
  });
});

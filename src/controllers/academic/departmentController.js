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
  const college = await College.findById(req.body.collegeId);
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
  const features = new ApiFeatures(Department.find().populate('collegeId', 'name code'), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const departments = await features.query;
  const total = await Department.countDocuments(features.filterQuery);

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
  const department = await Department.findById(req.params.id).populate('collegeId', 'name code');

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
  if (req.body.collegeId) {
    const college = await College.findById(req.body.collegeId);
    if (!college) {
      return next(new AppError('الكلية غير موجودة', 404));
    }
  }

  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('collegeId', 'name code');

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
    collegeId: req.params.collegeId,
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
    .populate('collegeId', 'name code')
    .select('name code collegeId');

  res.status(200).json({
    status: 'success',
    results: departments.length,
    data: {departments}
  });
});

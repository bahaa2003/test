import {Subject} from '../../models/academic/Subject.js';
import {Department} from '../../models/academic/Department.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import {ApiFeatures} from '../../utils/ApiFeatures.js';

/**
 * @desc    إنشاء مادة جديدة
 * @route   POST /api/v1/subjects
 * @access  private (admin, faculty)
 */
export const createSubject = catchAsync(async (req, res, next) => {
  const subject = await Subject.create({
    ...req.body,
    university: req.user.university
  });
  res.status(201).json({status: 'success', data: {subject}});
});

/**
 * @desc    الحصول على جميع المواد
 * @route   GET /api/v1/subjects
 * @access  public
 */
export const getAllSubjects = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(
    Subject.find({university: req.user.university}).populate('departmentId', 'name code'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const subjects = await features.mongooseQuery;
  const total = await Subject.countDocuments({university: req.user.university});

  res.status(200).json({
    status: 'success',
    results: subjects.length,
    total,
    data: {subjects}
  });
});

/**
 * @desc    الحصول على مادة بواسطة المعرف
 * @route   GET /api/v1/subjects/:id
 * @access  public
 */
export const getSubjectById = catchAsync(async (req, res, next) => {
  const subject = await Subject.findOne({
    _id: req.params.id,
    university: req.user.university
  }).populate('departmentId', 'name code');

  if (!subject) {
    return next(new AppError('المادة غير موجودة', 404));
  }

  res.status(200).json({status: 'success', data: {subject}});
});

/**
 * @desc    تحديث مادة
 * @route   PATCH /api/v1/subjects/:id
 * @access  private (admin, faculty)
 */
export const updateSubject = catchAsync(async (req, res, next) => {
  const subject = await Subject.findOneAndUpdate(
    {_id: req.params.id, university: req.user.university},
    req.body,
    {new: true, runValidators: true}
  ).populate('departmentId', 'name code');

  if (!subject) {
    return next(new AppError('المادة غير موجودة', 404));
  }

  res.status(200).json({status: 'success', data: {subject}});
});

/**
 * @desc    حذف مادة
 * @route   DELETE /api/v1/subjects/:id
 * @access  private (admin)
 */
export const deleteSubject = catchAsync(async (req, res, next) => {
  const subject = await Subject.findOneAndDelete({
    _id: req.params.id,
    university: req.user.university
  });

  if (!subject) {
    return next(new AppError('المادة غير موجودة', 404));
  }

  res.status(204).json({status: 'success', data: null});
});

/**
 * @desc    الحصول على مواد قسم معين
 * @route   GET /api/v1/subjects/department/:departmentId
 * @access  public
 */
export const getSubjectsByDepartment = catchAsync(async (req, res, next) => {
  const subjects = await Subject.find({
    departmentId: req.params.departmentId,
    university: req.user.university,
    isActive: true
  }).select('name code credits description');

  res.status(200).json({
    status: 'success',
    results: subjects.length,
    data: {subjects}
  });
});

/**
 * @desc    الحصول على المواد النشطة فقط
 * @route   GET /api/v1/subjects/active
 * @access  public
 */
export const getActiveSubjects = catchAsync(async (req, res, next) => {
  const subjects = await Subject.find({
    university: req.user.university,
    isActive: true
  })
    .populate('departmentId', 'name code')
    .select('name code credits departmentId');

  res.status(200).json({
    status: 'success',
    results: subjects.length,
    data: {subjects}
  });
});

/**
 * @desc    البحث في المواد
 * @route   GET /api/v1/subjects/search
 * @access  public
 */
export const searchSubjects = catchAsync(async (req, res, next) => {
  const {q} = req.query;

  if (!q) {
    return next(new AppError('مطلوب كلمة بحث', 400));
  }

  const subjects = await Subject.find({
    $and: [
      {university: req.user.university},
      {
        $or: [
          {name: {$regex: q, $options: 'i'}},
          {code: {$regex: q, $options: 'i'}},
          {description: {$regex: q, $options: 'i'}}
        ]
      },
      {isActive: true}
    ]
  }).populate('departmentId', 'name code');

  res.status(200).json({
    status: 'success',
    results: subjects.length,
    data: {subjects}
  });
});

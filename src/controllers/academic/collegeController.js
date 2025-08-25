import {College} from '../../models/academic/College.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import {ApiFeatures} from '../../utils/ApiFeatures.js';

/**
 * @desc    إنشاء كلية جديدة
 * @route   POST /api/v1/colleges
 * @access  private (admin)
 */
export const createCollege = catchAsync(async (req, res, next) => {
  // Clean empty string ObjectId fields before validation
  const collegeData = { ...req.body };
  if (collegeData.dean === '') {
    collegeData.dean = null;
  }
  
  const college = await College.create(collegeData);
  res.status(201).json({status: 'success', data: {college}});
});

/**
 * @desc    الحصول على جميع الكليات
 * @route   GET /api/v1/colleges
 * @access  public
 */
export const getAllColleges = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(College.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const colleges = await features.mongooseQuery;
  const total = await College.countDocuments();

  res.status(200).json({
    status: 'success',
    results: colleges.length,
    total,
    data: {colleges}
  });
});

/**
 * @desc    الحصول على كلية بواسطة المعرف
 * @route   GET /api/v1/colleges/:id
 * @access  public
 */
export const getCollegeById = catchAsync(async (req, res, next) => {
  const college = await College.findById(req.params.id);

  if (!college) {
    return next(new AppError('الكلية غير موجودة', 404));
  }

  res.status(200).json({status: 'success', data: {college}});
});

/**
 * @desc    تحديث كلية
 * @route   PATCH /api/v1/colleges/:id
 * @access  private (admin)
 */
export const updateCollege = catchAsync(async (req, res, next) => {
  // Clean empty string ObjectId fields before validation
  const updateData = { ...req.body };
  if (updateData.dean === '') {
    updateData.dean = null;
  }
  
  const college = await College.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  if (!college) {
    return next(new AppError('الكلية غير موجودة', 404));
  }

  res.status(200).json({status: 'success', data: {college}});
});

/**
 * @desc    حذف كلية
 * @route   DELETE /api/v1/colleges/:id
 * @access  private (admin)
 */
export const deleteCollege = catchAsync(async (req, res, next) => {
  const college = await College.findByIdAndDelete(req.params.id);

  if (!college) {
    return next(new AppError('الكلية غير موجودة', 404));
  }

  res.status(204).json({status: 'success', data: null});
});

/**
 * @desc    الحصول على الكليات النشطة فقط
 * @route   GET /api/v1/colleges/active
 * @access  public
 */
export const getActiveColleges = catchAsync(async (req, res, next) => {
  const colleges = await College.find({isActive: true}).select('name code');

  res.status(200).json({
    status: 'success',
    results: colleges.length,
    data: {colleges}
  });
});

/**
 * @desc    Get college statistics
 * @route   GET /api/v1/academic/colleges/stats
 * @access  Public
 */
export const getCollegeStats = catchAsync(async (req, res, next) => {
  const totalColleges = await College.countDocuments();
  const activeColleges = await College.countDocuments({isActive: true});
  const inactiveColleges = totalColleges - activeColleges;

  // Get colleges by university
  const collegesByUniversity = await College.aggregate([
    {
      $group: {
        _id: '$university',
        count: {$sum: 1}
      }
    },
    {
      $lookup: {
        from: 'universities',
        localField: '_id',
        foreignField: '_id',
        as: 'university'
      }
    },
    {
      $unwind: '$university'
    },
    {
      $project: {
        universityName: '$university.name',
        count: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalColleges,
      activeColleges,
      inactiveColleges,
      collegesByUniversity
    }
  });
});

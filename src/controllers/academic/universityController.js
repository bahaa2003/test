import {University} from '../../models/academic/University.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import {ApiFeatures} from '../../utils/ApiFeatures.js';

// @desc    Create new university
// @route   POST /api/v1/academic/universities
// @access  Private/Admin
export const createUniversity = catchAsync(async (req, res, next) => {
  const {
    name,
    code,
    establishedYear,
    country,
    city,
    address,
    contact,
    settings
  } = req.body;

  // Check if university with same name or code already exists
  const existingUniversity = await University.findOne({
    $or: [{name}, {code}]
  });

  if (existingUniversity) {
    return next(new AppError('جامعة بنفس الاسم أو الكود موجودة بالفعل', 400));
  }

  const university = await University.create({
    name,
    code,
    establishedYear,
    country,
    city,
    address,
    contact,
    settings,
    lastUpdatedBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الجامعة بنجاح',
    data: university
  });
});

// @desc    Get all universities
// @route   GET /api/v1/academic/universities
// @access  Private
export const getAllUniversities = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(University.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const universities = await features.mongooseQuery.populate('collegesCount');

  res.status(200).json({
    success: true,
    results: universities.length,
    data: universities
  });
});

// @desc    Get active universities
// @route   GET /api/v1/academic/universities/active
// @access  Private
export const getActiveUniversities = catchAsync(async (req, res, next) => {
  const universities = await University.find({isActive: true})
    .populate('collegesCount')
    .sort({name: 1});

  res.status(200).json({
    success: true,
    results: universities.length,
    data: universities
  });
});

// @desc    Get university by ID
// @route   GET /api/v1/academic/universities/:id
// @access  Private
export const getUniversityById = catchAsync(async (req, res, next) => {
  const university = await University.findById(req.params.id)
    .populate('colleges')
    .populate('collegesCount');

  if (!university) {
    return next(new AppError('الجامعة غير موجودة', 404));
  }

  res.status(200).json({
    success: true,
    data: university
  });
});

// @desc    Update university
// @route   PATCH /api/v1/academic/universities/:id
// @access  Private/Admin
export const updateUniversity = catchAsync(async (req, res, next) => {
  const {
    name,
    code,
    establishedYear,
    country,
    city,
    address,
    contact,
    settings,
    isActive
  } = req.body;

  // Check if university exists
  let university = await University.findById(req.params.id);
  if (!university) {
    return next(new AppError('الجامعة غير موجودة', 404));
  }

  // Check for duplicate name or code (excluding current university)
  if (name || code) {
    const duplicateQuery = {
      _id: {$ne: req.params.id}
    };

    if (name && code) {
      duplicateQuery.$or = [{name}, {code}];
    } else if (name) {
      duplicateQuery.name = name;
    } else if (code) {
      duplicateQuery.code = code;
    }

    const existingUniversity = await University.findOne(duplicateQuery);
    if (existingUniversity) {
      return next(new AppError('جامعة بنفس الاسم أو الكود موجودة بالفعل', 400));
    }
  }

  // Update university
  university = await University.findByIdAndUpdate(
    req.params.id,
    {
      ...(name && {name}),
      ...(code && {code}),
      ...(establishedYear && {establishedYear}),
      ...(country && {country}),
      ...(city && {city}),
      ...(address && {address}),
      ...(contact && {contact}),
      ...(settings && {settings}),
      ...(typeof isActive !== 'undefined' && {isActive}),
      lastUpdatedBy: req.user._id
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('collegesCount');

  res.status(200).json({
    success: true,
    message: 'تم تحديث الجامعة بنجاح',
    data: university
  });
});

// @desc    Delete university
// @route   DELETE /api/v1/academic/universities/:id
// @access  Private/Admin
export const deleteUniversity = catchAsync(async (req, res, next) => {
  const university = await University.findById(req.params.id);

  if (!university) {
    return next(new AppError('الجامعة غير موجودة', 404));
  }

  // Check if university has colleges
  const collegesCount = await University.countDocuments({university: req.params.id});
  if (collegesCount > 0) {
    return next(new AppError('لا يمكن حذف الجامعة لأنها تحتوي على كليات', 400));
  }

  await University.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'تم حذف الجامعة بنجاح'
  });
});

// @desc    Toggle university status
// @route   PATCH /api/v1/academic/universities/:id/toggle
// @access  Private/Admin
export const toggleUniversityStatus = catchAsync(async (req, res, next) => {
  const university = await University.findById(req.params.id);

  if (!university) {
    return next(new AppError('الجامعة غير موجودة', 404));
  }

  university.isActive = !university.isActive;
  university.lastUpdatedBy = req.user._id;
  await university.save();

  res.status(200).json({
    success: true,
    message: `تم ${university.isActive ? 'تفعيل' : 'إلغاء تفعيل'} الجامعة بنجاح`,
    data: university
  });
});

// @desc    Get universities by country
// @route   GET /api/v1/academic/universities/country/:country
// @access  Private
export const getUniversitiesByCountry = catchAsync(async (req, res, next) => {
  const universities = await University.find({
    country: req.params.country,
    isActive: true
  })
    .populate('collegesCount')
    .sort({name: 1});

  res.status(200).json({
    success: true,
    results: universities.length,
    data: universities
  });
});

import {Section} from '../../models/academic/Section.js';
import {Subject} from '../../models/academic/Subject.js';
import {Faculty} from '../../models/user/Faculty.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import {ApiFeatures} from '../../utils/ApiFeatures.js';

// @desc    Create new section
// @route   POST /api/v1/academic/sections
// @access  Private/Admin/Faculty
export const createSection = catchAsync(async (req, res, next) => {
  const {
    name,
    code,
    course,
    faculty,
    college,
    department
  } = req.body;

  // Clean empty string ObjectId fields before validation
  const sectionData = {
    name,
    code,
    course,
    faculty: faculty === '' ? null : faculty,
    college: college === '' ? null : college,
    department: department === '' ? null : department
  };

  // Check if section with same code already exists
  const existingSection = await Section.findOne({code});
  if (existingSection) {
    return next(new AppError('شعبة بنفس الكود موجودة بالفعل', 400));
  }

  // Verify that the course (subject) exists
  const subjectExists = await Subject.findById(course);
  if (!subjectExists) {
    return next(new AppError('المادة المحددة غير موجودة', 404));
  }

  // Verify that the faculty exists (only if faculty is provided)
  if (sectionData.faculty) {
    const facultyExists = await Faculty.findById(sectionData.faculty);
    if (!facultyExists) {
      return next(new AppError('المحاضر المحدد غير موجود', 404));
    }
  }

  const section = await Section.create(sectionData);

  // Populate the created section
  await section.populate([
    {path: 'course', select: 'name code credits'},
    {path: 'faculty', select: 'name employeeId'},
    {path: 'college', select: 'name'},
    {path: 'department', select: 'name'}
  ]);

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الشعبة بنجاح',
    data: section
  });
});

// @desc    Get all sections
// @route   GET /api/v1/academic/sections
// @access  Private
export const getAllSections = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(
    Section.find().populate([
      {path: 'course', select: 'name code credits'},
      {path: 'faculty', select: 'name employeeId'},
      {path: 'college', select: 'name'},
      {path: 'department', select: 'name'}
    ]),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const sections = await features.mongooseQuery;

  res.status(200).json({
    success: true,
    results: sections.length,
    data: sections
  });
});

// @desc    Get active sections
// @route   GET /api/v1/academic/sections/active
// @access  Private
export const getActiveSections = catchAsync(async (req, res, next) => {
  const sections = await Section.find({isActive: true})
    .populate([
      {path: 'course', select: 'name code credits'},
      {path: 'faculty', select: 'name employeeId'},
      {path: 'college', select: 'name'},
      {path: 'department', select: 'name'}
    ])
    .sort({name: 1});

  res.status(200).json({
    success: true,
    results: sections.length,
    data: sections
  });
});

// @desc    Get section by ID
// @route   GET /api/v1/academic/sections/:id
// @access  Private
export const getSectionById = catchAsync(async (req, res, next) => {
  const section = await Section.findById(req.params.id)
    .populate([
      {path: 'course', select: 'name code credits description'},
      {path: 'faculty', select: 'name employeeId email contactNumber'},
      {path: 'college', select: 'name'},
      {path: 'department', select: 'name'},
      {path: 'students', select: 'name studentId email'},
      {path: 'schedules'}
    ]);

  if (!section) {
    return next(new AppError('الشعبة غير موجودة', 404));
  }

  res.status(200).json({
    success: true,
    data: section
  });
});

// @desc    Update section
// @route   PATCH /api/v1/academic/sections/:id
// @access  Private/Admin/Faculty
export const updateSection = catchAsync(async (req, res, next) => {
  const {
    name,
    code,
    course,
    faculty,
    college,
    department,
    isActive
  } = req.body;

  // Clean empty string ObjectId fields before validation
  const updateData = {
    name,
    code,
    course,
    faculty: faculty === '' ? null : faculty,
    college: college === '' ? null : college,
    department: department === '' ? null : department,
    isActive
  };

  // Check if section exists
  let section = await Section.findById(req.params.id);
  if (!section) {
    return next(new AppError('الشعبة غير موجودة', 404));
  }

  // Check for duplicate code (excluding current section)
  if (code) {
    const existingSection = await Section.findOne({
      code,
      _id: {$ne: req.params.id}
    });
    if (existingSection) {
      return next(new AppError('شعبة بنفس الكود موجودة بالفعل', 400));
    }
  }

  // Verify course exists if provided
  if (course) {
    const subjectExists = await Subject.findById(course);
    if (!subjectExists) {
      return next(new AppError('المادة المحددة غير موجودة', 404));
    }
  }

  // Verify faculty exists if provided (only if faculty is not null)
  if (updateData.faculty) {
    const facultyExists = await Faculty.findById(updateData.faculty);
    if (!facultyExists) {
      return next(new AppError('المحاضر المحدد غير موجود', 404));
    }
  }

  // Update section
  section = await Section.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).populate([
    {path: 'course', select: 'name code credits'},
    {path: 'faculty', select: 'name employeeId'},
    {path: 'college', select: 'name'},
    {path: 'department', select: 'name'}
  ]);

  res.status(200).json({
    success: true,
    message: 'تم تحديث الشعبة بنجاح',
    data: section
  });
});

// @desc    Delete section
// @route   DELETE /api/v1/academic/sections/:id
// @access  Private/Admin
export const deleteSection = catchAsync(async (req, res, next) => {
  const section = await Section.findById(req.params.id);

  if (!section) {
    return next(new AppError('الشعبة غير موجودة', 404));
  }

  // Check if section has students enrolled
  if (section.students && section.students.length > 0) {
    return next(new AppError('لا يمكن حذف الشعبة لأنها تحتوي على طلاب مسجلين', 400));
  }

  await Section.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'تم حذف الشعبة بنجاح'
  });
});

// @desc    Toggle section status
// @route   PATCH /api/v1/academic/sections/:id/toggle
// @access  Private/Admin/Faculty
export const toggleSectionStatus = catchAsync(async (req, res, next) => {
  const section = await Section.findById(req.params.id);

  if (!section) {
    return next(new AppError('الشعبة غير موجودة', 404));
  }

  section.isActive = !section.isActive;
  await section.save();

  res.status(200).json({
    success: true,
    message: `تم ${section.isActive ? 'تفعيل' : 'إلغاء تفعيل'} الشعبة بنجاح`,
    data: section
  });
});

// @desc    Get sections by faculty
// @route   GET /api/v1/academic/sections/faculty/:facultyId
// @access  Private
export const getSectionsByFaculty = catchAsync(async (req, res, next) => {
  const sections = await Section.find({
    faculty: req.params.facultyId,
    isActive: true
  })
    .populate([
      {path: 'course', select: 'name code credits'},
      {path: 'college', select: 'name'},
      {path: 'department', select: 'name'}
    ])
    .sort({name: 1});

  res.status(200).json({
    success: true,
    results: sections.length,
    data: sections
  });
});

// @desc    Get sections by course
// @route   GET /api/v1/academic/sections/course/:courseId
// @access  Private
export const getSectionsByCourse = catchAsync(async (req, res, next) => {
  const sections = await Section.find({
    course: req.params.courseId,
    isActive: true
  })
    .populate([
      {path: 'faculty', select: 'name employeeId'},
      {path: 'college', select: 'name'},
      {path: 'department', select: 'name'}
    ])
    .sort({name: 1});

  res.status(200).json({
    success: true,
    results: sections.length,
    data: sections
  });
});

// @desc    Add student to section
// @route   POST /api/v1/academic/sections/:id/students
// @access  Private/Admin
export const addStudentToSection = catchAsync(async (req, res, next) => {
  const {studentId} = req.body;
  const section = await Section.findById(req.params.id);

  if (!section) {
    return next(new AppError('الشعبة غير موجودة', 404));
  }

  // Check if student is already enrolled
  if (section.students.includes(studentId)) {
    return next(new AppError('الطالب مسجل بالفعل في هذه الشعبة', 400));
  }

  section.students.push(studentId);
  await section.save();

  await section.populate([
    {path: 'students', select: 'name studentId email'},
    {path: 'course', select: 'name code'},
    {path: 'faculty', select: 'name employeeId'}
  ]);

  res.status(200).json({
    success: true,
    message: 'تم إضافة الطالب للشعبة بنجاح',
    data: section
  });
});

// @desc    Remove student from section
// @route   DELETE /api/v1/academic/sections/:id/students/:studentId
// @access  Private/Admin
export const removeStudentFromSection = catchAsync(async (req, res, next) => {
  const section = await Section.findById(req.params.id);

  if (!section) {
    return next(new AppError('الشعبة غير موجودة', 404));
  }

  // Check if student is enrolled
  if (!section.students.includes(req.params.studentId)) {
    return next(new AppError('الطالب غير مسجل في هذه الشعبة', 400));
  }

  section.students = section.students.filter(
    student => student.toString() !== req.params.studentId
  );
  await section.save();

  res.status(200).json({
    success: true,
    message: 'تم إزالة الطالب من الشعبة بنجاح'
  });
});

import {Admin} from '../../models/user/Admin.js';
import {Faculty} from '../../models/user/Faculty.js';
import {Student} from '../../models/user/Student.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';

/**
 * @desc    الحصول على الملف الشخصي للمستخدم
 * @route   GET /api/v1/auth/profile
 * @access  private
 */
export const getProfile = catchAsync(async (req, res, next) => {
  const {role} = req.user;

  // تحديد النموذج حسب الدور
  let UserModel;
  switch (role) {
    case 'admin':
      UserModel = Admin;
      break;
    case 'faculty':
      UserModel = Faculty;
      break;
    case 'student':
      UserModel = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  // البحث عن المستخدم مع البيانات المرتبطة
  const user = await UserModel.findById(req.user._id)
    .populate('departmentId', 'name code')
    .populate('collegeId', 'name code');

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {user}
  });
});

/**
 * @desc    تحديث الملف الشخصي للمستخدم
 * @route   PATCH /api/v1/auth/profile
 * @access  private
 */
export const updateProfile = catchAsync(async (req, res, next) => {
  const {role} = req.user;
  const {name, email, phone, avatar} = req.body;

  // تحديد النموذج حسب الدور
  let UserModel;
  switch (role) {
    case 'admin':
      UserModel = Admin;
      break;
    case 'faculty':
      UserModel = Faculty;
      break;
    case 'student':
      UserModel = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  // التحقق من عدم تكرار البريد الإلكتروني
  if (email) {
    const existingUser = await UserModel.findOne({
      email,
      _id: {$ne: req.user._id}
    });
    if (existingUser) {
      return next(new AppError('البريد الإلكتروني مستخدم بالفعل', 400));
    }
  }

  // تحديث البيانات المسموح بها فقط
  const updateData = {};
  if (name) { updateData.name = name; }
  if (email) { updateData.email = email; }
  if (phone) { updateData.phone = phone; }
  if (avatar) { updateData.avatar = avatar; }

  const user = await UserModel.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true
  }).populate('departmentId', 'name code');

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'تم تحديث الملف الشخصي بنجاح',
    data: {user}
  });
});

/**
 * @desc    حذف الحساب
 * @route   DELETE /api/v1/auth/profile
 * @access  private
 */
export const deleteProfile = catchAsync(async (req, res, next) => {
  const {role} = req.user;
  const {password} = req.body;

  if (!password) {
    return next(new AppError('يرجى إدخال كلمة المرور للتأكيد', 400));
  }

  // تحديد النموذج حسب الدور
  let UserModel;
  switch (role) {
    case 'admin':
      UserModel = Admin;
      break;
    case 'faculty':
      UserModel = Faculty;
      break;
    case 'student':
      UserModel = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  // التحقق من كلمة المرور
  const user = await UserModel.findById(req.user._id).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('كلمة المرور غير صحيحة', 401));
  }

  // حذف الحساب
  await UserModel.findByIdAndDelete(req.user._id);

  // مسح الكوكيز
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({
    status: 'success',
    message: 'تم حذف الحساب بنجاح'
  });
});

/**
 * @desc    رفع صورة الملف الشخصي
 * @route   POST /api/v1/auth/profile/avatar
 * @access  private
 */
export const uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('يرجى رفع صورة', 400));
  }

  const {role} = req.user;

  // تحديد النموذج حسب الدور
  let UserModel;
  switch (role) {
    case 'admin':
      UserModel = Admin;
      break;
    case 'faculty':
      UserModel = Faculty;
      break;
    case 'student':
      UserModel = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  // تحديث الصورة
  const avatar = `/uploads/avatars/${req.file.filename}`;
  const user = await UserModel.findByIdAndUpdate(req.user._id, {avatar}, {new: true});

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'تم رفع الصورة بنجاح',
    data: {avatar: user.avatar}
  });
});

/**
 * @desc    الحصول على إحصائيات المستخدم
 * @route   GET /api/v1/auth/profile/stats
 * @access  private
 */
export const getProfileStats = catchAsync(async (req, res, next) => {
  const {role} = req.user;

  // تحديد النموذج حسب الدور
  let UserModel;
  switch (role) {
    case 'admin':
      UserModel = Admin;
      break;
    case 'faculty':
      UserModel = Faculty;
      break;
    case 'student':
      UserModel = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  const user = await UserModel.findById(req.user._id);
  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  // إحصائيات مختلفة حسب نوع المستخدم
  let stats = {
    lastLogin: user.lastLogin,
    accountCreated: user.createdAt,
    isActive: user.isActive
  };

  // إضافة إحصائيات خاصة بالطالب
  if (role === 'student') {
    // يمكن إضافة إحصائيات الحضور للطالب
    stats.totalSubjects = 0; // سيتم حسابها من قاعدة البيانات
    stats.attendanceRate = 0; // سيتم حسابها من قاعدة البيانات
  }

  // إضافة إحصائيات خاصة بالأستاذ
  if (role === 'faculty') {
    // يمكن إضافة إحصائيات المواد والطلاب
    stats.totalSubjects = 0; // سيتم حسابها من قاعدة البيانات
    stats.totalStudents = 0; // سيتم حسابها من قاعدة البيانات
  }

  res.status(200).json({
    status: 'success',
    data: {stats}
  });
});

import jwt from 'jsonwebtoken';
import {SystemAdmin} from '../../models/user/SystemAdmin.js';
import {Admin} from '../../models/user/Admin.js';
import {Faculty} from '../../models/user/Faculty.js';
import {Student} from '../../models/user/Student.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import {signToken} from '../../utils/auth/signToken.js';
import {setTokenCookie} from '../../utils/auth/setTokenCookie.js';

/**
 * دالة مساعدة لتحديد النموذج المناسب حسب الدور
 */
const getUserModel = (role) => {
  switch (role) {
    case 'system_admin':
      return SystemAdmin;
    case 'admin':
      return Admin;
    case 'faculty':
      return Faculty;
    case 'student':
      return Student;
    default:
      return null;
  }
};

/**
 * @desc    تسجيل الدخول
 * @route   POST /api/v1/auth/login
 * @access  public
 */
export const login = catchAsync(async (req, res, next) => {
  const {email, password, role} = req.body;

  // التحقق من وجود البريد الإلكتروني وكلمة المرور
  if (!email || !password) {
    return next(new AppError('يرجى إدخال البريد الإلكتروني وكلمة المرور', 400));
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

  // البحث عن المستخدم
  const user = await UserModel.findOne({email}).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401));
  }

  // التحقق من حالة الحساب
  if (!user.isActive) {
    return next(new AppError('الحساب معطل، يرجى التواصل مع الإدارة', 403));
  }

  // إنشاء التوكن
  const accessToken = signToken(user._id, role);
  const refreshToken = signToken(user._id, role, 'refresh');

  // حفظ التوكن في قاعدة البيانات
  user.refreshToken = refreshToken;
  await user.save();

  // إزالة كلمة المرور من الاستجابة
  user.password = undefined;
  user.refreshToken = undefined;

  // تعيين الكوكيز
  setTokenCookie(res, 'accessToken', accessToken);
  setTokenCookie(res, 'refreshToken', refreshToken);

  res.status(200).json({
    status: 'success',
    message: 'تم تسجيل الدخول بنجاح',
    data: {
      user,
      accessToken,
      refreshToken
    }
  });
});

/**
 * @desc    تسجيل الخروج
 * @route   POST /api/v1/auth/logout
 * @access  private
 */
export const logout = catchAsync(async (req, res, next) => {
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

  // إزالة التوكن من قاعدة البيانات
  await UserModel.findByIdAndUpdate(req.user._id, {
    refreshToken: undefined
  });

  // مسح الكوكيز
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({
    status: 'success',
    message: 'تم تسجيل الخروج بنجاح'
  });
});

/**
 * @desc    تحديث كلمة المرور
 * @route   PATCH /api/v1/auth/update-password
 * @access  private
 */
export const updatePassword = catchAsync(async (req, res, next) => {
  const {currentPassword, newPassword} = req.body;
  const {role} = req.user;

  // التحقق من وجود كلمات المرور
  if (!currentPassword || !newPassword) {
    return next(new AppError('يرجى إدخال كلمة المرور الحالية والجديدة', 400));
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

  // البحث عن المستخدم مع كلمة المرور
  const user = await UserModel.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  // التحقق من كلمة المرور الحالية
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('كلمة المرور الحالية غير صحيحة', 401));
  }

  // تحديث كلمة المرور
  user.password = newPassword;
  await user.save();

  // إزالة كلمة المرور من الاستجابة
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'تم تحديث كلمة المرور بنجاح',
    data: {user}
  });
});

/**
 * @desc    تحديث التوكن
 * @route   POST /api/v1/auth/refresh
 * @access  public
 */
export const refreshToken = catchAsync(async (req, res, next) => {
  const {refreshToken} = req.cookies || req.body;

  if (!refreshToken) {
    return next(new AppError('توكن التحديث مطلوب', 401));
  }

  try {
    // التحقق من التوكن
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // البحث عن المستخدم
    let user;
    let UserModel;

    // محاولة العثور على المستخدم في جميع النماذج
    user = await Admin.findById(decoded.id);
    if (user) { UserModel = Admin; }

    if (!user) {
      user = await Faculty.findById(decoded.id);
      if (user) { UserModel = Faculty; }
    }

    if (!user) {
      user = await Student.findById(decoded.id);
      if (user) { UserModel = Student; }
    }

    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError('توكن التحديث غير صالح', 401));
    }

    // إنشاء توكن جديد
    const newAccessToken = signToken(user._id, user.role);
    const newRefreshToken = signToken(user._id, user.role, 'refresh');

    // تحديث التوكن في قاعدة البيانات
    user.refreshToken = newRefreshToken;
    await user.save();

    // إزالة كلمة المرور من الاستجابة
    user.password = undefined;
    user.refreshToken = undefined;

    // تعيين الكوكيز الجديدة
    setTokenCookie(res, 'accessToken', newAccessToken);
    setTokenCookie(res, 'refreshToken', newRefreshToken);

    res.status(200).json({
      status: 'success',
      message: 'تم تحديث التوكن بنجاح',
      data: {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return next(new AppError('توكن التحديث غير صالح', 401));
  }
});

/**
 * @desc    الحصول على معلومات المستخدم الحالي
 * @route   GET /api/v1/auth/me
 * @access  private
 */
export const getMe = catchAsync(async (req, res, next) => {
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

  // البحث عن المستخدم
  const user = await UserModel.findById(req.user._id);
  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {user}
  });
});

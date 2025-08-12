import jwt from 'jsonwebtoken';
import {Admin} from '../../models/user/Admin.js';
import {Faculty} from '../../models/user/Faculty.js';
import {Student} from '../../models/user/Student.js';
import {AppError} from '../../utils/AppError.js';
import {catchAsync} from '../../utils/catchAsync.js';
import config from '../../config/config.js';

/**
 * middleware للمصادقة باستخدام JWT
 */
export const authenticate = catchAsync(async (req, res, next) => {
  let token;

  // التحقق من وجود التوكن في header أو cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('غير مصرح لك بالوصول، يرجى تسجيل الدخول', 401));
  }

  try {
    // التحقق من صحة التوكن
    const decoded = jwt.verify(token, config.jwt.secret);

    // البحث عن المستخدم في جميع النماذج
    let user = await Admin.findById(decoded.id);
    if (user) {
      user.role = 'admin';
    }

    if (!user) {
      user = await Faculty.findById(decoded.id);
      if (user) {
        user.role = 'faculty';
      }
    }

    if (!user) {
      user = await Student.findById(decoded.id);
      if (user) {
        user.role = 'student';
      }
    }

    if (!user) {
      return next(new AppError('المستخدم غير موجود', 401));
    }

    // التحقق من حالة الحساب
    if (!user.isActive) {
      return next(new AppError('الحساب معطل، يرجى التواصل مع الإدارة', 401));
    }

    // التحقق من تغيير كلمة المرور بعد إصدار التوكن
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return next(new AppError('تم تغيير كلمة المرور مؤخراً، يرجى تسجيل الدخول مرة أخرى', 401));
      }
    }

    // إضافة المستخدم للطلب
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('توكن غير صالح', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('انتهت صلاحية التوكن، يرجى تسجيل الدخول مرة أخرى', 401));
    }
    return next(new AppError('خطأ في المصادقة', 401));
  }
});

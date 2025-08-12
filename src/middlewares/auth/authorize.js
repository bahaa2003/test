import {AppError} from '../../utils/AppError.js';

/**
 * middleware للتفويض بناءً على الأدوار
 * @param {string[]} roles - الأدوار المسموح لها بالوصول
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('يجب تسجيل الدخول أولاً', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('غير مصرح لك بالوصول لهذا المورد', 403));
    }

    next();
  };
};

/**
 * middleware للتحقق من أن المستخدم يملك المورد
 * @param {string} resourceId - معرف المورد
 * @param {string} resourceModel - نموذج المورد
 */
export const checkOwnership = (resourceId, resourceModel) => {
  return async (req, res, next) => {
    try {
      const resource = await resourceModel.findById(req.params[resourceId]);

      if (!resource) {
        return next(new AppError('المورد غير موجود', 404));
      }

      // السماح للمشرفين بالوصول لأي مورد
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // التحقق من ملكية المورد
      if (resource.userId && !resource.userId.equals(req.user._id)) {
        return next(new AppError('غير مصرح لك بالوصول لهذا المورد', 403));
      }

      req.resource = resource;
      next();
    } catch (error) {
      return next(new AppError('خطأ في التحقق من ملكية المورد', 500));
    }
  };
};

/**
 * middleware للتحقق من أن المستخدم يمكنه الوصول لبيانات طالب معين
 */
export const canAccessStudent = () => {
  return async (req, res, next) => {
    const studentId = req.params.studentId || req.query.studentId || req.body.studentId;

    if (!studentId) {
      return next(new AppError('معرف الطالب مطلوب', 400));
    }

    // المشرفون يمكنهم الوصول لأي طالب
    if (req.user.role === 'admin') {
      return next();
    }

    // الأساتذة يمكنهم الوصول لطلابهم فقط
    if (req.user.role === 'faculty') {
      // هنا يمكن إضافة منطق للتحقق من أن الطالب مسجل في مادة يدرسها الأستاذ
      return next();
    }

    // الطلاب يمكنهم الوصول لبياناتهم فقط
    if (req.user.role === 'student') {
      if (!req.user._id.equals(studentId)) {
        return next(new AppError('غير مصرح لك بالوصول لبيانات طالب آخر', 403));
      }
    }

    next();
  };
};

/**
 * middleware للتحقق من أن المستخدم يمكنه الوصول لبيانات أستاذ معين
 */
export const canAccessFaculty = () => {
  return async (req, res, next) => {
    const facultyId = req.params.facultyId || req.query.facultyId || req.body.facultyId;

    if (!facultyId) {
      return next(new AppError('معرف الأستاذ مطلوب', 400));
    }

    // المشرفون يمكنهم الوصول لأي أستاذ
    if (req.user.role === 'admin') {
      return next();
    }

    // الأساتذة يمكنهم الوصول لبياناتهم فقط
    if (req.user.role === 'faculty') {
      if (!req.user._id.equals(facultyId)) {
        return next(new AppError('غير مصرح لك بالوصول لبيانات أستاذ آخر', 403));
      }
    }

    // الطلاب لا يمكنهم الوصول لبيانات الأساتذة
    if (req.user.role === 'student') {
      return next(new AppError('غير مصرح لك بالوصول لبيانات الأساتذة', 403));
    }

    next();
  };
};

/**
 * فئة الأخطاء المخصصة للتطبيق
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // التقاط stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * إنشاء خطأ عدم وجود مورد
   */
  static notFound(message = 'المورد غير موجود') {
    return new AppError(message, 404);
  }

  /**
   * إنشاء خطأ عدم التصريح
   */
  static unauthorized(message = 'غير مصرح بالوصول') {
    return new AppError(message, 401);
  }

  /**
   * إنشاء خطأ عدم الصلاحية
   */
  static forbidden(message = 'ليس لديك صلاحية للقيام بهذا الإجراء') {
    return new AppError(message, 403);
  }

  /**
   * إنشاء خطأ بيانات غير صحيحة
   */
  static badRequest(message = 'بيانات غير صحيحة') {
    return new AppError(message, 400);
  }

  /**
   * إنشاء خطأ تضارب في البيانات
   */
  static conflict(message = 'تضارب في البيانات') {
    return new AppError(message, 409);
  }

  /**
   * إنشاء خطأ في الخادم
   */
  static internal(message = 'خطأ في الخادم') {
    return new AppError(message, 500);
  }
}

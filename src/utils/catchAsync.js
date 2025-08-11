/**
 * معالج الأخطاء للدوال غير المتزامنة
 * @param {Function} fn - الدالة المراد تنفيذها
 * @returns {Function} دالة معالجة الأخطاء
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * معالج الأخطاء للدوال غير المتزامنة مع تسجيل الأخطاء
 * @param {Function} fn - الدالة المراد تنفيذها
 * @param {string} operation - اسم العملية للتسجيل
 * @returns {Function} دالة معالجة الأخطاء
 */
export const catchAsyncWithLogging = (fn, operation = 'Unknown operation') => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error(`Error in ${operation}:`, {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        user: req.user?.id
      });
      next(error);
    }
  };
};

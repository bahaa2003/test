import Joi from 'joi';
import { AppError } from '../../utils/AppError.js';

// التحقق من إنشاء جدول جديد
export const validateCreateSchedule = (req, res, next) => {
  const timeSlotSchema = Joi.object({
    day: Joi.string().valid('sunday', 'monday', 'tuesday', 'wednesday', 'thursday').required()
      .messages({
        'any.only': 'يوم غير صالح',
        'any.required': 'اليوم مطلوب'
      }),
    startTime: Joi.string().pattern(/^(0[8-9]|1[0-9]|2[0-1]):[0-5][0-9]$/).required()
      .messages({
        'string.pattern.base': 'وقت البداية يجب أن يكون بين 08:00 و21:00'
      }),
    endTime: Joi.string().pattern(/^(0[8-9]|1[0-9]|2[0-1]):[0-5][0-9]$/).required()
      .messages({
        'string.pattern.base': 'وقت النهاية يجب أن يكون بين 08:00 و21:00'
      }),
    type: Joi.string().valid('lecture', 'lab', 'tutorial').default('lecture')
  });

  const schema = Joi.object({
    subjectId: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'معرف المادة غير صالح',
        'any.required': 'معرف المادة مطلوب'
      }),
    facultyId: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'معرف عضو هيئة التدريس غير صالح'
      }),
    academicYearId: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'معرف السنة الأكاديمية غير صالح'
      }),
    semester: Joi.string().valid('fall', 'spring', 'summer').required()
      .messages({
        'any.only': 'فصل دراسي غير صالح'
      }),
    classroom: Joi.string().pattern(/^[A-Z]{1,2}-[0-9]{3}$/).required()
      .messages({
        'string.pattern.base': 'تنسيق القاعة غير صحيح (مثال: A-101)'
      }),
    maxStudents: Joi.number().integer().min(5).max(150).required()
      .messages({
        'number.min': 'الحد الأدنى للطلاب هو 5',
        'number.max': 'الحد الأقصى للطلاب هو 150'
      }),
    timeSlots: Joi.array().items(timeSlotSchema).min(1).required()
      .messages({
        'array.min': 'يجب تحديد حصة واحدة على الأقل'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  // تحقق إضافي من أن وقت النهاية بعد البداية
  req.body.timeSlots.forEach(slot => {
    const start = parseInt(slot.startTime.replace(':', ''));
    const end = parseInt(slot.endTime.replace(':', ''));
    if (end <= start) {
      return next(new AppError('وقت النهاية يجب أن يكون بعد وقت البداية', 400));
    }
  });

  next();
};

// التحقق من تحديث الجدول
export const validateUpdateSchedule = (req, res, next) => {
  const timeSlotSchema = Joi.object({
    day: Joi.string().valid('sunday', 'monday', 'tuesday', 'wednesday', 'thursday'),
    startTime: Joi.string().pattern(/^(0[8-9]|1[0-9]|2[0-1]):[0-5][0-9]$/),
    endTime: Joi.string().pattern(/^(0[8-9]|1[0-9]|2[0-1]):[0-5][0-9]$/),
    type: Joi.string().valid('lecture', 'lab', 'tutorial')
  });

  const schema = Joi.object({
    classroom: Joi.string().pattern(/^[A-Z]{1,2}-[0-9]{3}$/),
    maxStudents: Joi.number().integer().min(5).max(150),
    timeSlots: Joi.array().items(timeSlotSchema).min(1)
  }).min(1); // يجب وجود حقل واحد على الأقل للتحديث

  const { error } = schema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  next();
};

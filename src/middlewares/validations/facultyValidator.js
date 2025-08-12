import Joi from 'joi';
import {AppError} from '../../utils/AppError.js';
import moment from 'moment-timezone';

export const validateManualAttendance = (req, res, next) => {
  const schema = Joi.object({
    studentId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'معرف الطالب غير صالح',
        'string.length': 'معرف الطالب يجب أن يكون 24 حرفاً',
        'any.required': 'معرف الطالب مطلوب'
      }),
    scheduleId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'معرف الجدول غير صالح',
        'string.length': 'معرف الجدول يجب أن يكون 24 حرفاً',
        'any.required': 'معرف الجدول مطلوب'
      }),
    status: Joi.string()
      .valid('present', 'absent', 'late', 'excused')
      .default('present')
      .messages({
        'any.only': 'حالة الحضور غير صالحة'
      }),
    notes: Joi.string()
      .max(500)
      .messages({
        'string.max': 'يجب ألا تتجاوز الملاحظات 500 حرف'
      }),
    date: Joi.date()
      .iso()
      .max(moment().endOf('day'))
      .messages({
        'date.base': 'تنسيق التاريخ غير صالح',
        'date.max': 'لا يمكن تسجيل حضور لتاريخ مستقبلي'
      })
  });

  const {error} = schema.validate(req.body);
  if (error) { return next(new AppError(error.details[0].message, 400)); }

  next();
};

export const validateAttendanceUpdate = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('present', 'absent', 'late', 'excused')
      .required()
      .messages({
        'any.only': 'حالة الحضور غير صالحة',
        'any.required': 'حالة الحضور مطلوبة'
      }),
    notes: Joi.string()
      .max(500)
      .messages({
        'string.max': 'يجب ألا تتجاوز الملاحظات 500 حرف'
      }),
    override: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'يجب أن تكون قيمة التجاوز صحيحة أو خاطئة'
      })
  });

  const {error} = schema.validate(req.body);
  if (error) { return next(new AppError(error.details[0].message, 400)); }

  next();
};

export const validateAttendanceQuery = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date()
      .iso()
      .messages({
        'date.base': 'تنسيق التاريخ غير صالح'
      }),
    semester: Joi.string()
      .valid('fall', 'spring', 'summer')
      .messages({
        'any.only': 'الفصل الدراسي غير صالح'
      }),
    status: Joi.string()
      .valid('present', 'absent', 'late', 'excused')
      .messages({
        'any.only': 'حالة الحضور غير صالحة'
      }),
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'يجب أن يكون رقم الصفحة عدداً صحيحاً',
        'number.min': 'يجب أن يكون رقم الصفحة على الأقل 1'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'يجب أن يكون الحد عدداً صحيحاً',
        'number.min': 'يجب أن يكون الحد على الأقل 1',
        'number.max': 'يجب ألا يتجاوز الحد 100'
      })
  });

  const {error} = schema.validate(req.query);
  if (error) { return next(new AppError(error.details[0].message, 400)); }

  next();
};

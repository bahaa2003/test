import Joi from 'joi';
import {AppError} from '../../utils/AppError.js';
import moment from 'moment-timezone';

export const validateNfcRegistration = (req, res, next) => {
  const schema = Joi.object({
    deviceId: Joi.string()
      .pattern(/^[A-Z0-9]{3,10}-[A-Z0-9]{3,10}$/)
      .required()
      .messages({
        'string.pattern.base': 'تنسيق معرف الجهاز غير صالح (مثال: NFC-001 أو GATE-A1)',
        'any.required': 'معرف الجهاز مطلوب'
      }),
    name: Joi.string()
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.min': 'يجب أن يكون اسم الجهاز 3 أحرف على الأقل',
        'string.max': 'يجب ألا يتجاوز اسم الجهاز 50 حرفاً',
        'any.required': 'اسم الجهاز مطلوب'
      }),
    location: Joi.string()
      .valid('main_gate', 'college_gate', 'classroom', 'lab', 'library', 'auditorium')
      .required()
      .messages({
        'any.only': 'موقع غير صالح',
        'any.required': 'موقع الجهاز مطلوب'
      }),
    assignedCollege: Joi.string()
      .hex()
      .length(24)
      .messages({
        'string.hex': 'معرف الكلية غير صالح',
        'string.length': 'معرف الكلية يجب أن يكون 24 حرفاً'
      }),
    assignedDepartment: Joi.string()
      .hex()
      .length(24)
      .messages({
        'string.hex': 'معرف القسم غير صالح',
        'string.length': 'معرف القسم يجب أن يكون 24 حرفاً'
      })
  });

  const {error} = schema.validate(req.body);
  if (error) { return next(new AppError(error.details[0].message, 400)); }

  next();
};

export const validateNfcScan = (req, res, next) => {
  const schema = Joi.object({
    nfcSerial: Joi.string()
      .pattern(/^[A-Z0-9]{8,20}$/)
      .required()
      .messages({
        'string.pattern.base': 'رقم NFC غير صالح',
        'any.required': 'رقم NFC مطلوب'
      }),
    timestamp: Joi.date()
      .iso()
      .required()
      .messages({
        'date.base': 'تنسيق التاريخ غير صالح',
        'any.required': 'الطابع الزمني مطلوب'
      }),
    deviceLocation: Joi.string()
      .valid('gate', 'classroom', 'lab')
      .required()
      .messages({
        'any.only': 'موقع الجهاز غير صالح',
        'any.required': 'موقع الجهاز مطلوب'
      })
  });

  const {error} = schema.validate(req.body);
  if (error) { return next(new AppError(error.details[0].message, 400)); }

  // تحقق إضافي من أن التاريخ ليس في المستقبل
  if (moment(req.body.timestamp).isAfter(moment(), 'minute')) {
    return next(new AppError('لا يمكن تسجيل حضور لتاريخ مستقبلي', 400));
  }

  next();
};

export const validateNfcQuery = (req, res, next) => {
  const schema = Joi.object({
    startDate: Joi.date()
      .iso()
      .messages({
        'date.base': 'تنسيق تاريخ البداية غير صالح'
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .messages({
        'date.base': 'تنسيق تاريخ النهاية غير صالح',
        'date.min': 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
      }),
    status: Joi.string()
      .valid('present', 'absent', 'late', 'excused')
      .messages({
        'any.only': 'حالة الحضور غير صالحة'
      })
  });

  const {error} = schema.validate(req.query);
  if (error) { return next(new AppError(error.details[0].message, 400)); }

  next();
};

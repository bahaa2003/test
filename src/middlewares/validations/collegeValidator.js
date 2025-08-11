import Joi from 'joi';
import { AppError } from '../../utils/AppError.js';

// التحقق من بيانات الكلية الأساسية
export const validateCollege = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).max(100).required()
      .messages({
        'string.empty': 'اسم الكلية مطلوب',
        'string.min': 'يجب أن يكون اسم الكلية 3 أحرف على الأقل',
        'string.max': 'يجب ألا يتجاوز اسم الكلية 100 حرف'
      }),
    code: Joi.string().uppercase().trim().pattern(/^[A-Z]{3,5}$/).required()
      .messages({
        'string.pattern.base': 'كود الكلية يجب أن يكون 3-5 أحرف لاتينية كبيرة',
        'string.empty': 'كود الكلية مطلوب'
      }),
    establishedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).required()
      .messages({
        'number.base': 'سنة التأسيس يجب أن تكون رقماً',
        'number.min': 'سنة التأسيس يجب أن تكون بعد 1900',
        'number.max': 'سنة التأسيس لا يمكن أن تكون في المستقبل'
      }),
    dean: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'معرف العميد غير صالح',
        'string.length': 'معرف العميد يجب أن يكون 24 حرفاً'
      }),
    contact: Joi.object({
      phone: Joi.string().pattern(/^01[0-9]{9}$/),
      email: Joi.string().email()
    }).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  next();
};

// التحقق من نواب العميد
export const validateViceDeans = (req, res, next) => {
  const schema = Joi.object({
    viceDeans: Joi.array().items(
      Joi.string().hex().length(24)
    ).min(1).required()
      .messages({
        'array.min': 'يجب إضافة نائب عميد واحد على الأقل',
        'string.hex': 'معرف نائب العميد غير صالح'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  next();
};

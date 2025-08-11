import Joi from 'joi';
import { AppError } from '../../utils/AppError.js';

// التحقق من إنشاء مادة جديدة
export const validateCreateSubject = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().uppercase().pattern(/^[A-Z]{2,4}[0-9]{3,4}$/).required()
      .messages({
        'string.pattern.base': 'كود المادة يجب أن يكون 2-4 أحرف لاتينية متبوعة ب 3-4 أرقام',
        'any.required': 'كود المادة مطلوب'
      }),
    name: Joi.string().trim().min(3).max(100).required()
      .messages({
        'string.min': 'اسم المادة يجب أن يكون 3 أحرف على الأقل',
        'any.required': 'اسم المادة مطلوب'
      }),
    departmentId: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'معرف القسم غير صالح',
        'any.required': 'معرف القسم مطلوب'
      }),
    programIds: Joi.array().items(Joi.string().hex().length(24))
      .messages({
        'array.base': 'يجب أن تكون البرامج مصفوفة'
      }),
    creditHours: Joi.number().integer().min(1).max(6).required()
      .messages({
        'number.min': 'الحد الأدنى للساعات المعتمدة هو 1',
        'number.max': 'الحد الأقصى للساعات المعتمدة هو 6'
      }),
    prerequisites: Joi.array().items(Joi.string().hex().length(24))
  });

  const { error } = schema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  next();
};

// التحقق من تحديث المادة
export const validateUpdateSubject = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().uppercase().pattern(/^[A-Z]{2,4}[0-9]{3,4}$/),
    name: Joi.string().trim().min(3).max(100),
    programIds: Joi.array().items(Joi.string().hex().length(24)),
    creditHours: Joi.number().integer().min(1).max(6),
    prerequisites: Joi.array().items(Joi.string().hex().length(24))
  }).min(1); // يجب وجود حقل واحد على الأقل للتحديث

  const { error } = schema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  next();
};

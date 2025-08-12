import Joi from 'joi';
import {AppError} from '../../utils/AppError.js';

// التحقق من بيانات القسم الأساسية
export const validateDepartment = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.empty': 'اسم القسم مطلوب',
        'string.min': 'يجب أن يكون اسم القسم 3 أحرف على الأقل'
      }),
    code: Joi.string().uppercase()
      .trim()
      .pattern(/^[A-Z]{2,4}$/)
      .required()
      .messages({
        'string.pattern.base': 'كود القسم يجب أن يكون 2-4 أحرف لاتينية كبيرة'
      }),
    college: Joi.string().hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'معرف الكلية غير صالح'
      }),
    headOfDepartment: Joi.string().hex()
      .length(24)
      .optional(),
    totalYears: Joi.number().integer()
      .min(1)
      .max(6)
      .default(4)
      .messages({
        'number.min': 'يجب أن يكون للقسم سنة دراسية واحدة على الأقل',
        'number.max': 'لا يمكن أن يزيد عدد السنوات عن 6'
      }),
    studySystem: Joi.string().valid('semester', 'trimester', 'quarter')
      .default('semester')
  });

  const {error} = schema.validate(req.body);
  if (error) { return next(new AppError(error.details[0].message, 400)); }

  next();
};

// تحقق متقدم لرئيس القسم
export const validateHOD = async (req, res, next) => {
  if (req.body.headOfDepartment) {
    const faculty = await mongoose.model('Faculty').findById(req.body.headOfDepartment);
    if (!faculty || !['professor', 'associateProfessor'].includes(faculty.designation)) {
      return next(new AppError('رئيس القسم يجب أن يكون بروفيسور أو أستاذ مشارك', 400));
    }
  }
  next();
};

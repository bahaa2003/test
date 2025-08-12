import Joi from 'joi';

/**
 * مخطط التحقق من تسجيل الدخول
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'البريد الإلكتروني غير صحيح',
      'any.required': 'البريد الإلكتروني مطلوب'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      'any.required': 'كلمة المرور مطلوبة'
    })
});

/**
 * مخطط التحقق من تحديث كلمة المرور
 */
export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'كلمة المرور الحالية مطلوبة'
    }),
  newPassword: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل',
      'string.pattern.base': 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم',
      'any.required': 'كلمة المرور الجديدة مطلوبة'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'كلمة المرور غير متطابقة',
      'any.required': 'تأكيد كلمة المرور مطلوب'
    })
});

/**
 * مخطط التحقق من إنشاء مستخدم جديد
 */
export const createUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
      'string.max': 'الاسم يجب أن يكون 50 حرف كحد أقصى',
      'any.required': 'الاسم مطلوب'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'البريد الإلكتروني غير صحيح',
      'any.required': 'البريد الإلكتروني مطلوب'
    }),
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      'string.pattern.base': 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم',
      'any.required': 'كلمة المرور مطلوبة'
    }),
  role: Joi.string()
    .valid('admin', 'faculty', 'student')
    .required()
    .messages({
      'any.only': 'الدور يجب أن يكون admin أو faculty أو student',
      'any.required': 'الدور مطلوب'
    }),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s()]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'رقم الهاتف غير صحيح'
    })
});

/**
 * مخطط التحقق من تحديث بيانات المستخدم
 */
export const updateUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
      'string.max': 'الاسم يجب أن يكون 50 حرف كحد أقصى'
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'البريد الإلكتروني غير صحيح'
    }),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s()]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'رقم الهاتف غير صحيح'
    }),
  isActive: Joi.boolean()
    .optional()
});

/**
 * middleware للتحقق من صحة بيانات تسجيل الدخول
 */
export const validateLogin = (req, res, next) => {
  const {error} = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  next();
};

/**
 * middleware للتحقق من صحة بيانات تحديث كلمة المرور
 */
export const validateUpdatePassword = (req, res, next) => {
  const {error} = updatePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  next();
};

/**
 * middleware للتحقق من صحة بيانات إنشاء مستخدم
 */
export const validateCreateUser = (req, res, next) => {
  const {error} = createUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  next();
};

/**
 * middleware للتحقق من صحة بيانات تحديث مستخدم
 */
export const validateUpdateUser = (req, res, next) => {
  const {error} = updateUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  next();
};

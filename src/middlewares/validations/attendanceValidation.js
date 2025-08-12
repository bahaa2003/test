import Joi from 'joi';

/**
 * مخطط التحقق من تسجيل الحضور
 */
export const attendanceSchema = Joi.object({
  studentId: Joi.string()
    .required()
    .messages({
      'any.required': 'معرف الطالب مطلوب'
    }),
  subjectId: Joi.string()
    .required()
    .messages({
      'any.required': 'معرف المادة مطلوب'
    }),
  timeSlotId: Joi.string()
    .required()
    .messages({
      'any.required': 'معرف الفترة الزمنية مطلوب'
    }),
  date: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'التاريخ غير صحيح',
      'any.required': 'التاريخ مطلوب'
    }),
  status: Joi.string()
    .valid('present', 'absent', 'late', 'excused')
    .default('present')
    .messages({
      'any.only': 'حالة الحضور يجب أن تكون present أو absent أو late أو excused'
    }),
  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'الملاحظات يجب أن تكون 500 حرف كحد أقصى'
    })
});

/**
 * مخطط التحقق من تحديث الحضور
 */
export const updateAttendanceSchema = Joi.object({
  status: Joi.string()
    .valid('present', 'absent', 'late', 'excused')
    .required()
    .messages({
      'any.only': 'حالة الحضور يجب أن تكون present أو absent أو late أو excused',
      'any.required': 'حالة الحضور مطلوبة'
    }),
  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'الملاحظات يجب أن تكون 500 حرف كحد أقصى'
    })
});

/**
 * مخطط التحقق من تسجيل الحضور بالجملة
 */
export const bulkAttendanceSchema = Joi.object({
  date: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'التاريخ غير صحيح',
      'any.required': 'التاريخ مطلوب'
    }),
  subjectId: Joi.string()
    .required()
    .messages({
      'any.required': 'معرف المادة مطلوب'
    }),
  timeSlotId: Joi.string()
    .required()
    .messages({
      'any.required': 'معرف الفترة الزمنية مطلوب'
    }),
  attendances: Joi.array()
    .items(Joi.object({
      studentId: Joi.string().required(),
      status: Joi.string().valid('present', 'absent', 'late', 'excused')
        .default('present'),
      notes: Joi.string().max(500)
        .optional()
    }))
    .min(1)
    .required()
    .messages({
      'array.min': 'يجب تسجيل حضور طالب واحد على الأقل',
      'any.required': 'قائمة الحضور مطلوبة'
    })
});

/**
 * مخطط التحقق من الفترة الزمنية
 */
export const timeSlotSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'اسم الفترة يجب أن يكون حرفين على الأقل',
      'string.max': 'اسم الفترة يجب أن يكون 50 حرف كحد أقصى',
      'any.required': 'اسم الفترة مطلوب'
    }),
  startTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'وقت البداية يجب أن يكون بصيغة HH:MM',
      'any.required': 'وقت البداية مطلوب'
    }),
  endTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'وقت النهاية يجب أن يكون بصيغة HH:MM',
      'any.required': 'وقت النهاية مطلوب'
    }),
  description: Joi.string()
    .max(200)
    .optional()
    .messages({
      'string.max': 'الوصف يجب أن يكون 200 حرف كحد أقصى'
    }),
  isActive: Joi.boolean()
    .default(true)
});

/**
 * مخطط التحقق من جهاز NFC
 */
export const nfcDeviceSchema = Joi.object({
  deviceId: Joi.string()
    .required()
    .messages({
      'any.required': 'معرف الجهاز مطلوب'
    }),
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'اسم الجهاز يجب أن يكون حرفين على الأقل',
      'string.max': 'اسم الجهاز يجب أن يكون 50 حرف كحد أقصى',
      'any.required': 'اسم الجهاز مطلوب'
    }),
  location: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'الموقع يجب أن يكون 100 حرف كحد أقصى',
      'any.required': 'الموقع مطلوب'
    }),
  isActive: Joi.boolean()
    .default(true)
});

/**
 * middleware للتحقق من صحة بيانات الحضور
 */
export const validateAttendance = (req, res, next) => {
  const {error} = attendanceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  next();
};

/**
 * middleware للتحقق من صحة بيانات تحديث الحضور
 */
export const validateUpdateAttendance = (req, res, next) => {
  const {error} = updateAttendanceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  next();
};

/**
 * middleware للتحقق من صحة بيانات الحضور بالجملة
 */
export const validateBulkAttendance = (req, res, next) => {
  const {error} = bulkAttendanceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  next();
};

/**
 * middleware للتحقق من صحة بيانات الفترة الزمنية
 */
export const validateTimeSlot = (req, res, next) => {
  const {error} = timeSlotSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  next();
};

/**
 * middleware للتحقق من صحة بيانات جهاز NFC
 */
export const validateNfcDevice = (req, res, next) => {
  const {error} = nfcDeviceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  next();
};

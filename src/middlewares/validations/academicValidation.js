// src/middlewares/validations/academicValidation.js
import Joi from 'joi';
import mongoose from 'mongoose';
import validateRequest from '../validateRequest.js';
import {Department} from '../../models/academic/Department.js';
import {Subject} from '../../models/academic/Subject.js';
import {Faculty} from '../../models/user/Faculty.js';
import {Section} from '../../models/academic/Section.js';
import {AppError} from '../../utils/AppError.js';

// Validation schema for creating/updating a Program
const programSchema = Joi.object({
  name: Joi.string().required()
    .min(3)
    .max(100)
    .messages({
      'string.empty': 'اسم البرنامج مطلوب',
      'string.min': 'اسم البرنامج يجب أن يكون 3 أحرف على الأقل',
      'string.max': 'اسم البرنامج يجب أن يكون 100 حرف كحد أقصى'
    }),
  code: Joi.string().required()
    .min(2)
    .max(20)
    .messages({
      'string.empty': 'رمز البرنامج مطلوب',
      'string.min': 'رمز البرنامج يجب أن يكون حرفين على الأقل',
      'string.max': 'رمز البرنامج يجب أن يكون 20 حرف كحد أقصى'
    }),
  department: Joi.string().required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'معرف القسم مطلوب',
      'any.invalid': 'معرف القسم غير صحيح'
    }),
  description: Joi.string().allow('')
    .max(500)
    .messages({
      'string.max': 'الوصف يجب أن يكون 500 حرف كحد أقصى'
    }),
  duration: Joi.number().integer()
    .min(1)
    .max(10)
    .required()
    .messages({
      'number.base': 'المدة يجب أن تكون رقم',
      'number.min': 'المدة يجب أن تكون سنة واحدة على الأقل',
      'number.max': 'المدة يجب أن تكون 10 سنوات كحد أقصى'
    }),
  isActive: Joi.boolean().optional()
});

// Validation schema for creating/updating a Subject
const subjectSchema = Joi.object({
  name: Joi.string().required()
    .min(3)
    .max(100)
    .messages({
      'string.empty': 'اسم المادة مطلوب',
      'string.min': 'اسم المادة يجب أن يكون 3 أحرف على الأقل',
      'string.max': 'اسم المادة يجب أن يكون 100 حرف كحد أقصى'
    }),
  code: Joi.string().required()
    .min(2)
    .max(20)
    .messages({
      'string.empty': 'رمز المادة مطلوب',
      'string.min': 'رمز المادة يجب أن يكون حرفين على الأقل',
      'string.max': 'رمز المادة يجب أن يكون 20 حرف كحد أقصى'
    }),
  department: Joi.string().required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'معرف القسم مطلوب',
      'any.invalid': 'معرف القسم غير صحيح'
    }),
  creditHours: Joi.number().integer()
    .min(1)
    .max(6)
    .required()
    .messages({
      'number.base': 'الساعات المعتمدة يجب أن تكون رقم',
      'number.min': 'الساعات المعتمدة يجب أن تكون ساعة واحدة على الأقل',
      'number.max': 'الساعات المعتمدة يجب أن تكون 6 ساعات كحد أقصى'
    }),
  type: Joi.string()
    .valid('core', 'elective', 'prerequisite')
    .required()
    .messages({
      'any.only': 'نوع المادة يجب أن يكون أساسية أو اختيارية أو متطلب سابق',
      'any.required': 'نوع المادة مطلوب'
    }),
  description: Joi.string().allow('')
    .max(500)
    .messages({
      'string.max': 'الوصف يجب أن يكون 500 حرف كحد أقصى'
    }),
  prerequisites: Joi.array()
    .items(Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }))
    .optional()
    .messages({
      'any.invalid': 'معرف المتطلب السابق غير صحيح'
    }),
  isActive: Joi.boolean().optional()
});

// Validation schema for creating/updating a Schedule
const scheduleSchema = Joi.object({
  subject: Joi.string().required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'معرف المادة مطلوب',
      'any.invalid': 'معرف المادة غير صحيح'
    }),
  faculty: Joi.string().required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'معرف عضو هيئة التدريس مطلوب',
      'any.invalid': 'معرف عضو هيئة التدريس غير صحيح'
    }),
  section: Joi.string().required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'معرف الشعبة مطلوب',
      'any.invalid': 'معرف الشعبة غير صحيح'
    }),
  dayOfWeek: Joi.string()
    .valid('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')
    .required()
    .messages({
      'any.only': 'يوم الأسبوع يجب أن يكون يوم صحيح',
      'any.required': 'يوم الأسبوع مطلوب'
    }),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'وقت البداية يجب أن يكون بصيغة HH:MM',
      'any.required': 'وقت البداية مطلوب'
    }),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'وقت النهاية يجب أن يكون بصيغة HH:MM',
      'any.required': 'وقت النهاية مطلوب'
    }),
  room: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'رقم القاعة مطلوب',
      'string.min': 'رقم القاعة يجب أن يكون حرف واحد على الأقل',
      'string.max': 'رقم القاعة يجب أن يكون 50 حرف كحد أقصى'
    }),
  semester: Joi.string()
    .valid('fall', 'spring', 'summer')
    .required()
    .messages({
      'any.only': 'الفصل الدراسي يجب أن يكون خريف أو ربيع أو صيف',
      'any.required': 'الفصل الدراسي مطلوب'
    }),
  academicYear: Joi.string()
    .pattern(/^\d{4}-\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'السنة الأكاديمية يجب أن تكون بصيغة YYYY-YYYY',
      'any.required': 'السنة الأكاديمية مطلوبة'
    }),
  isActive: Joi.boolean().optional()
});

// Enhanced validation middleware with relationship checks
export const validateProgram = async (req, res, next) => {
  try {
    // Basic validation
    const { error } = programSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    // Check if department exists and belongs to user's university
    const department = await Department.findOne({
      _id: req.body.department,
      university: req.user.university
    });

    if (!department) {
      return res.status(400).json({
        status: 'error',
        message: 'القسم المحدد غير موجود أو لا ينتمي لجامعتك'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateSubject = async (req, res, next) => {
  try {
    // Basic validation
    const { error } = subjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    // Check if department exists and belongs to user's university
    const department = await Department.findOne({
      _id: req.body.department,
      university: req.user.university
    });

    if (!department) {
      return res.status(400).json({
        status: 'error',
        message: 'القسم المحدد غير موجود أو لا ينتمي لجامعتك'
      });
    }

    // Check prerequisites if provided
    if (req.body.prerequisites && req.body.prerequisites.length > 0) {
      const prerequisites = await Subject.find({
        _id: { $in: req.body.prerequisites },
        university: req.user.university
      });

      if (prerequisites.length !== req.body.prerequisites.length) {
        return res.status(400).json({
          status: 'error',
          message: 'بعض المتطلبات السابقة المحددة غير موجودة أو لا تنتمي لجامعتك'
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateSchedule = async (req, res, next) => {
  try {
    // Basic validation
    const { error } = scheduleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    // Validate time logic
    const startTime = req.body.startTime.split(':');
    const endTime = req.body.endTime.split(':');
    const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
    const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);

    if (startMinutes >= endMinutes) {
      return res.status(400).json({
        status: 'error',
        message: 'وقت البداية يجب أن يكون قبل وقت النهاية'
      });
    }

    // Check if subject exists and belongs to user's university
    const subject = await Subject.findOne({
      _id: req.body.subject,
      university: req.user.university
    });

    if (!subject) {
      return res.status(400).json({
        status: 'error',
        message: 'المادة المحددة غير موجودة أو لا تنتمي لجامعتك'
      });
    }

    // Check if faculty exists and belongs to user's university
    const faculty = await Faculty.findOne({
      _id: req.body.faculty,
      university: req.user.university
    });

    if (!faculty) {
      return res.status(400).json({
        status: 'error',
        message: 'عضو هيئة التدريس المحدد غير موجود أو لا ينتمي لجامعتك'
      });
    }

    // Check if section exists and belongs to user's university
    const section = await Section.findOne({
      _id: req.body.section,
      university: req.user.university
    });

    if (!section) {
      return res.status(400).json({
        status: 'error',
        message: 'الشعبة المحددة غير موجودة أو لا تنتمي لجامعتك'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

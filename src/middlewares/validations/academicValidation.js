// src/middlewares/validations/academicValidation.js
import Joi from 'joi';
import validateRequest from '../validateRequest.js'; // لازم تتأكد إن الملف ده موجود

// Validation schema for creating/updating a Program
const programSchema = Joi.object({
  name: Joi.string().required()
    .min(3)
    .max(100)
    .messages({
      'string.empty': 'Program name is required',
      'string.min': 'Program name must be at least 3 characters',
      'string.max': 'Program name must be at most 100 characters'
    }),
  code: Joi.string().required()
    .min(2)
    .max(20)
    .messages({
      'string.empty': 'Program code is required',
      'string.min': 'Program code must be at least 2 characters',
      'string.max': 'Program code must be at most 20 characters'
    }),
  department: Joi.string().required()
    .messages({
      'string.empty': 'Department ID is required'
    }),
  description: Joi.string().allow('')
    .max(500)
    .messages({
      'string.max': 'Description must be at most 500 characters'
    }),
  duration: Joi.number().integer()
    .min(1)
    .max(10)
    .required()
    .messages({
      'number.base': 'Duration must be a number',
      'number.min': 'Duration must be at least 1 year',
      'number.max': 'Duration must be at most 10 years'
    })
});

// Middleware function
export const validateProgram = validateRequest(programSchema);

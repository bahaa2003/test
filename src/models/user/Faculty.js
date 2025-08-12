import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {FACULTY_DESIGNATIONS, MAX_SPECIALIZATIONS} from '../../config/constants.js';

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      immutable: true,
      lowercase: true,
      validate: {
        validator: email => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email),
        message: 'بريد إلكتروني غير صالح'
      }
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'],
      select: false
    },
    contactNumber: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      match: [/^01[0-9]{9}$/, 'رقم هاتف غير صالح']
    },
    role: {
      type: String,
      enum: ['faculty'],
      default: 'faculty'
    },
    // Multi-tenant fields
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'يجب تحديد الجامعة']
    },
    academicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true
    },
    designation: {
      type: String,
      enum: FACULTY_DESIGNATIONS,
      required: [true, 'المسمى الوظيفي مطلوب']
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'يجب تحديد الكلية']
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: function () {
        return this.role === 'faculty';
      }
    },
    specialization: {
      type: [String],
      validate: {
        validator: function (specs) {
          return specs.length <= MAX_SPECIALIZATIONS;
        },
        message: `لا يمكن إضافة أكثر من ${MAX_SPECIALIZATIONS} تخصصات`
      }
    },
    nfcCard: {
      serialNumber: {
        type: String,
        unique: true,
        sparse: true,
        immutable: true
      },
      expiryDate: {
        type: Date,
        validate: {
          validator: function (date) {
            return date > new Date();
          },
          message: 'تاريخ انتهاء الصلاحية يجب أن يكون في المستقبل'
        }
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {timestamps: true}
);

// Middlewares for password hashing
facultySchema.pre('save', async function (next) {
  if (!this.isModified('password')) { return next(); }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

facultySchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for getting faculty's sections
facultySchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'faculty'
});

// Indexes
facultySchema.index({university: 1});
facultySchema.index({college: 1});
facultySchema.index({department: 1});
facultySchema.index({isActive: 1});

export const Faculty = mongoose.model('Faculty', facultySchema);

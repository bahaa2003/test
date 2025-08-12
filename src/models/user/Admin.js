import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {ADMIN_ROLES} from '../../config/constants.js';

const adminSchema = new mongoose.Schema(
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
      enum: ADMIN_ROLES,
      default: 'admin'
    },
    // Multi-tenant fields
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'يجب تحديد الجامعة']
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'يجب تحديد الكلية']
    },
    employeeId: {
      type: String,
      required: [true, 'رقم الموظف مطلوب'],
      unique: true,
      immutable: true
    },
    permissions: {
      manageUsers: {type: Boolean, default: false},
      manageContent: {type: Boolean, default: true},
      generateReports: {type: Boolean, default: true},
      systemSettings: {type: Boolean, default: false}
    },
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
);

// تشفير الباسورد
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// مقارنة الباسورد
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes
adminSchema.index({university: 1});
adminSchema.index({college: 1});
adminSchema.index({isActive: 1});

export const Admin = mongoose.model('Admin', adminSchema);

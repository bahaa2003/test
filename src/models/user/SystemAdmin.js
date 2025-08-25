import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * نموذج مدير النظام العام (Super Admin)
 * يدير النظام بأكمله ولا يرتبط بجامعة معينة
 */
const systemAdminSchema = new mongoose.Schema(
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
    role: {
      type: String,
      default: 'system_admin',
      immutable: true
    },
    permissions: {
      manageUniversities: {type: Boolean, default: true},
      manageSystemUsers: {type: Boolean, default: true},
      systemSettings: {type: Boolean, default: true},
      generateSystemReports: {type: Boolean, default: true},
      manageBackups: {type: Boolean, default: true}
    },
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    refreshToken: {
      type: String,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
);

// تشفير كلمة المرور قبل الحفظ
systemAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// مقارنة كلمة المرور
systemAdminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// فهارس قاعدة البيانات
systemAdminSchema.index({email: 1}, {unique: true});
systemAdminSchema.index({isActive: 1});

export const SystemAdmin = mongoose.model('SystemAdmin', systemAdminSchema);

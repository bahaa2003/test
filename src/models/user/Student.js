// models/user/Student.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema(
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
    // Multi-tenant fields
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'يجب تحديد الجامعة']
    },
    academicId: {
      type: String,
      required: [true, 'الرقم الأكاديمي مطلوب'],
      unique: true,
      immutable: true
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'يجب تحديد الكلية']
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'يجب تحديد القسم']
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'يجب تحديد السنة الأكاديمية']
    },
    nfcCard: {
      serialNumber: {
        type: String,
        unique: true,
        sparse: true,
        immutable: true
      },
      issueDate: {
        type: Date,
        default: Date.now
      },
      expiryDate: {
        type: Date,
        required: [true, 'تاريخ انتهاء الصلاحية مطلوب'],
        validate: {
          validator: function (date) {
            return date > new Date();
          },
          message: 'تاريخ انتهاء الصلاحية يجب أن يكون في المستقبل'
        }
      },
      isActive: {
        type: Boolean,
        default: true
      }
    },
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
      }
    ],
    role: {
      type: String,
      enum: ['student'],
      default: 'student'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {timestamps: true}
);

// Middlewares for password hashing
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) { return next(); }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes
studentSchema.index({university: 1});
studentSchema.index({college: 1});
studentSchema.index({department: 1});
studentSchema.index({academicYear: 1});
studentSchema.index({isActive: 1});

export const Student = mongoose.model('Student', studentSchema);

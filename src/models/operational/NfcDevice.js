import mongoose from 'mongoose';
import crypto from 'crypto';

const nfcDeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: [true, 'معرف الجهاز مطلوب'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9]{3,10}-[A-Z0-9]{3,10}$/.test(v);
      },
      message: 'تنسيق معرف الجهاز غير صالح (مثال: NFC-001 أو LAB-A12)'
    }
  },
  name: {
    type: String,
    required: [true, 'اسم الجهاز مطلوب'],
    trim: true,
    maxlength: [50, 'لا يمكن أن يتجاوز اسم الجهاز 50 حرف']
  },
  location: {
    type: String,
    required: [true, 'موقع الجهاز مطلوب'],
    enum: {
      values: ['main_gate', 'college_gate', 'classroom', 'lab', 'library', 'auditorium'],
      message: 'موقع غير صالح'
    }
  },
  assignedCollege: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    validate: {
      validator: async function(collegeId) {
        const college = await mongoose.model('College').findById(collegeId);
        return college && college.isActive;
      },
      message: 'الكلية غير موجودة أو غير مفعلة'
    }
  },
  assignedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    validate: {
      validator: async function(deptId) {
        if (!deptId) return true;
        const dept = await mongoose.model('Department').findById(deptId);
        return dept && dept.isActive;
      },
      message: 'القسم غير موجود أو غير مفعل'
    }
  },
  apiKey: {
    type: String,
    unique: true,
    select: false
  },
  apiKeyExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'يجب تحديد المسؤول المسجل للجهاز']
  },
  lastMaintenance: {
    date: Date,
    notes: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware لتوليد API Key قبل الحفظ
nfcDeviceSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  
  // توليد API Key عشوائي
  this.apiKey = crypto.randomBytes(32).toString('hex');
  
  // تحديد تاريخ انتهاء الصلاحية (سنة واحدة)
  this.apiKeyExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  
  next();
});

// Virtuals
nfcDeviceSchema.virtual('collegeInfo', {
  ref: 'College',
  localField: 'assignedCollege',
  foreignField: '_id',
  justOne: true
});

nfcDeviceSchema.virtual('departmentInfo', {
  ref: 'Department',
  localField: 'assignedDepartment',
  foreignField: '_id',
  justOne: true
});

// Indexes
nfcDeviceSchema.index({ deviceId: 1 }, { unique: true });
nfcDeviceSchema.index({ location: 1 });
nfcDeviceSchema.index({ assignedCollege: 1 });
nfcDeviceSchema.index({ isActive: 1 });

export const NfcDevice = mongoose.model('NfcDevice', nfcDeviceSchema);
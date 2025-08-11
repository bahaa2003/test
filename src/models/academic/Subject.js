import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'كود المادة مطلوب'],
    unique: true,
    uppercase: true,
    validate: {
      validator: v => /^[A-Z]{2,4}[0-9]{3,4}$/.test(v),
      message: 'كود المادة غير صالح (مثال: CS101 أو MATH1001)'
    }
  },
  name: {
    type: String,
    required: [true, 'اسم المادة مطلوب'],
    trim: true,
    maxlength: [100, 'لا يمكن أن يتجاوز اسم المادة 100 حرف']
  },
  description: {
    type: String,
    maxlength: [500, 'لا يمكن أن يتجاوز الوصف 500 حرف']
  },
  creditHours: {
    type: Number,
    required: true,
    min: [1, 'الحد الأدنى للساعات المعتمدة هو 1'],
    max: [6, 'الحد الأقصى للساعات المعتمدة هو 6']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'يجب تحديد القسم التابع له المادة']
  },
  programs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    validate: {
      validator: async function(programs) {
        const dept = await mongoose.model('Department').findById(this.department);
        const deptPrograms = await mongoose.model('Program').find({ department: dept._id });
        return programs.every(p => deptPrograms.some(dp => dp._id.equals(p)));
      },
      message: 'بعض البرامج المحددة لا تنتمي للقسم'
    }
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    validate: {
      validator: function(prereqs) {
        return !prereqs.includes(this._id);
      },
      message: 'المادة لا يمكن أن تكون متطلبة لنفسها'
    }
  }],
  coRequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  assessment: {
    midterm: { type: Number, min: 0, max: 40 },
    final: { type: Number, min: 0, max: 60 },
    practical: { type: Number, min: 0, max: 30 }
  },
  isElective: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
subjectSchema.virtual('schedules', {
  ref: 'Schedule',
  localField: '_id',
  foreignField: 'subject'
});

// Middleware للتحقق من التكاملية
subjectSchema.pre('save', async function(next) {
  // التحقق من أن المادة ليست متطلب سابق لنفسها
  if (this.prerequisites.includes(this._id)) {
    throw new Error('المادة لا يمكن أن تكون متطلبة لنفسها');
  }
  next();
});

// Indexes
subjectSchema.index({ code: 1 }, { unique: true });
subjectSchema.index({ department: 1, name: 1 });

export const Subject = mongoose.model('Subject', subjectSchema);
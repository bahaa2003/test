import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم البرنامج مطلوب'],
    trim: true,
    maxlength: [150, 'لا يمكن أن يتجاوز الاسم 150 حرف']
  },
  code: {
    type: String,
    required: [true, 'كود البرنامج مطلوب'],
    unique: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{2,6}[0-9]{0,2}$/.test(v);
      },
      message: 'كود البرنامج يجب أن يكون 2-6 أحرف لاتينية كبيرة متبوعة بأرقام اختيارية'
    }
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'القسم التابع له البرنامج مطلوب']
  },
  degreeType: {
    type: String,
    enum: ['bachelor', 'master', 'phd', 'diploma'],
    required: true
  },
  durationYears: {
    type: Number,
    required: true,
    min: [1, 'المدة يجب أن تكون سنة على الأقل'],
    max: [6, 'المدة لا يمكن أن تزيد عن 6 سنوات']
  },
  totalCreditHours: {
    type: Number,
    required: true,
    min: [60, 'الساعات المعتمدة يجب أن تكون 60 على الأقل']
  },
  programCoordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  tuitionFee: {
    amount: {
      type: Number,
      min: [0, 'لا يمكن أن يكون المبلغ سالباً']
    },
    currency: {
      type: String,
      default: 'EGP'
    },
    per: {
      type: String,
      enum: ['semester', 'year', 'credit_hour'],
      default: 'semester'
    }
  },
  admissionRequirements: [{
    description: String,
    documents: [String]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for courses
programSchema.virtual('courses', {
  ref: 'Subject',
  localField: '_id',
  foreignField: 'programs'
});

export const Program = mongoose.model('Program', programSchema);
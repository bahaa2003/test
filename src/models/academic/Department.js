import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم القسم مطلوب'],
    trim: true,
    maxlength: [100, 'لا يمكن أن يتجاوز الاسم 100 حرف']
  },
  code: {
    type: String,
    required: [true, 'كود القسم مطلوب'],
    unique: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{2,4}$/.test(v);
      },
      message: 'كود القسم يجب أن يكون 2-4 أحرف لاتينية كبيرة'
    }
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: [true, 'الكلية التابع لها القسم مطلوبة']
  },
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    validate: {
      validator: async function(v) {
        if (!v) return true;
        const faculty = await mongoose.model('Faculty').findById(v);
        return faculty && ['professor', 'associateProfessor'].includes(faculty.designation);
      },
      message: 'رئيس القسم يجب أن يكون بروفيسور أو أستاذ مشارك'
    }
  },
  viceHeads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  }],
  totalYears: {
    type: Number,
    required: true,
    min: [1, 'يجب أن يكون للقسم سنة دراسية واحدة على الأقل'],
    max: [6, 'لا يمكن أن يزيد عدد السنوات عن 6']
  },
  studySystem: {
    type: String,
    enum: ['semester', 'trimester', 'quarter'],
    default: 'semester'
  },
  accreditationInfo: {
    status: {
      type: String,
      enum: ['accredited', 'probation', 'not_accredited'],
      required: true
    },
    expiryDate: Date,
    lastRenewal: Date
  },
  contactInfo: {
    officeNumber: String,
    email: {
      type: String,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'البريد الإلكتروني غير صالح'
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
departmentSchema.index({ code: 1, college: 1 }, { unique: true });


// Virtual for faculty count
departmentSchema.virtual('facultyCount', {
  ref: 'Faculty',
  localField: '_id',
  foreignField: 'department',
  count: true
});

// Virtual for programs
departmentSchema.virtual('programs', {
  ref: 'Program',
  localField: '_id',
  foreignField: 'department'
});

export const Department = mongoose.model('Department', departmentSchema);
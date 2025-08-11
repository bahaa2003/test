import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم السنة الأكاديمية مطلوب'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{4}-[0-9]{4}$/.test(v);
      },
      message: 'الصيغة الصحيحة: YYYY-YYYY (مثال: 2023-2024)'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'تاريخ البداية مطلوب'],
    validate: {
      validator: function(v) {
        return v < this.endDate;
      },
      message: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'تاريخ النهاية مطلوب']
  },
  semesters: [{
    name: {
      type: String,
      enum: ['fall', 'spring', 'summer'],
      required: true
    },
    startDate: Date,
    endDate: Date,
    registrationDeadline: Date,
    withdrawalDeadline: Date,
    isCurrent: {
      type: Boolean,
      default: false
    }
  }],
  isCurrent: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, { timestamps: true });

// Middleware to ensure only one current academic year
academicYearSchema.pre('save', async function(next) {
  if (this.isCurrent) {
    await mongoose.model('AcademicYear').updateMany(
      { _id: { $ne: this._id } },
      { $set: { isCurrent: false } }
    );
  }
  next();
});

// Middleware for semesters
academicYearSchema.pre('save', function(next) {
  this.semesters.forEach(semester => {
    if (semester.startDate >= semester.endDate) {
      throw new Error('تاريخ بداية الفصل يجب أن يكون قبل تاريخ النهاية');
    }
  });
  next();
});

export const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);
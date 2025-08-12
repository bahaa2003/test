import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم الجامعة مطلوب'],
      unique: true,
      trim: true,
      maxlength: [100, 'لا يمكن أن يتجاوز الاسم 100 حرف']
    },
    code: {
      type: String,
      required: [true, 'كود الجامعة مطلوب'],
      unique: true,
      uppercase: true,
      validate: {
        validator: function (v) {
          return (/^[A-Z]{2,4}$/).test(v);
        },
        message: 'كود الجامعة يجب أن يكون 2-4 أحرف لاتينية كبيرة'
      }
    },
    establishedYear: {
      type: Number,
      required: true,
      min: [1900, 'سنة التأسيس يجب أن تكون بعد 1900'],
      max: [new Date().getFullYear(), 'سنة التأسيس لا يمكن أن تكون في المستقبل']
    },
    country: {
      type: String,
      required: [true, 'الدولة مطلوبة'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'المدينة مطلوبة'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'العنوان مطلوب'],
      trim: true
    },
    contact: {
      phone: {
        type: String,
        validate: {
          validator: function (v) {
            return (/^[+]?[0-9\s\-()]+$/).test(v);
          },
          message: 'رقم الهاتف غير صالح'
        }
      },
      email: {
        type: String,
        lowercase: true,
        validate: {
          validator: function (v) {
            return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(v);
          },
          message: 'البريد الإلكتروني غير صالح'
        }
      },
      website: {
        type: String,
        validate: {
          validator: function (v) {
            return (/^(http|https):\/\/[^ "]+$/).test(v);
          },
          message: 'رابط الموقع الإلكتروني غير صالح'
        }
      }
    },
    settings: {
      academicYearStart: {
        type: String,
        default: '09-01', // MM-DD format
        validate: {
          validator: function (v) {
            return (/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).test(v);
          },
          message: 'تاريخ بداية السنة الأكاديمية يجب أن يكون بصيغة MM-DD'
        }
      },
      academicYearEnd: {
        type: String,
        default: '06-30', // MM-DD format
        validate: {
          validator: function (v) {
            return (/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).test(v);
          },
          message: 'تاريخ نهاية السنة الأكاديمية يجب أن يكون بصيغة MM-DD'
        }
      },
      timezone: {
        type: String,
        default: 'Asia/Riyadh'
      },
      language: {
        type: String,
        enum: ['ar', 'en', 'ar-en'],
        default: 'ar'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
);

// Indexes for performance
universitySchema.index({isActive: 1});
universitySchema.index({country: 1, city: 1});

// Virtual for colleges count
universitySchema.virtual('collegesCount', {
  ref: 'College',
  localField: '_id',
  foreignField: 'university',
  count: true
});

// Virtual for colleges list
universitySchema.virtual('colleges', {
  ref: 'College',
  localField: '_id',
  foreignField: 'university'
});

export const University = mongoose.model('University', universitySchema);

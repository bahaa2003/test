import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم الكلية مطلوب'],
      trim: true,
      maxlength: [100, 'لا يمكن أن يتجاوز الاسم 100 حرف']
    },
    code: {
      type: String,
      required: [true, 'كود الكلية مطلوب'],
      uppercase: true,
      validate: {
        validator: function (v) {
          return (/^[A-Z]{3,5}$/).test(v);
        },
        message: 'كود الكلية يجب أن يكون 3-5 أحرف لاتينية كبيرة'
      }
    },
    // Multi-tenant field
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'يجب تحديد الجامعة']
    },
    establishedYear: {
      type: Number,
      required: true,
      min: [1900, 'سنة التأسيس يجب أن تكون بعد 1900'],
      max: [new Date().getFullYear(), 'سنة التأسيس لا يمكن أن تكون في المستقبل']
    },
    dean: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: false,
      default: null,
      validate: {
        validator: async function (v) {
          if (!v || v === '') return true; // Allow null/undefined/empty string dean
          const faculty = await mongoose.model('Faculty').findById(v);
          return faculty && faculty.designation === 'professor';
        },
        message: 'عميد الكلية يجب أن يكون بروفيسور'
      }
    },
    viceDeans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
      }
    ],
    location: {
      building: String,
      floor: Number,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    contact: {
      phone: {
        type: String,
        validate: {
          validator: function (v) {
            return (/^01[0-9]{9}$/).test(v);
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

// Pre-save middleware to convert empty strings to null for ObjectId fields
collegeSchema.pre('save', function(next) {
  if (this.dean === '') {
    this.dean = null;
  }
  next();
});

// Compound unique index for university + code
collegeSchema.index({university: 1, code: 1}, {unique: true});
collegeSchema.index({university: 1});
collegeSchema.index({dean: 1});
collegeSchema.index({isActive: 1});

// Virtual for departments count
collegeSchema.virtual('departmentsCount', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'college',
  count: true
});

// Virtual for departments list
collegeSchema.virtual('departments', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'college'
});

export const College = mongoose.model('College', collegeSchema);

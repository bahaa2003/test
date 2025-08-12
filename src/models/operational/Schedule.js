import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'يجب تحديد المادة الدراسية'],
    validate: {
      validator: async function (subjectId) {
        const subject = await mongoose.model('Subject').findById(subjectId);
        return subject && subject.isActive;
      },
      message: 'المادة غير موجودة أو غير مفعلة'
    }
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'يجب تحديد عضو هيئة التدريس'],
    validate: {
      validator: async function (facultyId) {
        const faculty = await mongoose.model('Faculty').findById(facultyId);
        return faculty && faculty.isActive;
      },
      message: 'عضو هيئة التدريس غير موجود أو غير مفعل'
    }
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'يجب تحديد السنة الأكاديمية']
  },
  semester: {
    type: String,
    enum: ['fall', 'spring', 'summer'],
    required: [true, 'يجب تحديد الفصل الدراسي']
  },
  timeSlots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot'
  }],
  classroom: {
    type: String,
    required: [true, 'يجب تحديد القاعة الدراسية'],
    validate: {
      validator: function (v) {
        return (/^[A-Z]{1,2}-[0-9]{3}$/).test(v);
      },
      message: 'تنسيق القاعة غير صحيح (مثال: A-101 أو AB-202)'
    }
  },
  maxStudents: {
    type: Number,
    required: [true, 'يجب تحديد الحد الأقصى للطلاب'],
    min: [5, 'الحد الأدنى للطلاب هو 5'],
    max: [150, 'الحد الأقصى للطلاب هو 150']
  },
  enrolledStudents: {
    type: Number,
    default: 0,
    validate: {
      validator: function (v) {
        return v <= this.maxStudents;
      },
      message: 'عدد الطلاب المسجلين يتجاوز السعة القصوى'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

// Middleware للتحقق من عدم التعارض
scheduleSchema.pre('save', async function (next) {
  // التحقق من عدم تعارض عضو هيئة التدريس مع جدول آخر
  const conflictingSchedule = await mongoose.model('Schedule').findOne({
    faculty: this.faculty,
    timeSlots: {$in: this.timeSlots},
    _id: {$ne: this._id}
  });

  if (conflictingSchedule) {
    throw new Error('عضو هيئة التدريس لديه حصة أخرى في نفس الوقت');
  }
  next();
});

// Indexes
scheduleSchema.index({subject: 1, academicYear: 1, semester: 1}, {unique: true});
scheduleSchema.index({faculty: 1, academicYear: 1});

export const Schedule = mongoose.model('Schedule', scheduleSchema);

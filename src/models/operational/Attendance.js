import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'يجب تحديد الطالب'],
    validate: {
      validator: async function (studentId) {
        const student = await mongoose.model('Student').findById(studentId);
        return student && student.isActive;
      },
      message: 'الطالب غير موجود أو غير مفعل'
    }
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: [true, 'يجب تحديد الجدول الدراسي'],
    validate: {
      validator: async function (scheduleId) {
        const schedule = await mongoose.model('Schedule').findById(scheduleId);
        return schedule && schedule.isActive;
      },
      message: 'الجدول الدراسي غير موجود أو غير مفعل'
    }
  },
  date: {
    type: Date,
    required: [true, 'يجب تحديد تاريخ الحضور'],
    default: Date.now,
    validate: {
      validator: function (date) {
        // لا يمكن تسجيل حضور لتاريخ في المستقبل
        return date <= new Date();
      },
      message: 'لا يمكن تسجيل حضور لتاريخ مستقبلي'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['present', 'absent', 'late', 'excused'],
      message: 'حالة الحضور غير صالحة'
    },
    default: 'present'
  },
  recordedBy: {
    type: String,
    enum: {
      values: ['nfc', 'faculty', 'admin', 'system'],
      message: 'طريقة التسجيل غير صالحة'
    },
    required: [true, 'يجب تحديد طريقة التسجيل']
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NfcDevice',
    required: function () { return this.recordedBy === 'nfc'; },
    validate: {
      validator: async function (deviceId) {
        const device = await mongoose.model('NfcDevice').findById(deviceId);
        return device && device.isActive;
      },
      message: 'جهاز NFC غير موجود أو غير مفعل'
    }
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: function () {
      return ['faculty', 'admin'].includes(this.recordedBy);
    },
    validate: {
      validator: async function (facultyId) {
        const faculty = await mongoose.model('Faculty').findById(facultyId);
        return faculty && faculty.isActive;
      },
      message: 'عضو هيئة التدريس غير موجود أو غير مفعل'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'لا يمكن أن تتجاوز الملاحظات 500 حرف']
  },
  isManualCorrection: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

// Middleware للتحقق من التكاملية
attendanceSchema.pre('save', async function (next) {
  // التحقق من أن الطالب مسجل في المادة
  const schedule = await mongoose.model('Schedule').findById(this.schedule)
    .populate('subject');

  const isEnrolled = await mongoose.model('Enrollment').exists({
    student: this.student,
    subject: schedule.subject._id
  });

  if (!isEnrolled) {
    throw new Error('الطالب غير مسجل في هذه المادة');
  }

  next();
});

// Virtuals
attendanceSchema.virtual('studentInfo', {
  ref: 'Student',
  localField: 'student',
  foreignField: '_id',
  justOne: true
});

attendanceSchema.virtual('scheduleInfo', {
  ref: 'Schedule',
  localField: 'schedule',
  foreignField: '_id',
  justOne: true
});

// Indexes
attendanceSchema.index({student: 1, schedule: 1, date: 1}, {unique: true});
attendanceSchema.index({date: 1, status: 1});
attendanceSchema.index({schedule: 1, status: 1});

export const Attendance = mongoose.model('Attendance', attendanceSchema);

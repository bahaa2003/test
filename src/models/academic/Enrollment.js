import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'يجب تحديد الطالب']
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'يجب تحديد المادة الدراسية']
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'يجب تحديد السنة الأكاديمية']
    },
    semester: {
      type: String,
      enum: ['first', 'second', 'summer'],
      required: [true, 'يجب تحديد الفصل الدراسي']
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'dropped', 'completed', 'failed'],
      default: 'active'
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'W', 'I'],
      default: null
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    attendancePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    notes: {
      type: String,
      maxlength: [500, 'لا يمكن أن تتجاوز الملاحظات 500 حرف']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
);

// Compound unique index to prevent duplicate enrollments
enrollmentSchema.index(
  {
    student: 1,
    subject: 1,
    academicYear: 1,
    semester: 1
  },
  {unique: true}
);

// Performance indexes
enrollmentSchema.index({student: 1});
enrollmentSchema.index({subject: 1});
enrollmentSchema.index({academicYear: 1});
enrollmentSchema.index({semester: 1});
enrollmentSchema.index({status: 1});
enrollmentSchema.index({isActive: 1});

// Virtual for student info
enrollmentSchema.virtual('studentInfo', {
  ref: 'Student',
  localField: 'student',
  foreignField: '_id',
  justOne: true
});

// Virtual for subject info
enrollmentSchema.virtual('subjectInfo', {
  ref: 'Subject',
  localField: 'subject',
  foreignField: '_id',
  justOne: true
});

// Virtual for academic year info
enrollmentSchema.virtual('academicYearInfo', {
  ref: 'AcademicYear',
  localField: 'academicYear',
  foreignField: '_id',
  justOne: true
});

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

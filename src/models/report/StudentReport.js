import mongoose from 'mongoose';

const studentReportSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'الطالب مطلوب'],
    index: true
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true
  },
  semester: {
    type: String,
    enum: ['fall', 'spring', 'summer'],
    required: true
  },
  attendanceDetails: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    totalSessions: Number,
    attended: Number,
    absent: Number,
    late: Number,
    attendanceRate: Number,
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty'
    }
  }],
  overallStats: {
    totalSessions: Number,
    attendanceRate: Number,
    ranking: {
      college: Number,
      department: Number
    },
    improvementFromLastSemester: Number
  },
  warnings: [{
    type: {
      type: String,
      enum: ['low_attendance', 'frequent_late', 'other']
    },
    date: Date,
    message: String,
    resolved: Boolean
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
studentReportSchema.index({ student: 1, academicYear: 1, semester: 1 }, { unique: true });
studentReportSchema.index({ 'attendanceDetails.subject': 1 });

// Virtual for student status
studentReportSchema.virtual('status').get(function() {
  if (this.overallStats.attendanceRate >= 90) return 'ممتاز';
  if (this.overallStats.attendanceRate >= 75) return 'جيد جداً';
  if (this.overallStats.attendanceRate >= 60) return 'مقبول';
  return 'تحت الإنذار';
});

// Middleware to update lastUpdated
studentReportSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export const StudentReport = mongoose.model('StudentReport', studentReportSchema);
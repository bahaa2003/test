import mongoose from 'mongoose';

const semesterReportSchema = new mongoose.Schema({
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'السنة الأكاديمية مطلوبة']
  },
  semester: {
    type: String,
    enum: {
      values: ['fall', 'spring', 'summer'],
      message: 'الفصل الدراسي غير صالح'
    },
    required: [true, 'الفصل الدراسي مطلوب']
  },
  attendanceSummary: {
    totalLectures: Number,
    averageAttendance: Number,
    bestDay: {
      date: Date,
      rate: Number
    },
    worstDay: {
      date: Date,
      rate: Number
    }
  },
  collegePerformance: [{
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College'
    },
    averageRate: Number,
    improvementFromLastSemester: Number,
    topDepartment: {
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
      },
      rate: Number
    }
  }],
  studentStats: {
    total: Number,
    excellentAttendance: {
      count: Number,
      percentage: Number,
      threshold: {type: Number, default: 90}
    },
    warningList: {
      count: Number,
      percentage: Number,
      threshold: {type: Number, default: 60}
    }
  },
  facultyStats: [{
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty'
    },
    coursesTaught: Number,
    averageAttendance: Number,
    punctuality: Number
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

// Indexes
semesterReportSchema.index({academicYear: 1, semester: 1}, {unique: true});
semesterReportSchema.index({'collegePerformance.college': 1});

// Virtual for semester title
semesterReportSchema.virtual('title').get(function () {
  const semesterNames = {
    fall: 'الفصل الأول',
    spring: 'الفصل الثاني',
    summer: 'الفصل الصيفي'
  };
  return `${semesterNames[this.semester]} - ${this.academicYear.name}`;
});

export const SemesterReport = mongoose.model('SemesterReport', semesterReportSchema);

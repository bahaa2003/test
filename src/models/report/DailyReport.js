import mongoose from 'mongoose';

const dailyReportSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'تاريخ التقرير مطلوب'],
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'لا يمكن إنشاء تقرير لتاريخ مستقبلي'
    }
  },
  overallStats: {
    totalStudents: {
      type: Number,
      required: true,
      min: 0
    },
    present: {
      type: Number,
      required: true,
      min: 0
    },
    absent: {
      type: Number,
      required: true,
      min: 0
    },
    late: {
      type: Number,
      required: true,
      min: 0
    },
    attendanceRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  collegeStats: [{
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true
    },
    present: Number,
    absent: Number,
    late: Number,
    attendanceRate: Number,
    departments: [{
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
      },
      present: Number,
      absent: Number,
      attendanceRate: Number
    }]
  }],
  deviceUsage: {
    nfcScans: {
      type: Number,
      default: 0
    },
    manualEntries: {
      type: Number,
      default: 0
    },
    mostActiveDevice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NfcDevice'
    }
  },
  anomalies: [{
    description: String,
    type: {
      type: String,
      enum: ['data_mismatch', 'unusual_absence', 'device_failure']
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster querying
dailyReportSchema.index({ date: 1 });
dailyReportSchema.index({ 'collegeStats.college': 1 });
dailyReportSchema.index({ 'collegeStats.departments.department': 1 });

// Virtual for formatted date
dailyReportSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

export const DailyReport = mongoose.model('DailyReport', dailyReportSchema);
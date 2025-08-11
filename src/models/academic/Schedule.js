// models/academic/Schedule.js
import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function() {
      return this.college.hasDepartments;
    }
  },
  yearNumber: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: function(value) {
        const college = this.parent().college;
        const department = this.parent().department;
        
        if (department) {
          return value <= department.totalYears;
        }
        return value <= college.totalYears;
      },
      message: 'رقم السنة الدراسية غير صالح لهذه الكلية/القسم'
    }
  },
  semester: {
    type: String,
    enum: ['first', 'second', 'summer'],
    required: true
  },
  scheduleType: {
    type: String,
    enum: ['regular', 'makeup', 'exam', 'other'],
    default: 'regular'
  },
  courses: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    sections: [{
      sectionNumber: String,
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
      },
      schedule: [{
        day: {
          type: String,
          enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
          required: true
        },
        startTime: {
          type: String,
          required: true
        },
        endTime: {
          type: String,
          required: true
        },
        location: {
          type: String,
          required: true
        },
        nfcDevice: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'NfcDevice'
        }
      }],
      maxCapacity: Number,
      currentEnrollment: {
        type: Number,
        default: 0
      }
    }]
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  publishedAt: Date
}, { timestamps: true });

// Indexes for better performance
scheduleSchema.index({ academicYear: 1, yearNumber: 1, semester: 1 }, { unique: true });

export const Schedule = mongoose.model('Schedule', scheduleSchema);
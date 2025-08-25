// models/academic/Section.js
import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم الشعبة مطلوب']
    },
    code: {
      type: String,
      required: [true, 'كود الشعبة مطلوب'],
      unique: true,
      trim: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'المادة المرتبطة مطلوبة']
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: false // Allow creating sections without faculty initially
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],
    schedules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule'
      }
    ],
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College'
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to convert empty strings to null for ObjectId fields
sectionSchema.pre('save', function(next) {
  if (this.faculty === '') {
    this.faculty = null;
  }
  if (this.college === '') {
    this.college = null;
  }
  if (this.department === '') {
    this.department = null;
  }
  next();
});

// فهرسة على الكود عشان يكون فريد
sectionSchema.index({ code: 1 }, { unique: true, background: true });

export const Section = mongoose.model('Section', sectionSchema);

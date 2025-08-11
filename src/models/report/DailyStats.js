// models/report/DailyStats.js
import mongoose from 'mongoose';

const dailyStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    default: Date.now
  },
  totalStudents: Number,
  presentStudents: Number,
  absentStudents: Number,
  nfcScans: Number,
  manualEntries: Number,
  colleges: [{
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    attendanceRate: Number
  }]
}, { timestamps: true });

export const DailyStats = mongoose.model('DailyStats', dailyStatsSchema);
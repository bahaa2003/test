import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  day: {
    type: String,
    enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    required: [true, 'يجب تحديد اليوم']
  },
  startTime: {
    type: String,
    required: [true, 'يجب تحديد وقت البداية'],
    validate: {
      validator: v => (/^(0[8-9]|1[0-9]|2[0-1]):[0-5][0-9]$/).test(v),
      message: 'وقت البداية يجب أن يكون بين 08:00 و21:00'
    }
  },
  endTime: {
    type: String,
    required: [true, 'يجب تحديد وقت النهاية'],
    validate: {
      validator: function (v) {
        if (!this.startTime) { return true; }
        const start = parseInt(this.startTime.replace(':', ''));
        const end = parseInt(v.replace(':', ''));
        return end > start && (end - start) <= 300; // لا تزيد عن 3 ساعات
      },
      message: 'وقت النهاية يجب أن يكون بعد البداية ولا يتجاوز 3 ساعات'
    }
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial'],
    default: 'lecture'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware لمنع التعارض في القاعات
timeSlotSchema.pre('save', async function (next) {
  const conflict = await mongoose.model('TimeSlot').findOne({
    _id: {$ne: this._id},
    day: this.day,
    classroom: this.schedule.classroom,
    $or: [
      {
        startTime: {$lt: this.endTime},
        endTime: {$gt: this.startTime}
      }
    ]
  })
    .populate('schedule');

  if (conflict) {
    throw new Error(`تعارض في القاعة مع مادة ${conflict.schedule.subject.name}`);
  }
  next();
});

// Indexes
timeSlotSchema.index({
  schedule: 1,
  day: 1,
  startTime: 1,
  endTime: 1
}, {unique: true});

export const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

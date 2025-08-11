import { Attendance } from '../../models/operational/Attendance.js';
import { Schedule } from '../../models/academic/Schedule.js';
import { Subject } from '../../models/academic/Subject.js';
import { Student } from '../../models/user/Student.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';
import reportService from '../../services/reportService.js';

/**
 * @desc    الحصول على تقرير الحضور للأستاذ
 * @route   GET /api/v1/reports/faculty/attendance
 * @access  private (faculty)
 */
export const getFacultyAttendanceReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, subjectId, scheduleId } = req.query;
  const facultyId = req.user._id;

  const filterQuery = {
    facultyId,
    type: 'faculty'
  };

  if (startDate && endDate) {
    filterQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  if (scheduleId) {
    filterQuery.scheduleId = scheduleId;
  }

  // إحصائيات الحضور
  const attendanceStats = await Attendance.aggregate([
    { $match: filterQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalDays = attendanceStats.reduce((sum, stat) => sum + stat.count, 0);
  const presentDays = attendanceStats.find(s => s._id === 'present')?.count || 0;
  const absentDays = attendanceStats.find(s => s._id === 'absent')?.count || 0;
  const lateDays = attendanceStats.find(s => s._id === 'late')?.count || 0;

  // تفاصيل الحضور
  const attendanceDetails = await Attendance.find(filterQuery)
    .populate('scheduleId', 'subjectId dayOfWeek startTime endTime')
    .populate('scheduleId.subjectId', 'name code')
    .sort('-date')
    .limit(50);

  const report = {
    summary: {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendanceRate: totalDays > 0 ? ((presentDays + lateDays) / totalDays * 100).toFixed(2) : 0
    },
    details: attendanceDetails
  };

  res.status(200).json({
    status: 'success',
    data: { report }
  });
});

/**
 * @desc    الحصول على تقرير المواد الدراسية للأستاذ
 * @route   GET /api/v1/reports/faculty/subjects
 * @access  private (faculty)
 */
export const getFacultySubjectsReport = catchAsync(async (req, res, next) => {
  const facultyId = req.user._id;

  const subjectsData = await Schedule.aggregate([
    { $match: { facultyId, isActive: true } },
    {
      $lookup: {
        from: 'subjects',
        localField: 'subjectId',
        foreignField: '_id',
        as: 'subject'
      }
    },
    { $unwind: '$subject' },
    {
      $lookup: {
        from: 'departments',
        localField: 'subject.departmentId',
        foreignField: '_id',
        as: 'department'
      }
    },
    { $unwind: '$department' },
    {
      $project: {
        subjectName: '$subject.name',
        subjectCode: '$subject.code',
        departmentName: '$department.name',
        dayOfWeek: 1,
        startTime: 1,
        endTime: 1,
        room: 1,
        isActive: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: subjectsData.length,
    data: { subjectsData }
  });
});

/**
 * @desc    الحصول على تقرير حضور الطلاب لمادة معينة
 * @route   GET /api/v1/reports/faculty/subject/:subjectId/students
 * @access  private (faculty)
 */
export const getSubjectStudentsReport = catchAsync(async (req, res, next) => {
  const { subjectId } = req.params;
  const { startDate, endDate } = req.query;
  const facultyId = req.user._id;

  // التحقق من أن الأستاذ يدرس هذه المادة
  const schedule = await Schedule.findOne({
    subjectId,
    facultyId,
    isActive: true
  });

  if (!schedule) {
    return next(new AppError('غير مصرح لك بالوصول لهذه المادة', 403));
  }

  const filterQuery = {
    scheduleId: schedule._id,
    type: 'student'
  };

  if (startDate && endDate) {
    filterQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // إحصائيات حضور الطلاب
  const studentsAttendance = await Attendance.aggregate([
    { $match: filterQuery },
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    {
      $group: {
        _id: '$studentId',
        studentName: { $first: '$student.name' },
        studentId: { $first: '$student.studentId' },
        totalSessions: { $sum: 1 },
        presentSessions: {
          $sum: {
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
          }
        },
        absentSessions: {
          $sum: {
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
          }
        },
        lateSessions: {
          $sum: {
            $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        attendanceRate: {
          $multiply: [
            {
              $divide: [
                { $add: ['$presentSessions', '$lateSessions'] },
                '$totalSessions'
              ]
            },
            100
          ]
        }
      }
    },
    { $sort: { attendanceRate: -1 } }
  ]);

  res.status(200).json({
    status: 'success',
    results: studentsAttendance.length,
    data: { studentsAttendance }
  });
});

/**
 * @desc    الحصول على تقرير يومي للأستاذ
 * @route   GET /api/v1/reports/faculty/daily
 * @access  private (faculty)
 */
export const getFacultyDailyReport = catchAsync(async (req, res, next) => {
  const { date } = req.query;
  const facultyId = req.user._id;

  const reportDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(reportDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(reportDate);
  endOfDay.setHours(23, 59, 59, 999);

  // الجداول الدراسية لهذا اليوم
  const dayOfWeek = reportDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const schedules = await Schedule.find({
    facultyId,
    dayOfWeek,
    isActive: true
  }).populate('subjectId', 'name code');

  // سجلات الحضور لهذا اليوم
  const attendanceRecords = await Attendance.find({
    facultyId,
    date: { $gte: startOfDay, $lte: endOfDay },
    type: 'faculty'
  }).populate('scheduleId', 'subjectId');

  // إحصائيات الحضور
  const attendanceStats = await Attendance.aggregate([
    {
      $match: {
        facultyId,
        date: { $gte: startOfDay, $lte: endOfDay },
        type: 'faculty'
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalSessions = attendanceStats.reduce((sum, stat) => sum + stat.count, 0);
  const presentSessions = attendanceStats.find(s => s._id === 'present')?.count || 0;
  const absentSessions = attendanceStats.find(s => s._id === 'absent')?.count || 0;
  const lateSessions = attendanceStats.find(s => s._id === 'late')?.count || 0;

  const dailyReport = {
    date: reportDate,
    schedules,
    attendanceRecords,
    summary: {
      totalSessions,
      presentSessions,
      absentSessions,
      lateSessions,
      attendanceRate: totalSessions > 0 ? ((presentSessions + lateSessions) / totalSessions * 100).toFixed(2) : 0
    }
  };

  res.status(200).json({
    status: 'success',
    data: { dailyReport }
  });
});

/**
 * @desc    الحصول على تقرير شهري للأستاذ
 * @route   GET /api/v1/reports/faculty/monthly
 * @access  private (faculty)
 */
export const getFacultyMonthlyReport = catchAsync(async (req, res, next) => {
  const { year, month } = req.query;
  const facultyId = req.user._id;

  const startDate = new Date(year || new Date().getFullYear(), month ? month - 1 : new Date().getMonth(), 1);
  const endDate = new Date(year || new Date().getFullYear(), month ? month : new Date().getMonth() + 1, 0);

  // إحصائيات الحضور الشهرية
  const monthlyStats = await Attendance.aggregate([
    {
      $match: {
        facultyId,
        date: { $gte: startDate, $lte: endDate },
        type: 'faculty'
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // إحصائيات المواد
  const subjectsStats = await Attendance.aggregate([
    {
      $match: {
        facultyId,
        date: { $gte: startDate, $lte: endDate },
        type: 'faculty'
      }
    },
    {
      $lookup: {
        from: 'schedules',
        localField: 'scheduleId',
        foreignField: '_id',
        as: 'schedule'
      }
    },
    { $unwind: '$schedule' },
    {
      $lookup: {
        from: 'subjects',
        localField: 'schedule.subjectId',
        foreignField: '_id',
        as: 'subject'
      }
    },
    { $unwind: '$subject' },
    {
      $group: {
        _id: '$subject._id',
        subjectName: { $first: '$subject.name' },
        subjectCode: { $first: '$subject.code' },
        totalSessions: { $sum: 1 },
        presentSessions: {
          $sum: {
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
          }
        },
        absentSessions: {
          $sum: {
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
          }
        },
        lateSessions: {
          $sum: {
            $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        attendanceRate: {
          $multiply: [
            {
              $divide: [
                { $add: ['$presentSessions', '$lateSessions'] },
                '$totalSessions'
              ]
            },
            100
          ]
        }
      }
    }
  ]);

  const monthlyReport = {
    period: { startDate, endDate },
    dailyStats: monthlyStats,
    subjectsStats
  };

  res.status(200).json({
    status: 'success',
    data: { monthlyReport }
  });
});

import {Attendance} from '../../models/operational/Attendance.js';
import {Schedule} from '../../models/academic/Schedule.js';
import {Subject} from '../../models/academic/Subject.js';
import {Student} from '../../models/user/Student.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import reportService from '../../services/reportService.js';

/**
 * @desc    الحصول على تقرير الحضور للطالب
 * @route   GET /api/v1/reports/student/attendance
 * @access  private (student)
 */
export const getStudentAttendanceReport = catchAsync(async (req, res, next) => {
  const {startDate, endDate, subjectId, studentId: requestedStudentId} = req.query;
  
  // Students can only access their own data
  let studentId = req.user._id;
  if (req.user.role === 'student' && requestedStudentId && !req.user._id.equals(requestedStudentId)) {
    return next(new AppError('غير مصرح لك بالوصول لبيانات طالب آخر', 403));
  }
  
  // Admin and faculty can access any student's data
  if ((req.user.role === 'admin' || req.user.role === 'faculty') && requestedStudentId) {
    studentId = requestedStudentId;
  }

  const filterQuery = {
    studentId,
    type: 'student'
  };

  if (startDate && endDate) {
    filterQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  if (subjectId) {
    // البحث عن الجداول التي تحتوي على هذه المادة
    const schedules = await Schedule.find({subjectId, isActive: true});
    const scheduleIds = schedules.map(s => s._id);
    filterQuery.scheduleId = {$in: scheduleIds};
  }

  // إحصائيات الحضور
  const attendanceStats = await Attendance.aggregate([
    {$match: filterQuery},
    {
      $group: {
        _id: '$status',
        count: {$sum: 1}
      }
    }
  ]);

  const totalSessions = attendanceStats.reduce((sum, stat) => sum + stat.count, 0);
  const presentSessions = attendanceStats.find(s => s._id === 'present')?.count || 0;
  const absentSessions = attendanceStats.find(s => s._id === 'absent')?.count || 0;
  const lateSessions = attendanceStats.find(s => s._id === 'late')?.count || 0;

  // تفاصيل الحضور
  const attendanceDetails = await Attendance.find(filterQuery)
    .populate('scheduleId', 'subjectId dayOfWeek startTime endTime')
    .populate('scheduleId.subjectId', 'name code')
    .sort('-date')
    .limit(50);

  const report = {
    summary: {
      totalSessions,
      presentSessions,
      absentSessions,
      lateSessions,
      attendanceRate: totalSessions > 0 ? ((presentSessions + lateSessions) / totalSessions * 100).toFixed(2) : 0
    },
    details: attendanceDetails
  };

  res.status(200).json({
    status: 'success',
    data: {report}
  });
});

/**
 * @desc    الحصول على تقرير المواد الدراسية للطالب
 * @route   GET /api/v1/reports/student/subjects
 * @access  private (student)
 */
export const getStudentSubjectsReport = catchAsync(async (req, res, next) => {
  const {studentId: requestedStudentId} = req.query;
  
  // Students can only access their own data
  let studentId = req.user._id;
  if (req.user.role === 'student' && requestedStudentId && !req.user._id.equals(requestedStudentId)) {
    return next(new AppError('غير مصرح لك بالوصول لبيانات طالب آخر', 403));
  }
  
  // Admin and faculty can access any student's data
  if ((req.user.role === 'admin' || req.user.role === 'faculty') && requestedStudentId) {
    studentId = requestedStudentId;
  }

  // الحصول على المواد المسجل فيها الطالب
  const subjectsData = await Attendance.aggregate([
    {$match: {studentId, type: 'student'}},
    {
      $lookup: {
        from: 'schedules',
        localField: 'scheduleId',
        foreignField: '_id',
        as: 'schedule'
      }
    },
    {$unwind: '$schedule'},
    {
      $lookup: {
        from: 'subjects',
        localField: 'schedule.subjectId',
        foreignField: '_id',
        as: 'subject'
      }
    },
    {$unwind: '$subject'},
    {
      $lookup: {
        from: 'faculties',
        localField: 'schedule.facultyId',
        foreignField: '_id',
        as: 'faculty'
      }
    },
    {$unwind: '$faculty'},
    {
      $group: {
        _id: '$subject._id',
        subjectName: {$first: '$subject.name'},
        subjectCode: {$first: '$subject.code'},
        facultyName: {$first: '$faculty.name'},
        totalSessions: {$sum: 1},
        presentSessions: {
          $sum: {
            $cond: [{$eq: ['$status', 'present']}, 1, 0]
          }
        },
        absentSessions: {
          $sum: {
            $cond: [{$eq: ['$status', 'absent']}, 1, 0]
          }
        },
        lateSessions: {
          $sum: {
            $cond: [{$eq: ['$status', 'late']}, 1, 0]
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
                {$add: ['$presentSessions', '$lateSessions']},
                '$totalSessions'
              ]
            },
            100
          ]
        }
      }
    },
    {$sort: {subjectName: 1}}
  ]);

  res.status(200).json({
    status: 'success',
    results: subjectsData.length,
    data: {subjectsData}
  });
});

/**
 * @desc    الحصول على تقرير مادة معينة للطالب
 * @route   GET /api/v1/reports/student/subject/:subjectId
 * @access  private (student)
 */
export const getStudentSubjectReport = catchAsync(async (req, res, next) => {
  const {subjectId} = req.params;
  const {startDate, endDate, studentId: requestedStudentId} = req.query;
  
  // Students can only access their own data
  let studentId = req.user._id;
  if (req.user.role === 'student' && requestedStudentId && !req.user._id.equals(requestedStudentId)) {
    return next(new AppError('غير مصرح لك بالوصول لبيانات طالب آخر', 403));
  }
  
  // Admin and faculty can access any student's data
  if ((req.user.role === 'admin' || req.user.role === 'faculty') && requestedStudentId) {
    studentId = requestedStudentId;
  }

  // البحث عن الجداول التي تحتوي على هذه المادة
  const schedules = await Schedule.find({subjectId, isActive: true});
  const scheduleIds = schedules.map(s => s._id);

  const filterQuery = {
    studentId,
    scheduleId: {$in: scheduleIds},
    type: 'student'
  };

  if (startDate && endDate) {
    filterQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // تفاصيل الحضور للمادة
  const attendanceDetails = await Attendance.find(filterQuery)
    .populate('scheduleId', 'dayOfWeek startTime endTime facultyId')
    .populate('scheduleId.facultyId', 'name')
    .sort('date');

  // إحصائيات الحضور
  const attendanceStats = await Attendance.aggregate([
    {$match: filterQuery},
    {
      $group: {
        _id: '$status',
        count: {$sum: 1}
      }
    }
  ]);

  const totalSessions = attendanceStats.reduce((sum, stat) => sum + stat.count, 0);
  const presentSessions = attendanceStats.find(s => s._id === 'present')?.count || 0;
  const absentSessions = attendanceStats.find(s => s._id === 'absent')?.count || 0;
  const lateSessions = attendanceStats.find(s => s._id === 'late')?.count || 0;

  // معلومات المادة
  const subject = await Subject.findById(subjectId);

  const subjectReport = {
    subject: {
      name: subject.name,
      code: subject.code,
      credits: subject.credits
    },
    summary: {
      totalSessions,
      presentSessions,
      absentSessions,
      lateSessions,
      attendanceRate: totalSessions > 0 ? ((presentSessions + lateSessions) / totalSessions * 100).toFixed(2) : 0
    },
    details: attendanceDetails
  };

  res.status(200).json({
    status: 'success',
    data: {subjectReport}
  });
});

/**
 * @desc    الحصول على تقرير يومي للطالب
 * @route   GET /api/v1/reports/student/daily
 * @access  private (student)
 */
export const getStudentDailyReport = catchAsync(async (req, res, next) => {
  const {date, studentId: requestedStudentId} = req.query;
  
  // Students can only access their own data
  let studentId = req.user._id;
  if (req.user.role === 'student' && requestedStudentId && !req.user._id.equals(requestedStudentId)) {
    return next(new AppError('غير مصرح لك بالوصول لبيانات طالب آخر', 403));
  }
  
  // Admin and faculty can access any student's data
  if ((req.user.role === 'admin' || req.user.role === 'faculty') && requestedStudentId) {
    studentId = requestedStudentId;
  }

  const reportDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(reportDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(reportDate);
  endOfDay.setHours(23, 59, 59, 999);

  // سجلات الحضور لهذا اليوم
  const attendanceRecords = await Attendance.find({
    studentId,
    date: {$gte: startOfDay, $lte: endOfDay},
    type: 'student'
  })
    .populate('scheduleId', 'subjectId dayOfWeek startTime endTime facultyId')
    .populate('scheduleId.subjectId', 'name code')
    .populate('scheduleId.facultyId', 'name');

  // إحصائيات الحضور
  const attendanceStats = await Attendance.aggregate([
    {
      $match: {
        studentId,
        date: {$gte: startOfDay, $lte: endOfDay},
        type: 'student'
      }
    },
    {
      $group: {
        _id: '$status',
        count: {$sum: 1}
      }
    }
  ]);

  const totalSessions = attendanceStats.reduce((sum, stat) => sum + stat.count, 0);
  const presentSessions = attendanceStats.find(s => s._id === 'present')?.count || 0;
  const absentSessions = attendanceStats.find(s => s._id === 'absent')?.count || 0;
  const lateSessions = attendanceStats.find(s => s._id === 'late')?.count || 0;

  const dailyReport = {
    date: reportDate,
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
    data: {dailyReport}
  });
});

/**
 * @desc    الحصول على تقرير شهري للطالب
 * @route   GET /api/v1/reports/student/monthly
 * @access  private (student)
 */
export const getStudentMonthlyReport = catchAsync(async (req, res, next) => {
  const {year, month, studentId: requestedStudentId} = req.query;
  
  // Students can only access their own data
  let studentId = req.user._id;
  if (req.user.role === 'student' && requestedStudentId && !req.user._id.equals(requestedStudentId)) {
    return next(new AppError('غير مصرح لك بالوصول لبيانات طالب آخر', 403));
  }
  
  // Admin and faculty can access any student's data
  if ((req.user.role === 'admin' || req.user.role === 'faculty') && requestedStudentId) {
    studentId = requestedStudentId;
  }

  const startDate = new Date(year || new Date().getFullYear(), month ? month - 1 : new Date().getMonth(), 1);
  const endDate = new Date(year || new Date().getFullYear(), month ? month : new Date().getMonth() + 1, 0);

  // إحصائيات الحضور الشهرية
  const monthlyStats = await Attendance.aggregate([
    {
      $match: {
        studentId,
        date: {$gte: startDate, $lte: endDate},
        type: 'student'
      }
    },
    {
      $group: {
        _id: {
          date: {$dateToString: {format: '%Y-%m-%d', date: '$date'}},
          status: '$status'
        },
        count: {$sum: 1}
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
        total: {$sum: '$count'}
      }
    },
    {$sort: {_id: 1}}
  ]);

  // إحصائيات المواد
  const subjectsStats = await Attendance.aggregate([
    {
      $match: {
        studentId,
        date: {$gte: startDate, $lte: endDate},
        type: 'student'
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
    {$unwind: '$schedule'},
    {
      $lookup: {
        from: 'subjects',
        localField: 'schedule.subjectId',
        foreignField: '_id',
        as: 'subject'
      }
    },
    {$unwind: '$subject'},
    {
      $group: {
        _id: '$subject._id',
        subjectName: {$first: '$subject.name'},
        subjectCode: {$first: '$subject.code'},
        totalSessions: {$sum: 1},
        presentSessions: {
          $sum: {
            $cond: [{$eq: ['$status', 'present']}, 1, 0]
          }
        },
        absentSessions: {
          $sum: {
            $cond: [{$eq: ['$status', 'absent']}, 1, 0]
          }
        },
        lateSessions: {
          $sum: {
            $cond: [{$eq: ['$status', 'late']}, 1, 0]
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
                {$add: ['$presentSessions', '$lateSessions']},
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
    period: {startDate, endDate},
    dailyStats: monthlyStats,
    subjectsStats
  };

  res.status(200).json({
    status: 'success',
    data: {monthlyReport}
  });
});

/**
 * @desc    الحصول على إحصائيات عامة للطالب
 * @route   GET /api/v1/reports/student/overview
 * @access  private (student)
 */
export const getStudentOverview = catchAsync(async (req, res, next) => {
  const {studentId: requestedStudentId} = req.query;
  
  // Students can only access their own data
  let studentId = req.user._id;
  if (req.user.role === 'student' && requestedStudentId && !req.user._id.equals(requestedStudentId)) {
    return next(new AppError('غير مصرح لك بالوصول لبيانات طالب آخر', 403));
  }
  
  // Admin and faculty can access any student's data
  if ((req.user.role === 'admin' || req.user.role === 'faculty') && requestedStudentId) {
    studentId = requestedStudentId;
  }

  // إحصائيات الحضور العامة
  const overallStats = await Attendance.aggregate([
    {$match: {studentId, type: 'student'}},
    {
      $group: {
        _id: '$status',
        count: {$sum: 1}
      }
    }
  ]);

  const totalSessions = overallStats.reduce((sum, stat) => sum + stat.count, 0);
  const presentSessions = overallStats.find(s => s._id === 'present')?.count || 0;
  const absentSessions = overallStats.find(s => s._id === 'absent')?.count || 0;
  const lateSessions = overallStats.find(s => s._id === 'late')?.count || 0;

  // عدد المواد المسجل فيها
  const subjectsCount = await Attendance.aggregate([
    {$match: {studentId, type: 'student'}},
    {
      $lookup: {
        from: 'schedules',
        localField: 'scheduleId',
        foreignField: '_id',
        as: 'schedule'
      }
    },
    {$unwind: '$schedule'},
    {
      $group: {
        _id: '$schedule.subjectId'
      }
    },
    {
      $count: 'total'
    }
  ]);

  const overview = {
    attendance: {
      totalSessions,
      presentSessions,
      absentSessions,
      lateSessions,
      attendanceRate: totalSessions > 0 ? ((presentSessions + lateSessions) / totalSessions * 100).toFixed(2) : 0
    },
    subjects: {
      total: subjectsCount[0]?.total || 0
    }
  };

  res.status(200).json({
    status: 'success',
    data: {overview}
  });
});

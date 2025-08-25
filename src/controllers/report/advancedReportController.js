import mongoose from 'mongoose';
import {Attendance} from '../../models/operational/Attendance.js';
import {Schedule} from '../../models/academic/Schedule.js';
import {Subject} from '../../models/academic/Subject.js';
import {Student} from '../../models/user/Student.js';
import {Faculty} from '../../models/user/Faculty.js';
import {Section} from '../../models/academic/Section.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';

/**
 * @desc    تقرير نسبة الحضور لكل طالب
 * @route   GET /api/v1/reports/admin/student-attendance-percentage
 * @access  private (admin, system_admin)
 */
export const getStudentAttendancePercentageReport = catchAsync(async (req, res, next) => {
  const {startDate, endDate, departmentId, sectionId} = req.query;

  const matchQuery = {
    type: 'student'
  };

  if (startDate && endDate) {
    matchQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Build aggregation pipeline
  const pipeline = [
    {$match: matchQuery},
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    {$unwind: '$student'},
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
        from: 'sections',
        localField: 'schedule.sectionId',
        foreignField: '_id',
        as: 'section'
      }
    },
    {$unwind: '$section'}
  ];

  // Add filters if provided
  if (departmentId) {
    pipeline.push({
      $match: {'section.department': new mongoose.Types.ObjectId(departmentId)}
    });
  }

  if (sectionId) {
    pipeline.push({
      $match: {'schedule.sectionId': new mongoose.Types.ObjectId(sectionId)}
    });
  }

  // Group by student
  pipeline.push(
    {
      $group: {
        _id: '$studentId',
        studentName: {$first: '$student.name'},
        studentId: {$first: '$student.studentId'},
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
    {$sort: {attendanceRate: -1}}
  );

  const studentAttendanceData = await Attendance.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    results: studentAttendanceData.length,
    data: {studentAttendanceData}
  });
});

/**
 * @desc    تقرير المواد ذات أعلى معدل غياب
 * @route   GET /api/v1/reports/admin/highest-absence-subjects
 * @access  private (admin, system_admin)
 */
export const getHighestAbsenceSubjectsReport = catchAsync(async (req, res, next) => {
  const {startDate, endDate, limit = 10} = req.query;

  const matchQuery = {
    type: 'student'
  };

  if (startDate && endDate) {
    matchQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const subjectsAbsenceData = await Attendance.aggregate([
    {$match: matchQuery},
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
        absentSessions: {
          $sum: {
            $cond: [{$eq: ['$status', 'absent']}, 1, 0]
          }
        },
        presentSessions: {
          $sum: {
            $cond: [{$eq: ['$status', 'present']}, 1, 0]
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
        absenceRate: {
          $multiply: [
            {
              $divide: ['$absentSessions', '$totalSessions']
            },
            100
          ]
        },
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
    {$sort: {absenceRate: -1}},
    {$limit: parseInt(limit)}
  ]);

  res.status(200).json({
    status: 'success',
    results: subjectsAbsenceData.length,
    data: {subjectsAbsenceData}
  });
});

/**
 * @desc    تقرير حضور أعضاء هيئة التدريس حسب القسم
 * @route   GET /api/v1/reports/admin/faculty-attendance-by-section
 * @access  private (admin, system_admin, faculty)
 */
export const getFacultyAttendanceBySectionReport = catchAsync(async (req, res, next) => {
  const {startDate, endDate, facultyId, sectionId} = req.query;

  // Faculty can only view their own data
  let targetFacultyId = facultyId;
  if (req.user.role === 'faculty') {
    targetFacultyId = req.user._id;
  }

  const matchQuery = {
    type: 'student'
  };

  if (startDate && endDate) {
    matchQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const pipeline = [
    {$match: matchQuery},
    {
      $lookup: {
        from: 'schedules',
        localField: 'scheduleId',
        foreignField: '_id',
        as: 'schedule'
      }
    },
    {$unwind: '$schedule'}
  ];

  // Filter by faculty if specified
  if (targetFacultyId) {
    pipeline.push({
      $match: {'schedule.facultyId': new mongoose.Types.ObjectId(targetFacultyId)}
    });
  }

  // Filter by section if specified
  if (sectionId) {
    pipeline.push({
      $match: {'schedule.sectionId': new mongoose.Types.ObjectId(sectionId)}
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: 'sections',
        localField: 'schedule.sectionId',
        foreignField: '_id',
        as: 'section'
      }
    },
    {$unwind: '$section'},
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
        _id: {
          facultyId: '$schedule.facultyId',
          sectionId: '$schedule.sectionId'
        },
        facultyName: {$first: '$faculty.name'},
        sectionName: {$first: '$section.name'},
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
    },
    {$sort: {facultyName: 1, sectionName: 1}}
  );

  const facultySectionData = await Attendance.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    results: facultySectionData.length,
    data: {facultySectionData}
  });
});

/**
 * @desc    تقرير مقارنة الحضور بين الأقسام
 * @route   GET /api/v1/reports/admin/department-attendance-comparison
 * @access  private (admin, system_admin)
 */
export const getDepartmentAttendanceComparisonReport = catchAsync(async (req, res, next) => {
  const {startDate, endDate} = req.query;

  const matchQuery = {
    type: 'student'
  };

  if (startDate && endDate) {
    matchQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const departmentComparisonData = await Attendance.aggregate([
    {$match: matchQuery},
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
        from: 'sections',
        localField: 'schedule.sectionId',
        foreignField: '_id',
        as: 'section'
      }
    },
    {$unwind: '$section'},
    {
      $lookup: {
        from: 'departments',
        localField: 'section.department',
        foreignField: '_id',
        as: 'department'
      }
    },
    {$unwind: '$department'},
    {
      $group: {
        _id: '$department._id',
        departmentName: {$first: '$department.name'},
        departmentCode: {$first: '$department.code'},
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
        },
        uniqueStudents: {$addToSet: '$studentId'}
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
        },
        totalStudents: {$size: '$uniqueStudents'}
      }
    },
    {
      $project: {
        uniqueStudents: 0
      }
    },
    {$sort: {attendanceRate: -1}}
  ]);

  res.status(200).json({
    status: 'success',
    results: departmentComparisonData.length,
    data: {departmentComparisonData}
  });
});

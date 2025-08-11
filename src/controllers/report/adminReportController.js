import { Attendance } from '../../models/operational/Attendance.js';
import { Student } from '../../models/user/Student.js';
import { Faculty } from '../../models/user/Faculty.js';
import { Subject } from '../../models/academic/Subject.js';
import { Schedule } from '../../models/academic/Schedule.js';
import { College } from '../../models/academic/College.js';
import { Department } from '../../models/academic/Department.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';
import reportService from '../../services/reportService.js';

/**
 * @desc    الحصول على التقرير العام للنظام
 * @route   GET /api/v1/reports/admin/overview
 * @access  private (admin)
 */
export const getSystemOverview = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const filterQuery = {};
  if (startDate && endDate) {
    filterQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // إحصائيات المستخدمين
  const [totalStudents, activeStudents, totalFaculty, activeFaculty] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ isActive: true }),
    Faculty.countDocuments(),
    Faculty.countDocuments({ isActive: true })
  ]);

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

  const totalAttendance = attendanceStats.reduce((sum, stat) => sum + stat.count, 0);
  const presentCount = attendanceStats.find(s => s._id === 'present')?.count || 0;
  const absentCount = attendanceStats.find(s => s._id === 'absent')?.count || 0;
  const lateCount = attendanceStats.find(s => s._id === 'late')?.count || 0;

  // إحصائيات أكاديمية
  const [totalColleges, totalDepartments, totalSubjects, totalSchedules] = await Promise.all([
    College.countDocuments(),
    Department.countDocuments(),
    Subject.countDocuments(),
    Schedule.countDocuments()
  ]);

  const overview = {
    users: {
      students: { total: totalStudents, active: activeStudents },
      faculty: { total: totalFaculty, active: activeFaculty }
    },
    attendance: {
      total: totalAttendance,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      rate: totalAttendance > 0 ? ((presentCount + lateCount) / totalAttendance * 100).toFixed(2) : 0
    },
    academic: {
      colleges: totalColleges,
      departments: totalDepartments,
      subjects: totalSubjects,
      schedules: totalSchedules
    }
  };

  res.status(200).json({
    status: 'success',
    data: { overview }
  });
});

/**
 * @desc    الحصول على تقرير الحضور العام
 * @route   GET /api/v1/reports/admin/attendance
 * @access  private (admin)
 */
export const getAttendanceReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, collegeId, departmentId, subjectId } = req.query;

  const filterQuery = {};
  if (startDate && endDate) {
    filterQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // بناء pipeline للتجميع
  const pipeline = [
    { $match: filterQuery },
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
      $lookup: {
        from: 'departments',
        localField: 'subject.departmentId',
        foreignField: '_id',
        as: 'department'
      }
    },
    { $unwind: '$department' }
  ];

  // إضافة فلاتر إضافية
  if (collegeId) {
    pipeline.push({
      $match: { 'department.collegeId': collegeId }
    });
  }

  if (departmentId) {
    pipeline.push({
      $match: { 'department._id': departmentId }
    });
  }

  if (subjectId) {
    pipeline.push({
      $match: { 'subject._id': subjectId }
    });
  }

  // إضافة تجميع النتائج
  pipeline.push({
    $group: {
      _id: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        status: '$status',
        subject: '$subject.name',
        department: '$department.name'
      },
      count: { $sum: 1 }
    }
  });

  const attendanceData = await Attendance.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    results: attendanceData.length,
    data: { attendanceData }
  });
});

/**
 * @desc    الحصول على تقرير الكليات
 * @route   GET /api/v1/reports/admin/colleges
 * @access  private (admin)
 */
export const getCollegesReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const filterQuery = {};
  if (startDate && endDate) {
    filterQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const collegesData = await College.aggregate([
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: 'collegeId',
        as: 'departments'
      }
    },
    {
      $lookup: {
        from: 'faculties',
        localField: '_id',
        foreignField: 'collegeId',
        as: 'faculty'
      }
    },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'collegeId',
        as: 'students'
      }
    },
    {
      $project: {
        name: 1,
        code: 1,
        isActive: 1,
        departmentsCount: { $size: '$departments' },
        facultyCount: { $size: '$faculty' },
        studentsCount: { $size: '$students' },
        activeFacultyCount: {
          $size: {
            $filter: {
              input: '$faculty',
              as: 'f',
              cond: { $eq: ['$$f.isActive', true] }
            }
          }
        },
        activeStudentsCount: {
          $size: {
            $filter: {
              input: '$students',
              as: 's',
              cond: { $eq: ['$$s.isActive', true] }
            }
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: collegesData.length,
    data: { collegesData }
  });
});

/**
 * @desc    الحصول على تقرير الأقسام
 * @route   GET /api/v1/reports/admin/departments
 * @access  private (admin)
 */
export const getDepartmentsReport = catchAsync(async (req, res, next) => {
  const { collegeId } = req.query;

  const filterQuery = {};
  if (collegeId) {
    filterQuery.collegeId = collegeId;
  }

  const departmentsData = await Department.aggregate([
    { $match: filterQuery },
    {
      $lookup: {
        from: 'colleges',
        localField: 'collegeId',
        foreignField: '_id',
        as: 'college'
      }
    },
    { $unwind: '$college' },
    {
      $lookup: {
        from: 'faculties',
        localField: '_id',
        foreignField: 'departmentId',
        as: 'faculty'
      }
    },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'departmentId',
        as: 'students'
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: 'departmentId',
        as: 'subjects'
      }
    },
    {
      $project: {
        name: 1,
        code: 1,
        college: { name: '$college.name', code: '$college.code' },
        isActive: 1,
        facultyCount: { $size: '$faculty' },
        studentsCount: { $size: '$students' },
        subjectsCount: { $size: '$subjects' },
        activeFacultyCount: {
          $size: {
            $filter: {
              input: '$faculty',
              as: 'f',
              cond: { $eq: ['$$f.isActive', true] }
            }
          }
        },
        activeStudentsCount: {
          $size: {
            $filter: {
              input: '$students',
              as: 's',
              cond: { $eq: ['$$s.isActive', true] }
            }
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: departmentsData.length,
    data: { departmentsData }
  });
});

/**
 * @desc    الحصول على تقرير المواد الدراسية
 * @route   GET /api/v1/reports/admin/subjects
 * @access  private (admin)
 */
export const getSubjectsReport = catchAsync(async (req, res, next) => {
  const { departmentId, isActive } = req.query;

  const filterQuery = {};
  if (departmentId) filterQuery.departmentId = departmentId;
  if (isActive !== undefined) filterQuery.isActive = isActive === 'true';

  const subjectsData = await Subject.aggregate([
    { $match: filterQuery },
    {
      $lookup: {
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department'
      }
    },
    { $unwind: '$department' },
    {
      $lookup: {
        from: 'schedules',
        localField: '_id',
        foreignField: 'subjectId',
        as: 'schedules'
      }
    },
    {
      $project: {
        name: 1,
        code: 1,
        credits: 1,
        department: { name: '$department.name', code: '$department.code' },
        isActive: 1,
        schedulesCount: { $size: '$schedules' },
        activeSchedulesCount: {
          $size: {
            $filter: {
              input: '$schedules',
              as: 's',
              cond: { $eq: ['$$s.isActive', true] }
            }
          }
        }
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
 * @desc    تصدير التقرير إلى PDF
 * @route   GET /api/v1/reports/admin/export/pdf
 * @access  private (admin)
 */
export const exportReportToPdf = catchAsync(async (req, res, next) => {
  const { reportType, startDate, endDate } = req.query;

  if (!reportType) {
    return next(new AppError('نوع التقرير مطلوب', 400));
  }

  let reportData;
  let reportTitle;

  switch (reportType) {
    case 'overview':
      reportData = await reportService.generateSystemOverview(startDate, endDate);
      reportTitle = 'التقرير العام للنظام';
      break;
    case 'attendance':
      reportData = await reportService.generateAttendanceReport(startDate, endDate);
      reportTitle = 'تقرير الحضور';
      break;
    case 'colleges':
      reportData = await reportService.generateCollegesReport();
      reportTitle = 'تقرير الكليات';
      break;
    default:
      return next(new AppError('نوع التقرير غير مدعوم', 400));
  }

  // هنا سيتم إنشاء ملف PDF
  // const pdfBuffer = await generatePdf(reportTitle, reportData);

  res.status(200).json({
    status: 'success',
    message: 'تم إنشاء التقرير بنجاح',
    data: { reportData }
  });
});

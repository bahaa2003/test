import { Attendance } from '../models/operational/Attendance.js';
import { Student } from '../models/user/Student.js';
import { Subject } from '../models/academic/Subject.js';
import { Faculty } from '../models/user/Faculty.js';
import { DailyReport } from '../models/report/DailyReport.js';
import { SemesterReport } from '../models/report/SemesterReport.js';
import { StudentReport } from '../models/report/StudentReport.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';
import moment from 'moment-timezone';

/**
 * خدمة إدارة التقارير
 */
class ReportService {
  /**
   * إنشاء تقرير يومي
   */
  async generateDailyReport(date = new Date()) {
    try {
      const startOfDay = moment(date).startOf('day');
      const endOfDay = moment(date).endOf('day');

      // الحصول على إحصائيات الحضور لهذا اليوم
      const attendanceStats = await Attendance.aggregate([
        {
          $match: {
            date: {
              $gte: startOfDay.toDate(),
              $lte: endOfDay.toDate()
            }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // الحصول على إحصائيات حسب المادة
      const subjectStats = await Attendance.aggregate([
        {
          $match: {
            date: {
              $gte: startOfDay.toDate(),
              $lte: endOfDay.toDate()
            }
          }
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subject'
          }
        },
        {
          $unwind: '$subject'
        },
        {
          $group: {
            _id: '$subjectId',
            subjectName: { $first: '$subject.name' },
            totalStudents: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
            },
            late: {
              $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
            }
          }
        }
      ]);

      // إنشاء أو تحديث التقرير اليومي
      const reportData = {
        date: startOfDay.toDate(),
        totalAttendance: attendanceStats.reduce((sum, stat) => sum + stat.count, 0),
        attendanceStats,
        subjectStats,
        generatedAt: new Date()
      };

      const dailyReport = await DailyReport.findOneAndUpdate(
        { date: startOfDay.toDate() },
        reportData,
        { new: true, upsert: true }
      );

      logger.info(`Daily report generated for ${startOfDay.format('YYYY-MM-DD')}`);
      return dailyReport;
    } catch (error) {
      logger.error('Error generating daily report:', error);
      throw new AppError('فشل في إنشاء التقرير اليومي', 500);
    }
  }

  /**
   * إنشاء تقرير فصل دراسي
   */
  async generateSemesterReport(semesterId, academicYear) {
    try {
      const startDate = moment(academicYear).startOf('year');
      const endDate = moment(academicYear).endOf('year');

      // الحصول على إحصائيات الفصل الدراسي
      const semesterStats = await Attendance.aggregate([
        {
          $match: {
            date: {
              $gte: startDate.toDate(),
              $lte: endDate.toDate()
            }
          }
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subject'
          }
        },
        {
          $unwind: '$subject'
        },
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student'
          }
        },
        {
          $unwind: '$student'
        },
        {
          $group: {
            _id: {
              subjectId: '$subjectId',
              subjectName: '$subject.name',
              studentId: '$studentId',
              studentName: '$student.name'
            },
            totalSessions: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
            },
            late: {
              $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
            }
          }
        },
        {
          $group: {
            _id: '$_id.subjectId',
            subjectName: { $first: '$_id.subjectName' },
            students: {
              $push: {
                studentId: '$_id.studentId',
                studentName: '$_id.studentName',
                totalSessions: '$totalSessions',
                present: '$present',
                absent: '$absent',
                late: '$late',
                attendanceRate: {
                  $multiply: [
                    { $divide: ['$present', '$totalSessions'] },
                    100
                  ]
                }
              }
            }
          }
        }
      ]);

      const reportData = {
        semesterId,
        academicYear,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        subjectStats: semesterStats,
        generatedAt: new Date()
      };

      const semesterReport = await SemesterReport.findOneAndUpdate(
        { semesterId, academicYear },
        reportData,
        { new: true, upsert: true }
      );

      logger.info(`Semester report generated for semester ${semesterId}, year ${academicYear}`);
      return semesterReport;
    } catch (error) {
      logger.error('Error generating semester report:', error);
      throw new AppError('فشل في إنشاء تقرير الفصل الدراسي', 500);
    }
  }

  /**
   * إنشاء تقرير طالب
   */
  async generateStudentReport(studentId, startDate, endDate) {
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new AppError('الطالب غير موجود', 404);
      }

      const attendanceData = await Attendance.aggregate([
        {
          $match: {
            studentId: student._id,
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subject'
          }
        },
        {
          $unwind: '$subject'
        },
        {
          $group: {
            _id: '$subjectId',
            subjectName: { $first: '$subject.name' },
            totalSessions: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
            },
            late: {
              $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            attendanceRate: {
              $multiply: [
                { $divide: ['$present', '$totalSessions'] },
                100
              ]
            }
          }
        }
      ]);

      const reportData = {
        studentId: student._id,
        studentName: student.name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        subjects: attendanceData,
        totalSubjects: attendanceData.length,
        overallAttendanceRate: attendanceData.length > 0
          ? attendanceData.reduce((sum, subject) => sum + subject.attendanceRate, 0) / attendanceData.length
          : 0,
        generatedAt: new Date()
      };

      const studentReport = await StudentReport.findOneAndUpdate(
        {
          studentId: student._id,
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        },
        reportData,
        { new: true, upsert: true }
      );

      logger.info(`Student report generated for ${student.name} (${studentId})`);
      return studentReport;
    } catch (error) {
      logger.error('Error generating student report:', error);
      throw error;
    }
  }

  /**
   * الحصول على تقرير مدرس
   */
  async generateFacultyReport(facultyId, startDate, endDate) {
    try {
      const faculty = await Faculty.findById(facultyId);
      if (!faculty) {
        throw new AppError('المدرس غير موجود', 404);
      }

      // الحصول على المواد التي يدرسها المدرس
      const subjects = await Subject.find({ facultyId: faculty._id });
      const subjectIds = subjects.map(subject => subject._id);

      const attendanceData = await Attendance.aggregate([
        {
          $match: {
            subjectId: { $in: subjectIds },
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subject'
          }
        },
        {
          $unwind: '$subject'
        },
        {
          $group: {
            _id: '$subjectId',
            subjectName: { $first: '$subject.name' },
            totalSessions: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
            },
            late: {
              $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            attendanceRate: {
              $multiply: [
                { $divide: ['$present', '$totalSessions'] },
                100
              ]
            }
          }
        }
      ]);

      return {
        facultyId: faculty._id,
        facultyName: faculty.name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        subjects: attendanceData,
        totalSubjects: subjects.length,
        overallAttendanceRate: attendanceData.length > 0
          ? attendanceData.reduce((sum, subject) => sum + subject.attendanceRate, 0) / attendanceData.length
          : 0,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error generating faculty report:', error);
      throw error;
    }
  }
}

export default new ReportService();

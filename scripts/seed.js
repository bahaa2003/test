#!/usr/bin/env node

/**
 * سكريبت لملء قاعدة البيانات ببيانات تجريبية للتطوير
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// إعداد المسارات
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحميل متغيرات البيئة
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// استيراد النماذج
import { Admin, Faculty, Student } from '../src/models/user/index.js';
import { College, Department, Program, Subject } from '../src/models/academic/index.js';
import { TimeSlot } from '../src/models/operational/TimeSlot.js';

/**
 * الاتصال بقاعدة البيانات
 */
async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system';
    await mongoose.connect(uri);
    console.log('✅ Connected to database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * إنشاء مستخدمي الإدارة
 */
async function seedAdmins() {
  try {
    const adminData = [
      {
        name: 'مدير النظام',
        email: 'admin@university.edu',
        password: await bcrypt.hash('Admin123!', 12),
        role: 'admin',
        phone: '+966501234567',
        isActive: true
      },
      {
        name: 'مدير الأكاديمية',
        email: 'academic@university.edu',
        password: await bcrypt.hash('Academic123!', 12),
        role: 'admin',
        phone: '+966501234568',
        isActive: true
      }
    ];

    await Admin.deleteMany({});
    const admins = await Admin.create(adminData);
    console.log(`✅ Created ${admins.length} admin users`);
    return admins;
  } catch (error) {
    console.error('❌ Error seeding admins:', error);
    throw error;
  }
}

/**
 * إنشاء الكليات
 */
async function seedColleges() {
  try {
    const collegeData = [
      {
        name: 'كلية الهندسة',
        code: 'ENG',
        description: 'كلية الهندسة والتكنولوجيا',
        isActive: true
      },
      {
        name: 'كلية العلوم',
        code: 'SCI',
        description: 'كلية العلوم الطبيعية',
        isActive: true
      },
      {
        name: 'كلية إدارة الأعمال',
        code: 'BUS',
        description: 'كلية إدارة الأعمال والاقتصاد',
        isActive: true
      },
      {
        name: 'كلية الآداب',
        code: 'ARTS',
        description: 'كلية الآداب والعلوم الإنسانية',
        isActive: true
      }
    ];

    await College.deleteMany({});
    const colleges = await College.create(collegeData);
    console.log(`✅ Created ${colleges.length} colleges`);
    return colleges;
  } catch (error) {
    console.error('❌ Error seeding colleges:', error);
    throw error;
  }
}

/**
 * إنشاء الأقسام
 */
async function seedDepartments(colleges) {
  try {
    const departmentData = [
      // كلية الهندسة
      {
        name: 'قسم الهندسة الكهربائية',
        code: 'EE',
        collegeId: colleges[0]._id,
        description: 'قسم الهندسة الكهربائية والحاسوب',
        isActive: true
      },
      {
        name: 'قسم الهندسة الميكانيكية',
        code: 'ME',
        collegeId: colleges[0]._id,
        description: 'قسم الهندسة الميكانيكية والصناعية',
        isActive: true
      },
      // كلية العلوم
      {
        name: 'قسم الرياضيات',
        code: 'MATH',
        collegeId: colleges[1]._id,
        description: 'قسم الرياضيات والإحصاء',
        isActive: true
      },
      {
        name: 'قسم الفيزياء',
        code: 'PHY',
        collegeId: colleges[1]._id,
        description: 'قسم الفيزياء والكيمياء',
        isActive: true
      },
      // كلية إدارة الأعمال
      {
        name: 'قسم إدارة الأعمال',
        code: 'MGT',
        collegeId: colleges[2]._id,
        description: 'قسم إدارة الأعمال والتسويق',
        isActive: true
      },
      {
        name: 'قسم المحاسبة',
        code: 'ACC',
        collegeId: colleges[2]._id,
        description: 'قسم المحاسبة والمالية',
        isActive: true
      }
    ];

    await Department.deleteMany({});
    const departments = await Department.create(departmentData);
    console.log(`✅ Created ${departments.length} departments`);
    return departments;
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
    throw error;
  }
}

/**
 * إنشاء البرامج الأكاديمية
 */
async function seedPrograms(departments) {
  try {
    const programData = [
      {
        name: 'بكالوريوس الهندسة الكهربائية',
        code: 'BSEE',
        departmentId: departments[0]._id,
        duration: 4,
        credits: 132,
        isActive: true
      },
      {
        name: 'بكالوريوس الهندسة الميكانيكية',
        code: 'BSME',
        departmentId: departments[1]._id,
        duration: 4,
        credits: 132,
        isActive: true
      },
      {
        name: 'بكالوريوس الرياضيات',
        code: 'BSMATH',
        departmentId: departments[2]._id,
        duration: 4,
        credits: 120,
        isActive: true
      },
      {
        name: 'بكالوريوس إدارة الأعمال',
        code: 'BSBA',
        departmentId: departments[4]._id,
        duration: 4,
        credits: 120,
        isActive: true
      }
    ];

    await Program.deleteMany({});
    const programs = await Program.create(programData);
    console.log(`✅ Created ${programs.length} programs`);
    return programs;
  } catch (error) {
    console.error('❌ Error seeding programs:', error);
    throw error;
  }
}

/**
 * إنشاء المدرسين
 */
async function seedFaculty(departments) {
  try {
    const facultyData = [
      {
        name: 'د. أحمد محمد',
        email: 'ahmed.mohamed@university.edu',
        password: await bcrypt.hash('Faculty123!', 12),
        role: 'faculty',
        phone: '+966501234569',
        departmentId: departments[0]._id,
        specialization: 'الهندسة الكهربائية',
        isActive: true
      },
      {
        name: 'د. فاطمة علي',
        email: 'fatima.ali@university.edu',
        password: await bcrypt.hash('Faculty123!', 12),
        role: 'faculty',
        phone: '+966501234570',
        departmentId: departments[1]._id,
        specialization: 'الهندسة الميكانيكية',
        isActive: true
      },
      {
        name: 'د. محمد حسن',
        email: 'mohamed.hassan@university.edu',
        password: await bcrypt.hash('Faculty123!', 12),
        role: 'faculty',
        phone: '+966501234571',
        departmentId: departments[2]._id,
        specialization: 'الرياضيات',
        isActive: true
      },
      {
        name: 'د. سارة أحمد',
        email: 'sara.ahmed@university.edu',
        password: await bcrypt.hash('Faculty123!', 12),
        role: 'faculty',
        phone: '+966501234572',
        departmentId: departments[4]._id,
        specialization: 'إدارة الأعمال',
        isActive: true
      }
    ];

    await Faculty.deleteMany({});
    const faculty = await Faculty.create(facultyData);
    console.log(`✅ Created ${faculty.length} faculty members`);
    return faculty;
  } catch (error) {
    console.error('❌ Error seeding faculty:', error);
    throw error;
  }
}

/**
 * إنشاء المواد الدراسية
 */
async function seedSubjects(faculty, departments) {
  try {
    const subjectData = [
      {
        name: 'مقدمة في الهندسة الكهربائية',
        code: 'EE101',
        departmentId: departments[0]._id,
        facultyId: faculty[0]._id,
        credits: 3,
        description: 'مقدمة في أساسيات الهندسة الكهربائية',
        isActive: true
      },
      {
        name: 'الدوائر الكهربائية',
        code: 'EE201',
        departmentId: departments[0]._id,
        facultyId: faculty[0]._id,
        credits: 4,
        description: 'تحليل الدوائر الكهربائية',
        isActive: true
      },
      {
        name: 'مقدمة في الهندسة الميكانيكية',
        code: 'ME101',
        departmentId: departments[1]._id,
        facultyId: faculty[1]._id,
        credits: 3,
        description: 'مقدمة في أساسيات الهندسة الميكانيكية',
        isActive: true
      },
      {
        name: 'الرياضيات التطبيقية',
        code: 'MATH201',
        departmentId: departments[2]._id,
        facultyId: faculty[2]._id,
        credits: 3,
        description: 'الرياضيات التطبيقية في العلوم',
        isActive: true
      },
      {
        name: 'مبادئ الإدارة',
        code: 'MGT101',
        departmentId: departments[4]._id,
        facultyId: faculty[3]._id,
        credits: 3,
        description: 'مبادئ وأساسيات الإدارة',
        isActive: true
      }
    ];

    await Subject.deleteMany({});
    const subjects = await Subject.create(subjectData);
    console.log(`✅ Created ${subjects.length} subjects`);
    return subjects;
  } catch (error) {
    console.error('❌ Error seeding subjects:', error);
    throw error;
  }
}

/**
 * إنشاء الطلاب
 */
async function seedStudents(programs) {
  try {
    const studentData = [
      {
        name: 'علي أحمد',
        email: 'ali.ahmed@student.university.edu',
        password: await bcrypt.hash('Student123!', 12),
        role: 'student',
        phone: '+966501234573',
        studentId: '2021001',
        programId: programs[0]._id,
        year: 2,
        isActive: true
      },
      {
        name: 'مريم محمد',
        email: 'mariam.mohamed@student.university.edu',
        password: await bcrypt.hash('Student123!', 12),
        role: 'student',
        phone: '+966501234574',
        studentId: '2021002',
        programId: programs[0]._id,
        year: 3,
        isActive: true
      },
      {
        name: 'خالد حسن',
        email: 'khalid.hassan@student.university.edu',
        password: await bcrypt.hash('Student123!', 12),
        role: 'student',
        phone: '+966501234575',
        studentId: '2021003',
        programId: programs[1]._id,
        year: 2,
        isActive: true
      },
      {
        name: 'نورا علي',
        email: 'nora.ali@student.university.edu',
        password: await bcrypt.hash('Student123!', 12),
        role: 'student',
        phone: '+966501234576',
        studentId: '2021004',
        programId: programs[2]._id,
        year: 1,
        isActive: true
      },
      {
        name: 'عبدالله محمد',
        email: 'abdullah.mohamed@student.university.edu',
        password: await bcrypt.hash('Student123!', 12),
        role: 'student',
        phone: '+966501234577',
        studentId: '2021005',
        programId: programs[3]._id,
        year: 2,
        isActive: true
      }
    ];

    await Student.deleteMany({});
    const students = await Student.create(studentData);
    console.log(`✅ Created ${students.length} students`);
    return students;
  } catch (error) {
    console.error('❌ Error seeding students:', error);
    throw error;
  }
}

/**
 * إنشاء الفترات الزمنية
 */
async function seedTimeSlots() {
  try {
    const timeSlotData = [
      {
        name: 'الفترة الأولى',
        startTime: '08:00',
        endTime: '09:30',
        description: 'الفترة الصباحية الأولى',
        isActive: true
      },
      {
        name: 'الفترة الثانية',
        startTime: '09:45',
        endTime: '11:15',
        description: 'الفترة الصباحية الثانية',
        isActive: true
      },
      {
        name: 'الفترة الثالثة',
        startTime: '11:30',
        endTime: '13:00',
        description: 'الفترة الصباحية الثالثة',
        isActive: true
      },
      {
        name: 'الفترة الرابعة',
        startTime: '14:00',
        endTime: '15:30',
        description: 'الفترة المسائية الأولى',
        isActive: true
      },
      {
        name: 'الفترة الخامسة',
        startTime: '15:45',
        endTime: '17:15',
        description: 'الفترة المسائية الثانية',
        isActive: true
      }
    ];

    await TimeSlot.deleteMany({});
    const timeSlots = await TimeSlot.create(timeSlotData);
    console.log(`✅ Created ${timeSlots.length} time slots`);
    return timeSlots;
  } catch (error) {
    console.error('❌ Error seeding time slots:', error);
    throw error;
  }
}

/**
 * تشغيل عملية البذر
 */
async function runSeed() {
  try {
    console.log('🌱 Starting database seeding...');

    await connectDB();

    // إنشاء البيانات بالترتيب
    const admins = await seedAdmins();
    const colleges = await seedColleges();
    const departments = await seedDepartments(colleges);
    const programs = await seedPrograms(departments);
    const faculty = await seedFaculty(departments);
    const subjects = await seedSubjects(faculty, departments);
    const students = await seedStudents(programs);
    const timeSlots = await seedTimeSlots();

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${admins.length} admin users`);
    console.log(`   • ${colleges.length} colleges`);
    console.log(`   • ${departments.length} departments`);
    console.log(`   • ${programs.length} programs`);
    console.log(`   • ${faculty.length} faculty members`);
    console.log(`   • ${subjects.length} subjects`);
    console.log(`   • ${students.length} students`);
    console.log(`   • ${timeSlots.length} time slots`);

    console.log('\n🔑 Default login credentials:');
    console.log('   Admin: admin@university.edu / Admin123!');
    console.log('   Faculty: ahmed.mohamed@university.edu / Faculty123!');
    console.log('   Student: ali.ahmed@student.university.edu / Student123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
  }
}

// تشغيل السكريبت إذا تم استدعاؤه مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { SystemAdmin } from '../src/models/user/SystemAdmin.js';
import { Admin } from '../src/models/user/Admin.js';
import { Faculty } from '../src/models/user/Faculty.js';
import { Student } from '../src/models/user/Student.js';
import { University } from '../src/models/academic/University.js';
import { College } from '../src/models/academic/College.js';
import { Department } from '../src/models/academic/Department.js';
import { createUserSchemaForSetup } from '../src/middlewares/validations/authValidation.js';

const createTestAccounts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system');
    console.log('Connected to MongoDB');

    // Create test university
    const university = await University.findOneAndUpdate(
      { code: 'TEST_UNI' },
      {
        name: 'Test University',
        code: 'TEST_UNI',
        establishedYear: 2020,
        country: 'Saudi Arabia',
        city: 'Riyadh',
        address: '123 Test Street, Riyadh',
        contact: {
          phone: '+966123456789',
          email: 'info@testuni.edu.sa',
          website: 'https://testuni.edu.sa'
        },
        settings: {
          academicYearStart: '09-01',
          academicYearEnd: '06-30',
          timezone: 'Asia/Riyadh',
          language: 'ar'
        }
      },
      { upsert: true, new: true }
    );

    // Create test college
    const college = await College.findOneAndUpdate(
      { code: 'TEST_COL' },
      {
        name: 'Test College of Engineering',
        code: 'TEST_COL',
        university: university._id,
        establishedYear: 2021,
        dean: null // Will be set after creating faculty
      },
      { upsert: true, new: true }
    );

    // Create test department
    const department = await Department.findOneAndUpdate(
      { code: 'CS' },
      {
        name: 'Computer Science',
        code: 'CS',
        college: college._id,
        totalYears: 4,
        accreditationInfo: {
          status: 'accredited'
        }
      },
      { upsert: true, new: true }
    );

    // Create System Admin (using setup validation schema)
    const systemAdminData = {
      name: 'System Administrator',
      email: 'system@testuni.edu.sa',
      password: 'SystemAdmin123!',
      role: 'system_admin'
    };
    
    // Validate using setup schema (allows system_admin role)
    const { error } = createUserSchemaForSetup.validate(systemAdminData);
    if (error) {
      throw new Error(`System Admin validation failed: ${error.details[0].message}`);
    }
    
    const systemAdminPassword = await bcrypt.hash(systemAdminData.password, 12);
    await SystemAdmin.findOneAndUpdate(
      { email: 'system@testuni.edu.sa' },
      {
        name: systemAdminData.name,
        email: systemAdminData.email,
        password: systemAdminPassword,
        role: systemAdminData.role
      },
      { upsert: true }
    );

    // Create Admin
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    await Admin.findOneAndUpdate(
      { email: 'admin@testuni.edu.sa' },
      {
        name: 'College Administrator',
        email: 'admin@testuni.edu.sa',
        password: adminPassword,
        contactNumber: '01234567890',
        role: 'admin',
        university: university._id,
        college: college._id,
        employeeId: 'ADM001'
      },
      { upsert: true }
    );

    // Create Faculty
    const facultyPassword = await bcrypt.hash('Faculty123!', 12);
    const faculty = await Faculty.findOneAndUpdate(
      { email: 'faculty@testuni.edu.sa' },
      {
        name: 'Dr. Ahmed Mohammed',
        email: 'faculty@testuni.edu.sa',
        password: facultyPassword,
        contactNumber: '01234567891',
        role: 'faculty',
        university: university._id,
        college: college._id,
        department: department._id,
        academicId: 'FAC001',
        designation: 'professor',
        specialization: ['Computer Science', 'Artificial Intelligence']
      },
      { upsert: true, new: true }
    );

    // Update college dean
    await College.findByIdAndUpdate(college._id, { dean: faculty._id });

    // Create Student
    const studentPassword = await bcrypt.hash('Student123!', 12);
    await Student.findOneAndUpdate(
      { email: 'student@testuni.edu.sa' },
      {
        name: 'Omar Ali Hassan',
        email: 'student@testuni.edu.sa',
        password: studentPassword,
        role: 'student',
        university: university._id,
        college: college._id,
        department: department._id,
        academicId: 'STU001',
        academicYear: '2024-2025'
      },
      { upsert: true }
    );

    console.log('✅ Test accounts created successfully!');
    console.log('\n📋 Test Account Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 System Admin:');
    console.log('   Email: system@testuni.edu.sa');
    console.log('   Password: SystemAdmin123!');
    console.log('   Role: system_admin (Full system access)');
    console.log('');
    console.log('👨‍💼 Admin:');
    console.log('   Email: admin@testuni.edu.sa');
    console.log('   Password: Admin123!');
    console.log('   Role: admin (College-level access)');
    console.log('');
    console.log('👨‍🏫 Faculty:');
    console.log('   Email: faculty@testuni.edu.sa');
    console.log('   Password: Faculty123!');
    console.log('   Role: faculty (Department-level access)');
    console.log('');
    console.log('🎓 Student:');
    console.log('   Email: student@testuni.edu.sa');
    console.log('   Password: Student123!');
    console.log('   Role: student (Limited access)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestAccounts();
}

export default createTestAccounts;

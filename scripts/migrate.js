#!/usr/bin/env node

/**
 * سكريبت لترحيل قاعدة البيانات
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';

// إعداد المسارات
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحميل متغيرات البيئة
dotenv.config({path: path.join(__dirname, '..', '.env')});

/**
 * الاتصال بقاعدة البيانات
 */
async function connectDB () {
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
 * ترحيل 1: إضافة حقل isActive للمستخدمين
 */
async function migration1_AddIsActiveToUsers () {
  try {
    console.log('🔄 Running migration 1: Add isActive field to users...');

    const db = mongoose.connection.db;

    // تحديث المستخدمين في مجموعة admins
    const adminResult = await db.collection('admins').updateMany(
      {isActive: {$exists: false}},
      {$set: {isActive: true}}
    );

    // تحديث المستخدمين في مجموعة faculties
    const facultyResult = await db.collection('faculties').updateMany(
      {isActive: {$exists: false}},
      {$set: {isActive: true}}
    );

    // تحديث المستخدمين في مجموعة students
    const studentResult = await db.collection('students').updateMany(
      {isActive: {$exists: false}},
      {$set: {isActive: true}}
    );

    console.log(`✅ Migration 1 completed: ${adminResult.modifiedCount} admins, ${facultyResult.modifiedCount} faculty, ${studentResult.modifiedCount} students updated`);
  } catch (error) {
    console.error('❌ Migration 1 failed:', error);
    throw error;
  }
}

/**
 * ترحيل 2: إضافة فهارس لقاعدة البيانات
 */
async function migration2_AddDatabaseIndexes () {
  try {
    console.log('🔄 Running migration 2: Add database indexes...');

    const db = mongoose.connection.db;

    // فهارس للمستخدمين
    await db.collection('admins').createIndex({email: 1}, {unique: true});
    await db.collection('faculties').createIndex({email: 1}, {unique: true});
    await db.collection('students').createIndex({email: 1}, {unique: true});
    await db.collection('students').createIndex({studentId: 1}, {unique: true});

    // فهارس للكليات والأقسام
    await db.collection('colleges').createIndex({code: 1}, {unique: true});
    await db.collection('departments').createIndex({code: 1});
    await db.collection('departments').createIndex({collegeId: 1});

    // فهارس للمواد الدراسية
    await db.collection('subjects').createIndex({code: 1}, {unique: true});
    await db.collection('subjects').createIndex({departmentId: 1});
    await db.collection('subjects').createIndex({facultyId: 1});

    // فهارس للحضور
    await db.collection('attendances').createIndex({studentId: 1, subjectId: 1, date: 1});
    await db.collection('attendances').createIndex({date: 1});
    await db.collection('attendances').createIndex({status: 1});

    console.log('✅ Migration 2 completed: Database indexes added');
  } catch (error) {
    console.error('❌ Migration 2 failed:', error);
    throw error;
  }
}

/**
 * ترحيل 3: تحديث هيكل البيانات الأكاديمية
 */
async function migration3_UpdateAcademicStructure () {
  try {
    console.log('🔄 Running migration 3: Update academic structure...');

    const db = mongoose.connection.db;

    // إضافة حقل isActive للكليات
    await db.collection('colleges').updateMany(
      {isActive: {$exists: false}},
      {$set: {isActive: true}}
    );

    // إضافة حقل isActive للأقسام
    await db.collection('departments').updateMany(
      {isActive: {$exists: false}},
      {$set: {isActive: true}}
    );

    // إضافة حقل isActive للمواد الدراسية
    await db.collection('subjects').updateMany(
      {isActive: {$exists: false}},
      {$set: {isActive: true}}
    );

    console.log('✅ Migration 3 completed: Academic structure updated');
  } catch (error) {
    console.error('❌ Migration 3 failed:', error);
    throw error;
  }
}

/**
 * ترحيل 4: إضافة حقول للتقارير
 */
async function migration4_AddReportFields () {
  try {
    console.log('🔄 Running migration 4: Add report fields...');

    const db = mongoose.connection.db;

    // إضافة حقل generatedAt للتقارير
    await db.collection('dailyreports').updateMany(
      {generatedAt: {$exists: false}},
      {$set: {generatedAt: new Date()}}
    );

    await db.collection('semesterreports').updateMany(
      {generatedAt: {$exists: false}},
      {$set: {generatedAt: new Date()}}
    );

    await db.collection('studentreports').updateMany(
      {generatedAt: {$exists: false}},
      {$set: {generatedAt: new Date()}}
    );

    console.log('✅ Migration 4 completed: Report fields added');
  } catch (error) {
    console.error('❌ Migration 4 failed:', error);
    throw error;
  }
}

/**
 * ترحيل 5: تحديث هيكل أجهزة NFC
 */
async function migration5_UpdateNfcStructure () {
  try {
    console.log('🔄 Running migration 5: Update NFC structure...');

    const db = mongoose.connection.db;

    // إضافة حقل isActive لأجهزة NFC
    await db.collection('nfcdevices').updateMany(
      {isActive: {$exists: false}},
      {$set: {isActive: true}}
    );

    // إضافة حقل location لأجهزة NFC
    await db.collection('nfcdevices').updateMany(
      {location: {$exists: false}},
      {$set: {location: 'غير محدد'}}
    );

    console.log('✅ Migration 5 completed: NFC structure updated');
  } catch (error) {
    console.error('❌ Migration 5 failed:', error);
    throw error;
  }
}

/**
 * التحقق من حالة الترحيل
 */
async function checkMigrationStatus () {
  try {
    console.log('🔍 Checking migration status...');

    const db = mongoose.connection.db;

    // التحقق من وجود مجموعة migrations
    const migrationsCollection = db.collection('migrations');

    // الحصول على الترحيلات المكتملة
    const completedMigrations = await migrationsCollection.find({}).toArray();
    const completedMigrationNumbers = completedMigrations.map(m => m.migrationNumber);

    console.log(`📋 Completed migrations: ${completedMigrationNumbers.join(', ')}`);

    return completedMigrationNumbers;
  } catch (error) {
    console.error('❌ Error checking migration status:', error);
    return [];
  }
}

/**
 * تسجيل الترحيل المكتمل
 */
async function markMigrationComplete (migrationNumber, description) {
  try {
    const db = mongoose.connection.db;
    const migrationsCollection = db.collection('migrations');

    await migrationsCollection.insertOne({
      migrationNumber,
      description,
      completedAt: new Date(),
      version: '1.0.0'
    });
  } catch (error) {
    console.error('❌ Error marking migration complete:', error);
  }
}

/**
 * تشغيل الترحيلات
 */
async function runMigrations () {
  try {
    console.log('🚀 Starting database migrations...');

    await connectDB();

    const completedMigrations = await checkMigrationStatus();

    const migrations = [
      {number: 1, name: 'Add isActive to users', fn: migration1_AddIsActiveToUsers},
      {number: 2, name: 'Add database indexes', fn: migration2_AddDatabaseIndexes},
      {number: 3, name: 'Update academic structure', fn: migration3_UpdateAcademicStructure},
      {number: 4, name: 'Add report fields', fn: migration4_AddReportFields},
      {number: 5, name: 'Update NFC structure', fn: migration5_UpdateNfcStructure}
    ];

    for (const migration of migrations) {
      if (!completedMigrations.includes(migration.number)) {
        console.log(`\n🔄 Running migration ${migration.number}: ${migration.name}`);
        await migration.fn();
        await markMigrationComplete(migration.number, migration.name);
        console.log(`✅ Migration ${migration.number} completed successfully`);
      } else {
        console.log(`⏭️  Migration ${migration.number} already completed, skipping...`);
      }
    }

    console.log('\n🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
  }
}

/**
 * إعادة تشغيل الترحيلات
 */
async function resetMigrations () {
  try {
    console.log('🔄 Resetting migrations...');

    await connectDB();

    const db = mongoose.connection.db;
    await db.collection('migrations').deleteMany({});

    console.log('✅ Migrations reset successfully');
  } catch (error) {
    console.error('❌ Error resetting migrations:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// معالجة الأوامر
const command = process.argv[2];

switch (command) {
  case 'run':
    runMigrations();
    break;
  case 'reset':
    resetMigrations();
    break;
  case 'status':
    connectDB().then(() => checkMigrationStatus())
      .then(() => mongoose.disconnect());
    break;
  default:
    console.log('Usage: node migrate.js [run|reset|status]');
    console.log('  run    - Run pending migrations');
    console.log('  reset  - Reset migration history');
    console.log('  status - Check migration status');
    process.exit(1);
}

// MongoDB initialization script
db = db.getSiblingDB('attendance-system');

// Create collections
db.createCollection('admins');
db.createCollection('faculty');
db.createCollection('students');
db.createCollection('colleges');
db.createCollection('departments');
db.createCollection('subjects');
db.createCollection('schedules');
db.createCollection('attendance');
db.createCollection('nfcdevices');
db.createCollection('timeslots');

// Create indexes
db.admins.createIndex({email: 1}, {unique: true});
db.faculty.createIndex({email: 1}, {unique: true});
db.faculty.createIndex({employeeId: 1}, {unique: true});
db.students.createIndex({email: 1}, {unique: true});
db.students.createIndex({studentId: 1}, {unique: true});
db.students.createIndex({cardId: 1}, {unique: true});

db.colleges.createIndex({code: 1}, {unique: true});
db.departments.createIndex({code: 1}, {unique: true});
db.subjects.createIndex({code: 1}, {unique: true});
db.nfcdevices.createIndex({deviceId: 1}, {unique: true});

// Create default admin user
db.admins.insertOne({
  name: 'مدير النظام',
  email: 'admin@attendance-system.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', // password123
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('MongoDB initialization completed successfully!');

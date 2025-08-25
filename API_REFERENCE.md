# 📚 API Reference Guide

**Version 2.1** - Updated on August 25, 2025

Complete documentation for all University Attendance System backend endpoints with request/response examples.

## 🔗 Base URL

```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## 🔐 Authentication

All protected endpoints require JWT authentication via:
- **Header**: `Authorization: Bearer <token>`
- **Cookie**: `accessToken=<token>`

### Authentication Endpoints

#### POST /auth/login
Login with email, password, and role.

**Request:**
```json
{
  "email": "admin@university.edu",
  "password": "password123",
  "role": "admin"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "email": "admin@university.edu",
      "role": "admin",
      "university": {
        "id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "Cairo University"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

---

## 🏛️ Academic Management

### Universities

#### GET /academic/universities
Get all universities (system_admin only).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name
- `country` (string): Filter by country
- `isActive` (boolean): Filter by status

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "total": 5,
  "data": {
    "universities": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Cairo University",
        "nameEn": "Cairo University",
        "code": "CU001",
        "country": "Egypt",
        "city": "Cairo",
        "address": "Giza Street, Cairo",
        "phone": "+20123456789",
        "email": "info@cu.edu.eg",
        "website": "https://cu.edu.eg",
        "isActive": true,
        "createdAt": "2025-08-25T10:00:00.000Z",
        "updatedAt": "2025-08-25T10:00:00.000Z"
      }
    ]
  }
}
```

#### POST /academic/universities
Create new university (system_admin only).

**Request:**
```json
{
  "name": "Alexandria University",
  "nameEn": "Alexandria University",
  "code": "AU001",
  "country": "Egypt",
  "city": "Alexandria",
  "address": "El-Shatby, Alexandria",
  "phone": "+20123456790",
  "email": "info@alexu.edu.eg",
  "website": "https://alexu.edu.eg"
}
```

#### PUT /academic/universities/:id
Update university (system_admin only).

#### DELETE /academic/universities/:id
Delete university (system_admin only).

#### PATCH /academic/universities/:id/toggle-status
Toggle university active status (system_admin only).

### Colleges

#### GET /academic/colleges
Get colleges (filtered by user's university for admin/faculty/student).

**Query Parameters:**
- `page`, `limit`, `search` (same as universities)
- `university` (ObjectId): Filter by university (system_admin only)
- `isActive` (boolean): Filter by status

**Response:**
```json
{
  "status": "success",
  "results": 3,
  "total": 3,
  "data": {
    "colleges": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "name": "Faculty of Engineering",
        "nameEn": "Faculty of Engineering",
        "code": "ENG001",
        "university": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
          "name": "Cairo University"
        },
        "dean": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
          "name": "Dr. Ahmed Hassan",
          "email": "dean@eng.cu.edu.eg"
        },
        "establishedYear": 1925,
        "isActive": true,
        "createdAt": "2025-08-25T10:00:00.000Z"
      }
    ]
  }
}
```

#### POST /academic/colleges
Create new college (system_admin, admin).

**Request:**
```json
{
  "name": "Faculty of Medicine",
  "nameEn": "Faculty of Medicine",
  "code": "MED001",
  "university": "64f1a2b3c4d5e6f7g8h9i0j1",
  "dean": "64f1a2b3c4d5e6f7g8h9i0j5",
  "establishedYear": 1827,
  "description": "Leading medical education institution"
}
```

### Departments

#### GET /academic/departments
Get departments (university-scoped).

#### POST /academic/departments
Create new department (system_admin, admin).

**Request:**
```json
{
  "name": "Computer Science",
  "nameEn": "Computer Science",
  "code": "CS001",
  "college": "64f1a2b3c4d5e6f7g8h9i0j3",
  "head": "64f1a2b3c4d5e6f7g8h9i0j6",
  "description": "Computer Science and Engineering Department"
}
```

### Programs

#### GET /academic/programs
Get programs (university-scoped).

**Query Parameters:**
- `department` (ObjectId): Filter by department
- `degree` (string): Filter by degree type (bachelor, master, phd, diploma)

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "total": 2,
  "data": {
    "programs": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
        "name": "Bachelor of Computer Science",
        "nameEn": "Bachelor of Computer Science",
        "code": "BCS001",
        "department": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
          "name": "Computer Science",
          "college": {
            "name": "Faculty of Engineering"
          }
        },
        "degree": "bachelor",
        "duration": 4,
        "totalCredits": 144,
        "description": "4-year Bachelor program in Computer Science",
        "isActive": true
      }
    ]
  }
}
```

#### POST /academic/programs
Create new program (system_admin, admin).

**Request:**
```json
{
  "name": "Master of Artificial Intelligence",
  "nameEn": "Master of Artificial Intelligence",
  "code": "MAI001",
  "department": "64f1a2b3c4d5e6f7g8h9i0j8",
  "degree": "master",
  "duration": 2,
  "totalCredits": 48,
  "description": "Advanced AI and Machine Learning program"
}
```

#### PUT /academic/programs/:id
Update program (system_admin, admin).

#### DELETE /academic/programs/:id
Delete program (system_admin, admin).

### Subjects

#### GET /academic/subjects
Get subjects (university-scoped).

**Query Parameters:**
- `department` (ObjectId): Filter by department
- `type` (string): Filter by type (theoretical, practical, mixed)
- `credits` (number): Filter by credit hours

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "total": 5,
  "data": {
    "subjects": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
        "name": "Data Structures and Algorithms",
        "nameEn": "Data Structures and Algorithms",
        "code": "CS201",
        "department": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
          "name": "Computer Science"
        },
        "credits": 3,
        "type": "theoretical",
        "prerequisites": ["CS101", "MATH201"],
        "description": "Fundamental data structures and algorithms",
        "isActive": true
      }
    ]
  }
}
```

#### POST /academic/subjects
Create new subject (system_admin, admin).

**Request:**
```json
{
  "name": "Machine Learning",
  "nameEn": "Machine Learning",
  "code": "CS401",
  "department": "64f1a2b3c4d5e6f7g8h9i0j8",
  "credits": 4,
  "type": "mixed",
  "prerequisites": ["CS301", "MATH301"],
  "description": "Introduction to machine learning algorithms and applications"
}
```

#### PUT /academic/subjects/:id
Update subject (system_admin, admin).

#### DELETE /academic/subjects/:id
Delete subject (system_admin, admin).

### Schedules

#### GET /academic/schedules
Get schedules (university-scoped, faculty can see assigned schedules).

**Query Parameters:**
- `section` (ObjectId): Filter by section
- `subject` (ObjectId): Filter by subject
- `faculty` (ObjectId): Filter by faculty
- `day` (string): Filter by day (sunday, monday, tuesday, wednesday, thursday, friday, saturday)

**Response:**
```json
{
  "status": "success",
  "results": 3,
  "total": 3,
  "data": {
    "schedules": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0ja",
        "section": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jb",
          "name": "CS-2024-A",
          "program": {
            "name": "Bachelor of Computer Science"
          }
        },
        "subject": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
          "name": "Data Structures and Algorithms",
          "code": "CS201"
        },
        "faculty": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jc",
          "name": "Dr. Sarah Ahmed",
          "email": "sarah.ahmed@cu.edu.eg"
        },
        "day": "monday",
        "startTime": "09:00",
        "endTime": "10:30",
        "room": "Lab-A101",
        "type": "lecture",
        "isActive": true
      }
    ]
  }
}
```

#### POST /academic/schedules
Create new schedule (system_admin, admin, faculty for assigned sections).

**Request:**
```json
{
  "section": "64f1a2b3c4d5e6f7g8h9i0jb",
  "subject": "64f1a2b3c4d5e6f7g8h9i0j9",
  "faculty": "64f1a2b3c4d5e6f7g8h9i0jc",
  "day": "wednesday",
  "startTime": "14:00",
  "endTime": "15:30",
  "room": "Room-B205",
  "type": "lecture"
}
```

#### PUT /academic/schedules/:id
Update schedule (system_admin, admin, faculty for assigned schedules).

#### DELETE /academic/schedules/:id
Delete schedule (system_admin, admin, faculty for assigned schedules).

---

## 👥 User Management

### Students

#### GET /users/students
Get students (university-scoped).

**Query Parameters:**
- `section` (ObjectId): Filter by section
- `program` (ObjectId): Filter by program
- `academicYear` (string): Filter by academic year
- `isActive` (boolean): Filter by status

#### POST /users/students
Create new student (system_admin, admin).

**Request:**
```json
{
  "email": "student@cu.edu.eg",
  "password": "student123",
  "name": "Ahmed Mohamed",
  "nameEn": "Ahmed Mohamed",
  "studentId": "2024001",
  "university": "64f1a2b3c4d5e6f7g8h9i0j1",
  "program": "64f1a2b3c4d5e6f7g8h9i0j7",
  "section": "64f1a2b3c4d5e6f7g8h9i0jb",
  "academicYear": "2024-2025",
  "phone": "+20123456789",
  "nfcId": "ABC123456789"
}
```

### Faculty

#### GET /users/faculty
Get faculty members (university-scoped).

#### POST /users/faculty
Create new faculty member (system_admin, admin).

**Request:**
```json
{
  "email": "faculty@cu.edu.eg",
  "password": "faculty123",
  "name": "Dr. Mohamed Ali",
  "nameEn": "Dr. Mohamed Ali",
  "employeeId": "FAC001",
  "university": "64f1a2b3c4d5e6f7g8h9i0j1",
  "college": "64f1a2b3c4d5e6f7g8h9i0j3",
  "department": "64f1a2b3c4d5e6f7g8h9i0j8",
  "position": "professor",
  "specialization": "Artificial Intelligence",
  "phone": "+20123456790"
}
```

---

## 📊 Advanced Reporting & Analytics

### Dashboard Statistics

#### GET /reports/dashboard-stats
Get comprehensive dashboard statistics (system_admin, admin).

**Response:**
```json
{
  "status": "success",
  "data": {
    "users": {
      "students": {
        "total": 1250,
        "active": 1180
      },
      "faculty": {
        "total": 85,
        "active": 82
      }
    },
    "attendance": {
      "today": {
        "present": 890,
        "absent": 290,
        "late": 70,
        "rate": 75.2
      },
      "thisWeek": {
        "averageRate": 78.5
      },
      "thisMonth": {
        "averageRate": 76.8
      }
    },
    "academic": {
      "colleges": 5,
      "departments": 25,
      "programs": 45,
      "subjects": 180,
      "sections": 95,
      "schedules": 420
    }
  }
}
```

### Student Attendance Analytics

#### GET /reports/admin/student-attendance-percentage
Get detailed student attendance percentage analysis (system_admin, admin).

**Query Parameters:**
- `startDate` (date): Start date for analysis
- `endDate` (date): End date for analysis
- `program` (ObjectId): Filter by program
- `section` (ObjectId): Filter by section

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "totalStudents": 150,
      "averageAttendance": 78.5,
      "highPerformers": 45,
      "lowPerformers": 12
    },
    "students": [
      {
        "student": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jd",
          "name": "Ahmed Mohamed",
          "studentId": "2024001",
          "section": {
            "name": "CS-2024-A"
          }
        },
        "attendanceRate": 85.5,
        "totalSessions": 45,
        "attendedSessions": 38,
        "absentSessions": 7,
        "lateCount": 3,
        "status": "good"
      }
    ]
  }
}
```

### Subject Absence Analysis

#### GET /reports/admin/highest-absence-subjects
Get subjects with highest absence rates (system_admin, admin).

**Response:**
```json
{
  "status": "success",
  "data": {
    "subjects": [
      {
        "subject": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
          "name": "Advanced Mathematics",
          "code": "MATH301"
        },
        "totalSessions": 30,
        "totalAbsences": 180,
        "absenceRate": 40.0,
        "averageAttendance": 60.0,
        "studentsAffected": 25
      }
    ]
  }
}
```

### Faculty Performance Analytics

#### GET /reports/admin/faculty-attendance-by-section
Get faculty performance by section (system_admin, admin).

**Response:**
```json
{
  "status": "success",
  "data": {
    "faculty": [
      {
        "faculty": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0jc",
          "name": "Dr. Sarah Ahmed",
          "employeeId": "FAC001"
        },
        "sections": [
          {
            "section": {
              "_id": "64f1a2b3c4d5e6f7g8h9i0jb",
              "name": "CS-2024-A"
            },
            "subject": {
              "name": "Data Structures",
              "code": "CS201"
            },
            "attendanceRate": 82.5,
            "totalSessions": 25,
            "studentsCount": 30
          }
        ],
        "overallPerformance": 82.5
      }
    ]
  }
}
```

### Department Comparison

#### GET /reports/admin/department-attendance-comparison
Get attendance comparison across departments (system_admin, admin).

**Response:**
```json
{
  "status": "success",
  "data": {
    "departments": [
      {
        "department": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
          "name": "Computer Science"
        },
        "attendanceRate": 78.5,
        "studentsCount": 120,
        "facultyCount": 15,
        "sectionsCount": 8,
        "ranking": 1
      }
    ],
    "summary": {
      "bestPerforming": "Computer Science",
      "worstPerforming": "Mathematics",
      "averageRate": 75.2
    }
  }
}
```

---

## 🔒 Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

---

## 📦 Postman Collection

Import the complete Postman collection for easy API testing:

**File:** `University_Attendance_System.postman_collection.json`

**Import Instructions:**
1. Open Postman
2. Click "Import" button
3. Select the collection file
4. Configure environment variables:
   - `baseUrl`: Your API base URL
   - `token`: JWT access token (set after login)

**Collection Structure:**
- 📁 Authentication
- 📁 Universities
- 📁 Colleges
- 📁 Departments
- 📁 Programs
- 📁 Subjects
- 📁 Schedules
- 📁 Sections
- 📁 Faculty
- 📁 Students
- 📁 Attendance
- 📁 Reports & Analytics

---

## 🔧 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **Report endpoints**: 20 requests per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time

---

**Last Updated:** August 25, 2025  
**API Version:** 2.1  
**Documentation Version:** 1.0

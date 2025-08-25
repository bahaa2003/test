# 🔒 Security & Role-Based Access Control (RBAC)

**Version 2.1** - Updated on August 25, 2025

Comprehensive security documentation for the University Attendance System with detailed RBAC implementation and authorization matrix.

## 🛡️ Security Architecture

### Authentication System
- **JWT-based Authentication** with access and refresh tokens
- **Multi-model User Support** - SystemAdmin, Admin, Faculty, Student
- **Token Extraction** from Authorization header or HTTP cookies
- **Password Security** with bcrypt hashing (12 rounds)
- **Session Management** with token refresh and logout

### Authorization Framework
- **Strict Role-Based Access Control** with university scoping
- **Resource-level Permissions** with ownership validation
- **Multi-tenant Data Isolation** preventing cross-university access
- **Granular Endpoint Protection** with role-specific middleware

---

## 👥 User Roles & Hierarchy

### 1. System Admin (`system_admin`)
**Highest privilege level** - Platform-wide access

**Capabilities:**
- Manage all universities, colleges, departments
- Create and manage admin accounts
- Access all system analytics and reports
- Configure system-wide settings
- Full CRUD on all academic entities
- Cross-university data access

**Restrictions:**
- Cannot access student/faculty personal data without proper context
- Cannot bypass audit logging

### 2. University Admin (`admin`)
**University-scoped administrative access**

**Capabilities:**
- Manage colleges, departments, programs within assigned university
- Create and manage faculty and student accounts
- Access university-specific reports and analytics
- Configure university settings and academic calendar
- Manage sections, subjects, and schedules
- View attendance data for their university

**Restrictions:**
- Cannot access other universities' data
- Cannot create system admin accounts
- Cannot modify university-level settings (managed by system_admin)

### 3. Faculty (`faculty`)
**Teaching staff with section-specific access**

**Capabilities:**
- View assigned sections and students
- Record and modify attendance for assigned classes
- Access attendance reports for their sections
- View their teaching schedule
- Update their profile information
- Generate section-specific reports

**Restrictions:**
- Cannot access other faculty's sections
- Cannot modify academic structure (colleges, departments)
- Cannot create user accounts
- Limited to university-scoped data

### 4. Student (`student`)
**Individual student access**

**Capabilities:**
- View personal attendance records
- Access their academic schedule
- Update personal profile information
- View their academic progress
- Access university announcements

**Restrictions:**
- Cannot access other students' data
- Cannot modify attendance records
- Cannot access administrative functions
- Read-only access to academic structure

---

## 🔐 Authorization Matrix

### Academic Management Endpoints

| Endpoint | system_admin | admin | faculty | student |
|----------|--------------|-------|---------|---------|
| **Universities** |
| GET /academic/universities | ✅ Full | ❌ | ❌ | ❌ |
| POST /academic/universities | ✅ | ❌ | ❌ | ❌ |
| PUT /academic/universities/:id | ✅ | ❌ | ❌ | ❌ |
| DELETE /academic/universities/:id | ✅ | ❌ | ❌ | ❌ |
| **Colleges** |
| GET /academic/colleges | ✅ All | ✅ Own Uni | ✅ Own Uni | ✅ Own Uni |
| POST /academic/colleges | ✅ | ✅ | ❌ | ❌ |
| PUT /academic/colleges/:id | ✅ | ✅ Own Uni | ❌ | ❌ |
| DELETE /academic/colleges/:id | ✅ | ✅ Own Uni | ❌ | ❌ |
| **Departments** |
| GET /academic/departments | ✅ All | ✅ Own Uni | ✅ Own Uni | ✅ Own Uni |
| POST /academic/departments | ✅ | ✅ | ❌ | ❌ |
| PUT /academic/departments/:id | ✅ | ✅ Own Uni | ❌ | ❌ |
| DELETE /academic/departments/:id | ✅ | ✅ Own Uni | ❌ | ❌ |
| **Programs** |
| GET /academic/programs | ✅ All | ✅ Own Uni | ✅ Own Uni | ✅ Own Uni |
| POST /academic/programs | ✅ | ✅ | ❌ | ❌ |
| PUT /academic/programs/:id | ✅ | ✅ Own Uni | ❌ | ❌ |
| DELETE /academic/programs/:id | ✅ | ✅ Own Uni | ❌ | ❌ |
| **Subjects** |
| GET /academic/subjects | ✅ All | ✅ Own Uni | ✅ Own Uni | ✅ Own Uni |
| POST /academic/subjects | ✅ | ✅ | ❌ | ❌ |
| PUT /academic/subjects/:id | ✅ | ✅ Own Uni | ❌ | ❌ |
| DELETE /academic/subjects/:id | ✅ | ✅ Own Uni | ❌ | ❌ |
| **Schedules** |
| GET /academic/schedules | ✅ All | ✅ Own Uni | ✅ Assigned | ✅ Own |
| POST /academic/schedules | ✅ | ✅ | ✅ Assigned | ❌ |
| PUT /academic/schedules/:id | ✅ | ✅ Own Uni | ✅ Assigned | ❌ |
| DELETE /academic/schedules/:id | ✅ | ✅ Own Uni | ✅ Assigned | ❌ |
| **Sections** |
| GET /academic/sections | ✅ All | ✅ Own Uni | ✅ Assigned | ✅ Own |
| POST /academic/sections | ✅ | ✅ | ❌ | ❌ |
| PUT /academic/sections/:id | ✅ | ✅ Own Uni | ❌ | ❌ |
| DELETE /academic/sections/:id | ✅ | ✅ Own Uni | ❌ | ❌ |

### User Management Endpoints

| Endpoint | system_admin | admin | faculty | student |
|----------|--------------|-------|---------|---------|
| **Faculty Management** |
| GET /users/faculty | ✅ All | ✅ Own Uni | ✅ Own Uni | ❌ |
| POST /users/faculty | ✅ | ✅ | ❌ | ❌ |
| PUT /users/faculty/:id | ✅ | ✅ Own Uni | ✅ Own | ❌ |
| DELETE /users/faculty/:id | ✅ | ✅ Own Uni | ❌ | ❌ |
| **Student Management** |
| GET /users/students | ✅ All | ✅ Own Uni | ✅ Assigned | ❌ |
| POST /users/students | ✅ | ✅ | ❌ | ❌ |
| PUT /users/students/:id | ✅ | ✅ Own Uni | ❌ | ✅ Own |
| DELETE /users/students/:id | ✅ | ✅ Own Uni | ❌ | ❌ |
| **Admin Management** |
| GET /users/admins | ✅ | ❌ | ❌ | ❌ |
| POST /users/admins | ✅ | ❌ | ❌ | ❌ |
| PUT /users/admins/:id | ✅ | ✅ Own | ❌ | ❌ |
| DELETE /users/admins/:id | ✅ | ❌ | ❌ | ❌ |

### Attendance Management

| Endpoint | system_admin | admin | faculty | student |
|----------|--------------|-------|---------|---------|
| GET /attendance | ✅ All | ✅ Own Uni | ✅ Assigned | ✅ Own |
| POST /attendance | ✅ | ✅ | ✅ Assigned | ❌ |
| PUT /attendance/:id | ✅ | ✅ Own Uni | ✅ Assigned | ❌ |
| DELETE /attendance/:id | ✅ | ✅ Own Uni | ✅ Assigned | ❌ |

### Reporting & Analytics

| Endpoint | system_admin | admin | faculty | student |
|----------|--------------|-------|---------|---------|
| GET /reports/dashboard-stats | ✅ | ✅ Own Uni | ❌ | ❌ |
| GET /reports/admin/student-attendance-percentage | ✅ | ✅ Own Uni | ❌ | ❌ |
| GET /reports/admin/highest-absence-subjects | ✅ | ✅ Own Uni | ❌ | ❌ |
| GET /reports/admin/faculty-attendance-by-section | ✅ | ✅ Own Uni | ❌ | ❌ |
| GET /reports/admin/department-attendance-comparison | ✅ | ✅ Own Uni | ❌ | ❌ |
| GET /reports/faculty/section-attendance | ✅ | ✅ Own Uni | ✅ Assigned | ❌ |
| GET /reports/student/my-attendance | ✅ | ✅ Own Uni | ✅ Assigned | ✅ Own |

**Legend:**
- ✅ **Full**: Complete access to all data
- ✅ **Own Uni**: Access limited to user's university
- ✅ **Assigned**: Access limited to assigned sections/students
- ✅ **Own**: Access limited to user's own data
- ❌ **Denied**: No access

---

## 🔒 Security Implementation Details

### 1. Authentication Middleware (`authenticate.js`)

```javascript
// Token extraction priority
1. Authorization: Bearer <token>
2. Cookie: accessToken=<token>

// User resolution order
1. SystemAdmin model
2. Admin model  
3. Faculty model
4. Student model

// Security checks
- Token validity and expiration
- User active status
- Password change timestamp validation
- University assignment verification
```

### 2. Authorization Middleware (`authorize.js`)

```javascript
// Role validation
authorize(['system_admin', 'admin'])

// University scoping
- Automatic filtering by user.university
- Cross-university access prevention
- Resource ownership validation

// Special permissions
- Faculty: Access to assigned sections only
- Student: Access to own data only
- Admin: University-scoped access
- System Admin: Platform-wide access
```

### 3. University Scoping Implementation

**Automatic Filtering:**
```javascript
// For admin, faculty, student roles
if (req.user.role !== 'system_admin') {
  query.university = req.user.university;
}
```

**Resource Ownership:**
```javascript
// Faculty accessing schedules
const schedule = await Schedule.findById(id);
if (req.user.role === 'faculty' && 
    !schedule.faculty.equals(req.user._id)) {
  throw new AppError('Access denied', 403);
}
```

### 4. Data Validation & Sanitization

**Input Validation:**
- Joi schemas for all endpoints
- ObjectId format validation
- Required field enforcement
- Data type validation
- Length and format constraints

**Output Sanitization:**
- Password field exclusion
- Sensitive data filtering
- Role-based field visibility
- University-scoped responses

---

## 🚨 Security Best Practices

### 1. Password Security
- **Bcrypt hashing** with 12 salt rounds
- **Minimum complexity** requirements
- **Password change tracking** for token invalidation
- **No plain text storage** anywhere in system

### 2. Token Management
- **Short-lived access tokens** (15 minutes)
- **Longer refresh tokens** (7 days)
- **Secure HTTP-only cookies** for web clients
- **Token blacklisting** on logout
- **Automatic token refresh** mechanism

### 3. Input Validation
- **Joi validation schemas** for all endpoints
- **SQL injection prevention** via Mongoose ODM
- **XSS protection** with input sanitization
- **File upload validation** with type/size limits
- **Rate limiting** to prevent abuse

### 4. University Data Isolation
- **Automatic university filtering** for non-system_admin users
- **Cross-tenant access prevention** at middleware level
- **Resource ownership validation** before operations
- **Audit logging** for all cross-university attempts

### 5. API Security
- **CORS configuration** with allowed origins
- **Helmet.js** for security headers
- **Rate limiting** per endpoint type
- **Request size limits** to prevent DoS
- **Error message sanitization** to prevent information leakage

---

## 🔍 Security Monitoring

### 1. Audit Logging
All security-relevant events are logged with:
- User identification
- Action performed
- Resource accessed
- Timestamp
- IP address
- User agent
- Success/failure status

### 2. Failed Authentication Tracking
- Multiple failed login attempts
- Invalid token usage
- Unauthorized access attempts
- Cross-university access violations

### 3. Security Alerts
- Suspicious activity patterns
- Multiple failed authentications
- Unusual access patterns
- Token manipulation attempts

---

## ⚠️ Security Considerations

### 1. Known Limitations
- **Session fixation**: Tokens not rotated on privilege escalation
- **Concurrent sessions**: Multiple active sessions allowed
- **Password history**: No password reuse prevention
- **Account lockout**: No automatic lockout after failed attempts

### 2. Recommended Enhancements
- Implement account lockout policies
- Add password history tracking
- Implement session management
- Add two-factor authentication
- Enhance audit logging detail
- Add real-time security monitoring

### 3. Compliance Notes
- **GDPR**: Personal data handling requires consent tracking
- **FERPA**: Student data access logging required
- **SOC 2**: Audit trail completeness needed
- **ISO 27001**: Risk assessment documentation required

---

## 🧪 Security Testing

### 1. Authentication Tests
```bash
# Test invalid credentials
curl -X POST /api/v1/auth/login \
  -d '{"email":"invalid@test.com","password":"wrong","role":"admin"}'

# Test expired token
curl -X GET /api/v1/academic/colleges \
  -H "Authorization: Bearer expired_token"
```

### 2. Authorization Tests
```bash
# Test cross-university access (should fail)
curl -X GET /api/v1/academic/colleges \
  -H "Authorization: Bearer admin_token_university_A" \
  -d '{"university":"university_B_id"}'

# Test role escalation (should fail)
curl -X POST /api/v1/users/admins \
  -H "Authorization: Bearer faculty_token" \
  -d '{"email":"test@test.com","role":"admin"}'
```

### 3. Input Validation Tests
```bash
# Test SQL injection attempt
curl -X GET "/api/v1/users/students?search='; DROP TABLE students; --"

# Test XSS attempt
curl -X POST /api/v1/users/students \
  -d '{"name":"<script>alert(\"xss\")</script>"}'
```

---

**Last Updated:** August 25, 2025  
**Security Version:** 2.1  
**RBAC Implementation:** Complete

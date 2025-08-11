# وثائق API

## نظرة عامة

API لنظام إدارة الحضور والانصراف يوفر واجهة برمجة تطبيقات RESTful شاملة لإدارة جميع عمليات النظام.

## معلومات أساسية

- **Base URL**: `https://api.attendance-system.com/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token
- **Rate Limiting**: 100 requests per 15 minutes

## المصادقة

### تسجيل الدخول
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "أحمد محمد",
      "email": "user@example.com",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### تسجيل الخروج
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

### تجديد التوكن
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## إدارة الأكاديمية

### الكليات

#### الحصول على جميع الكليات
```http
GET /academic/colleges
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `search` (string): البحث في اسم الكلية
- `isActive` (boolean): فلترة حسب الحالة
- `page` (number): رقم الصفحة
- `limit` (number): عدد العناصر في الصفحة

**Response:**
```json
{
  "status": "success",
  "data": {
    "colleges": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "كلية الهندسة",
        "code": "ENG001",
        "description": "كلية الهندسة والتكنولوجيا",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### إنشاء كلية جديدة
```http
POST /academic/colleges
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "كلية الهندسة",
  "code": "ENG001",
  "description": "كلية الهندسة والتكنولوجيا"
}
```

#### الحصول على كلية محددة
```http
GET /academic/colleges/{id}
Authorization: Bearer <access_token>
```

#### تحديث كلية
```http
PATCH /academic/colleges/{id}
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "كلية الهندسة والتكنولوجيا",
  "description": "وصف محدث"
}
```

#### حذف كلية
```http
DELETE /academic/colleges/{id}
Authorization: Bearer <access_token>
```

### الأقسام

#### الحصول على جميع الأقسام
```http
GET /academic/departments
Authorization: Bearer <access_token>
```

#### الحصول على أقسام كلية محددة
```http
GET /academic/departments/college/{collegeId}
Authorization: Bearer <access_token>
```

#### إنشاء قسم جديد
```http
POST /academic/departments
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "قسم هندسة الحاسوب",
  "code": "CS001",
  "collegeId": "507f1f77bcf86cd799439011",
  "description": "قسم هندسة الحاسوب والبرمجيات"
}
```

### المواد الدراسية

#### الحصول على جميع المواد
```http
GET /academic/subjects
Authorization: Bearer <access_token>
```

#### البحث في المواد
```http
GET /academic/subjects/search?q=برمجة
Authorization: Bearer <access_token>
```

#### إنشاء مادة جديدة
```http
POST /academic/subjects
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "برمجة متقدمة",
  "code": "CS301",
  "departmentId": "507f1f77bcf86cd799439011",
  "credits": 3,
  "description": "مادة البرمجة المتقدمة"
}
```

### الجداول الدراسية

#### الحصول على جميع الجداول
```http
GET /academic/schedules
Authorization: Bearer <access_token>
```

#### الحصول على جداول مادة محددة
```http
GET /academic/schedules/subject/{subjectId}
Authorization: Bearer <access_token>
```

#### إنشاء جدول جديد
```http
POST /academic/schedules
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "subjectId": "507f1f77bcf86cd799439011",
  "facultyId": "507f1f77bcf86cd799439012",
  "dayOfWeek": "monday",
  "startTime": "09:00",
  "endTime": "10:30",
  "room": "A101"
}
```

## إدارة الحضور

### تسجيل الحضور

#### تسجيل حضور يدوي
```http
POST /attendance/faculty
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "scheduleId": "507f1f77bcf86cd799439011",
  "date": "2024-01-15",
  "status": "present",
  "notes": "حضور عادي"
}
```

#### تسجيل حضور عبر NFC
```http
POST /attendance/nfc/record
```

**Request Body:**
```json
{
  "deviceId": "NFC001",
  "cardId": "STU123456",
  "timestamp": "2024-01-15T09:00:00.000Z"
}
```

### الحصول على سجلات الحضور

#### سجلات حضور الأستاذ
```http
GET /attendance/faculty?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <access_token>
```

#### سجلات حضور الطالب
```http
GET /attendance/student/{studentId}?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <access_token>
```

### إدارة أجهزة NFC

#### الحصول على جميع الأجهزة
```http
GET /attendance/nfc/devices
Authorization: Bearer <access_token>
```

#### تسجيل جهاز جديد
```http
POST /attendance/nfc/devices
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "deviceId": "NFC001",
  "name": "جهاز المدخل الرئيسي",
  "location": "المدخل الرئيسي",
  "description": "جهاز NFC للمدخل الرئيسي"
}
```

#### تحديث حالة الجهاز
```http
PATCH /attendance/nfc/devices/{id}/status
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "isActive": false
}
```

## إدارة المستخدمين

### الحصول على جميع المستخدمين
```http
GET /admin/users?role=student&isActive=true
Authorization: Bearer <access_token>
```

### إنشاء مستخدم جديد
```http
POST /admin/users
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "role": "student",
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "password123",
  "phone": "+201234567890",
  "studentId": "STU123456",
  "departmentId": "507f1f77bcf86cd799439011"
}
```

### تحديث مستخدم
```http
PATCH /admin/users/{role}/{id}
Authorization: Bearer <access_token>
```

### حذف مستخدم
```http
DELETE /admin/users/{role}/{id}
Authorization: Bearer <access_token>
```

### إعادة تعيين كلمة المرور
```http
POST /admin/users/{role}/{id}/reset-password
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

## التقارير

### تقارير الإدارة

#### نظرة عامة على النظام
```http
GET /reports/admin/overview
Authorization: Bearer <access_token>
```

#### تقرير الحضور العام
```http
GET /reports/admin/attendance?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <access_token>
```

#### تقرير الكليات
```http
GET /reports/admin/colleges
Authorization: Bearer <access_token>
```

### تقارير الأساتذة

#### تقرير حضور الأستاذ
```http
GET /reports/faculty/attendance?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <access_token>
```

#### تقرير المواد
```http
GET /reports/faculty/subjects
Authorization: Bearer <access_token>
```

#### تقرير طلاب مادة محددة
```http
GET /reports/faculty/subject/{subjectId}/students
Authorization: Bearer <access_token>
```

### تقارير الطلاب

#### تقرير الحضور الشخصي
```http
GET /reports/student/attendance?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <access_token>
```

#### تقرير المواد
```http
GET /reports/student/subjects
Authorization: Bearer <access_token>
```

#### تقرير مادة محددة
```http
GET /reports/student/subject/{subjectId}
Authorization: Bearer <access_token>
```

## رموز الحالة

### رموز النجاح
- `200` - OK: الطلب ناجح
- `201` - Created: تم إنشاء المورد بنجاح
- `204` - No Content: الطلب ناجح بدون محتوى

### رموز خطأ العميل
- `400` - Bad Request: طلب غير صحيح
- `401` - Unauthorized: غير مصرح
- `403` - Forbidden: محظور
- `404` - Not Found: غير موجود
- `409` - Conflict: تضارب
- `422` - Unprocessable Entity: بيانات غير صالحة

### رموز خطأ الخادم
- `500` - Internal Server Error: خطأ داخلي في الخادم
- `502` - Bad Gateway: خطأ في البوابة
- `503` - Service Unavailable: الخدمة غير متاحة

## تنسيق الاستجابة

### استجابة النجاح
```json
{
  "status": "success",
  "data": {
    // البيانات المطلوبة
  },
  "pagination": {
    // معلومات الصفحات (اختياري)
  }
}
```

### استجابة الخطأ
```json
{
  "status": "error",
  "message": "رسالة الخطأ",
  "errors": [
    {
      "field": "email",
      "message": "البريد الإلكتروني مطلوب"
    }
  ]
}
```

## أمثلة الاستخدام

### مثال: تسجيل دخول والحصول على الكليات
```javascript
// تسجيل الدخول
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
const accessToken = loginData.data.accessToken;

// الحصول على الكليات
const collegesResponse = await fetch('/api/v1/academic/colleges', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const collegesData = await collegesResponse.json();
console.log(collegesData.data.colleges);
```

### مثال: إنشاء كلية جديدة
```javascript
const createCollegeResponse = await fetch('/api/v1/academic/colleges', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    name: 'كلية الطب',
    code: 'MED001',
    description: 'كلية الطب والعلوم الصحية'
  })
});

const collegeData = await createCollegeResponse.json();
console.log(collegeData.data.college);
```

## ملاحظات مهمة

1. **المصادقة**: جميع الطلبات (ما عدا تسجيل الدخول) تتطلب توكن مصادقة
2. **التواريخ**: جميع التواريخ بصيغة ISO 8601
3. **الوقت**: جميع الأوقات بصيغة 24 ساعة (HH:MM)
4. **الترميز**: جميع النصوص بترميز UTF-8
5. **الحد الأقصى**: حجم الطلب الأقصى 10MB

## الدعم

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- البريد الإلكتروني: api-support@attendance-system.com
- التوثيق التفاعلي: https://api.attendance-system.com/docs
- GitHub Issues: https://github.com/your-username/attendance-system/issues

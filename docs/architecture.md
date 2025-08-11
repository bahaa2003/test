# هيكل النظام

## نظرة عامة

نظام إدارة الحضور والانصراف هو تطبيق ويب مبني على Node.js مع Express.js وMongoDB، مصمم لإدارة الحضور في المؤسسات التعليمية باستخدام تقنية NFC.

## الهيكل العام

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React/Vue)   │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   NFC Devices   │
                       │   (Hardware)    │
                       └─────────────────┘
```

## طبقات النظام

### 1. طبقة العرض (Presentation Layer)
- **واجهة المستخدم**: تطبيق ويب تفاعلي
- **API Gateway**: نقطة دخول موحدة للـ API
- **التوثيق**: وثائق API تفاعلية

### 2. طبقة الأعمال (Business Layer)
- **Controllers**: منطق التحكم في الطلبات
- **Services**: منطق الأعمال المعقد
- **Validators**: التحقق من صحة البيانات

### 3. طبقة البيانات (Data Layer)
- **Models**: نماذج قاعدة البيانات
- **Repositories**: وصول للبيانات
- **Database**: MongoDB مع Mongoose

## المكونات الرئيسية

### Controllers
```
controllers/
├── academic/          # إدارة الأكاديمية
│   ├── collegeController.js
│   ├── departmentController.js
│   ├── subjectController.js
│   └── scheduleController.js
├── attendance/        # إدارة الحضور
│   ├── facultyController.js
│   ├── nfcController.js
│   └── timeslotController.js
├── auth/             # المصادقة
│   ├── authController.js
│   └── userController.js
├── admin/            # إدارة النظام
│   └── userManagementController.js
└── report/           # التقارير
    ├── adminReportController.js
    ├── facultyReportController.js
    └── studentReportController.js
```

### Services
```
services/
├── nfcService.js     # خدمات NFC
├── reportService.js  # خدمات التقارير
└── backupService.js  # خدمات النسخ الاحتياطي
```

### Models
```
models/
├── user/             # نماذج المستخدمين
│   ├── Admin.js
│   ├── Faculty.js
│   └── Student.js
├── academic/         # النماذج الأكاديمية
│   ├── College.js
│   ├── Department.js
│   ├── Subject.js
│   └── Schedule.js
├── operational/      # النماذج التشغيلية
│   ├── Attendance.js
│   ├── NfcDevice.js
│   └── TimeSlot.js
└── report/           # نماذج التقارير
    ├── DailyReport.js
    ├── SemesterReport.js
    └── StudentReport.js
```

## تدفق البيانات

### 1. تسجيل الحضور عبر NFC
```
NFC Device → API → Controller → Service → Model → Database
    ↓
Response ← Controller ← Service ← Model ← Database
```

### 2. تسجيل الحضور اليدوي
```
Frontend → API → Controller → Validator → Service → Model → Database
    ↓
Response ← Controller ← Service ← Model ← Database
```

### 3. إنشاء التقارير
```
Frontend → API → Controller → Service → Aggregation → Database
    ↓
Response ← Controller ← Service ← Aggregation ← Database
```

## الأمان

### المصادقة والتفويض
- **JWT Tokens**: للمصادقة
- **Role-based Access Control**: للتفويض
- **Refresh Tokens**: لتجديد الجلسات

### حماية البيانات
- **bcrypt**: تشفير كلمات المرور
- **Helmet**: حماية HTTP headers
- **Rate Limiting**: منع الهجمات
- **Input Validation**: التحقق من المدخلات

## الأداء

### تحسين قاعدة البيانات
- **Indexes**: فهارس محسنة للاستعلامات
- **Aggregation Pipelines**: لاستعلامات معقدة
- **Connection Pooling**: إدارة الاتصالات

### تحسين التطبيق
- **Caching**: تخزين مؤقت للبيانات
- **Compression**: ضغط الاستجابات
- **Load Balancing**: توزيع الحمل

## المراقبة والتسجيل

### التسجيل
- **Winston**: تسجيل منظم
- **Log Levels**: مستويات مختلفة للتسجيل
- **Log Rotation**: تدوير السجلات

### المراقبة
- **Health Checks**: فحص صحة النظام
- **Performance Metrics**: مقاييس الأداء
- **Error Tracking**: تتبع الأخطاء

## النشر والتشغيل

### البيئات
- **Development**: للتطوير
- **Testing**: للاختبارات
- **Staging**: للاختبار قبل الإنتاج
- **Production**: للإنتاج

### الحاويات
- **Docker**: حاويات التطبيق
- **Docker Compose**: إدارة الخدمات
- **Nginx**: خادم وكيل عكسي

## التكامل

### NFC Integration
- **Device Management**: إدارة الأجهزة
- **Real-time Communication**: اتصال مباشر
- **Data Synchronization**: مزامنة البيانات

### External APIs
- **Email Service**: إرسال الإشعارات
- **SMS Gateway**: رسائل نصية
- **File Storage**: تخزين الملفات

## قابلية التوسع

### Horizontal Scaling
- **Load Balancer**: موزع الحمل
- **Multiple Instances**: عدة نسخ
- **Database Sharding**: تقسيم قاعدة البيانات

### Vertical Scaling
- **Resource Optimization**: تحسين الموارد
- **Memory Management**: إدارة الذاكرة
- **CPU Optimization**: تحسين المعالج

## النسخ الاحتياطي والاسترداد

### Backup Strategy
- **Automated Backups**: نسخ احتياطي تلقائي
- **Incremental Backups**: نسخ تدريجي
- **Point-in-time Recovery**: استرداد نقطة زمنية

### Disaster Recovery
- **Data Replication**: تكرار البيانات
- **Failover Systems**: أنظمة بديلة
- **Backup Testing**: اختبار النسخ الاحتياطي

## التوثيق

### API Documentation
- **OpenAPI/Swagger**: توثيق API
- **Code Comments**: تعليقات الكود
- **README Files**: ملفات القراءة

### User Documentation
- **User Manuals**: أدلة المستخدم
- **Admin Guides**: أدلة الإدارة
- **Troubleshooting**: استكشاف الأخطاء

---

**ملاحظة**: هذا الهيكل قابل للتطوير والتحديث حسب احتياجات المشروع.

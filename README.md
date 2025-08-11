# نظام إدارة الحضور والانصراف

نظام متكامل لإدارة الحضور والانصراف في المؤسسات التعليمية باستخدام تقنية NFC والويب.

## المميزات

### 🔐 **نظام المصادقة والأمان**
- مصادقة متعددة الأدوار (مشرف، أستاذ، طالب)
- JWT tokens مع refresh mechanism
- تشفير كلمات المرور
- حماية ضد الهجمات الأمنية

### 🏫 **إدارة أكاديمية**
- إدارة الكليات والأقسام والبرامج
- إدارة المواد الدراسية والجداول
- نظام الجداول الزمنية المتقدم

### 📊 **نظام الحضور**
- تسجيل الحضور عبر NFC
- تسجيل الحضور اليدوي للأساتذة
- إدارة أجهزة NFC
- تتبع الحضور في الوقت الفعلي

### 📈 **التقارير والإحصائيات**
- تقارير شاملة للمشرفين
- تقارير خاصة بالأساتذة
- تقارير الطلاب الشخصية
- تصدير التقارير بصيغ مختلفة

### 🔧 **المميزات التقنية**
- API RESTful متكامل
- قاعدة بيانات MongoDB محسنة
- WebSocket للاتصال المباشر
- نظام نسخ احتياطي تلقائي
- معالجة أخطاء شاملة

## التثبيت والتشغيل

### المتطلبات الأساسية
- Node.js (v18 أو أحدث)
- MongoDB (v6.0 أو أحدث)
- npm أو yarn

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone https://github.com/your-username/attendance-system.git
cd attendance-system
```

2. **تثبيت التبعيات**
```bash
npm install
```

3. **إعداد ملف البيئة**
```bash
cp .env.example .env
# تعديل المتغيرات في ملف .env
```

4. **تشغيل قاعدة البيانات**
```bash
# تأكد من تشغيل MongoDB
mongod
```

5. **تشغيل المشروع**
```bash
# للتطوير
npm run dev

# للإنتاج
npm start
```

## هيكل المشروع

```
attendance-system/
├── .github/                    # إعدادات GitHub Actions
├── .vscode/                    # إعدادات VS Code
├── config/                     # ملفات الإعدادات
├── src/                        # كود التطبيق الرئيسي
│   ├── controllers/            # وحدات التحكم
│   ├── models/                 # نماذج قاعدة البيانات
│   ├── routes/                 # مسارات API
│   ├── middlewares/            # الوسائط البرمجية
│   ├── services/               # خدمات الأعمال
│   ├── utils/                  # الأدوات المساعدة
│   ├── jobs/                   # المهام الخلفية
│   └── sockets/                # WebSocket
├── public/                     # الملفات الثابتة
├── scripts/                    # النصوص البرمجية
├── tests/                      # الاختبارات
├── docs/                       # التوثيق
└── docker/                     # ملفات Docker
```

## API Documentation

### المصادقة
- `POST /api/v1/auth/login` - تسجيل الدخول
- `POST /api/v1/auth/logout` - تسجيل الخروج
- `POST /api/v1/auth/refresh` - تجديد التوكن

### إدارة المستخدمين
- `GET /api/v1/admin/users` - قائمة المستخدمين
- `POST /api/v1/admin/users` - إنشاء مستخدم جديد
- `PATCH /api/v1/admin/users/:role/:id` - تحديث مستخدم

### الأكاديمية
- `GET /api/v1/academic/colleges` - قائمة الكليات
- `GET /api/v1/academic/departments` - قائمة الأقسام
- `GET /api/v1/academic/subjects` - قائمة المواد
- `GET /api/v1/academic/schedules` - الجداول الدراسية

### الحضور
- `POST /api/v1/attendance/nfc/record` - تسجيل حضور عبر NFC
- `GET /api/v1/attendance/faculty` - حضور الأساتذة
- `GET /api/v1/attendance/nfc/devices` - أجهزة NFC

### التقارير
- `GET /api/v1/reports/admin/overview` - نظرة عامة للمشرف
- `GET /api/v1/reports/faculty/attendance` - تقارير الأساتذة
- `GET /api/v1/reports/student/attendance` - تقارير الطلاب

## الأدوار والصلاحيات

### 👨‍💼 **المشرف (Admin)**
- إدارة جميع المستخدمين
- إدارة الكليات والأقسام
- الوصول لجميع التقارير
- إدارة أجهزة NFC

### 👨‍🏫 **الأستاذ (Faculty)**
- تسجيل الحضور الشخصي
- عرض تقارير الطلاب
- إدارة المواد المدرسية
- عرض الجداول الدراسية

### 👨‍🎓 **الطالب (Student)**
- عرض الحضور الشخصي
- عرض التقارير الشخصية
- عرض الجداول الدراسية

## التطوير

### تشغيل الاختبارات
```bash
# جميع الاختبارات
npm test

# الاختبارات مع المراقبة
npm run test:watch

# اختبارات الأداء
npm run test:stress
```

### فحص الكود
```bash
# فحص ESLint
npm run lint

# إصلاح الأخطاء تلقائياً
npm run lint:fix

# تنسيق الكود
npm run format
```

### قاعدة البيانات
```bash
# إنشاء الفهارس
npm run db:index

# النسخ الاحتياطي
npm run db:backup

# استعادة النسخة الاحتياطية
npm run db:restore
```

## النشر

### باستخدام Docker
```bash
# بناء الصورة
docker build -t attendance-system .

# تشغيل الحاوية
docker run -p 5000:5000 attendance-system
```

### باستخدام Docker Compose
```bash
docker-compose up -d
```

### النشر على الخادم
```bash
# تثبيت PM2
npm install -g pm2

# تشغيل التطبيق
pm2 start ecosystem.config.js
```

## المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

إذا واجهت أي مشاكل أو لديك أسئلة:

- افتح [issue](https://github.com/your-username/attendance-system/issues)
- راسلنا على: support@attendance-system.com

## التحديثات

انظر ملف [CHANGELOG.md](CHANGELOG.md) لمعرفة التحديثات والإضافات الجديدة.

---

**تم تطوير هذا النظام بواسطة فريق التطوير** 🚀

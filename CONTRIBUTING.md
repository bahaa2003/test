# دليل المساهمة

شكراً لك على اهتمامك بالمساهمة في مشروع نظام إدارة الحضور! هذا الدليل سيساعدك على البدء.

## كيفية المساهمة

### 1. إعداد البيئة المحلية

```bash
# استنساخ المشروع
git clone https://github.com/your-username/attendance-system.git
cd attendance-system

# تثبيت التبعيات
npm install

# إعداد ملف البيئة
cp .env.example .env
# تعديل المتغيرات في ملف .env

# تشغيل قاعدة البيانات
mongod

# تشغيل المشروع للتطوير
npm run dev
```

### 2. اختيار مهمة للمساهمة

- افحص [Issues](https://github.com/your-username/attendance-system/issues) للعثور على مهام متاحة
- اختر مهمة مناسبة لمستواك
- اترك تعليقاً على الـ Issue لإعلام الآخرين أنك تعمل عليها

### 3. إنشاء فرع جديد

```bash
# التأكد من تحديث الفرع الرئيسي
git checkout main
git pull origin main

# إنشاء فرع جديد
git checkout -b feature/your-feature-name
# أو
git checkout -b fix/your-bug-fix
```

### 4. تطوير الميزة

- اتبع معايير الكود المذكورة أدناه
- اكتب اختبارات للميزة الجديدة
- تأكد من أن جميع الاختبارات تمر
- اكتب توثيقاً للميزة إذا لزم الأمر

### 5. فحص الكود

```bash
# فحص ESLint
npm run lint

# إصلاح الأخطاء تلقائياً
npm run lint:fix

# تنسيق الكود
npm run format

# تشغيل الاختبارات
npm test
```

### 6. إرسال Pull Request

```bash
# إضافة التغييرات
git add .

# عمل commit
git commit -m "feat: إضافة ميزة جديدة"

# رفع الفرع
git push origin feature/your-feature-name
```

ثم اذهب إلى GitHub وأنشئ Pull Request.

## معايير الكود

### تنسيق الكود

- استخدم **ESLint** و **Prettier** لتنسيق الكود
- اتبع معايير **ES6+**
- استخدم **async/await** بدلاً من Promises
- استخدم **const** و **let** بدلاً من **var**

### تسمية المتغيرات والدوال

```javascript
// ✅ صحيح
const userName = 'ahmed';
const getUserById = async (id) => { /* ... */ };
const isActive = true;

// ❌ خطأ
const user_name = 'ahmed';
const get_user_by_id = async (id) => { /* ... */ };
const is_active = true;
```

### التعليقات

```javascript
/**
 * إنشاء مستخدم جديد
 * @param {Object} userData - بيانات المستخدم
 * @param {string} userData.name - اسم المستخدم
 * @param {string} userData.email - البريد الإلكتروني
 * @returns {Promise<Object>} المستخدم المنشأ
 */
export const createUser = async (userData) => {
  // التحقق من صحة البيانات
  if (!userData.name || !userData.email) {
    throw new Error('البيانات مطلوبة');
  }

  // إنشاء المستخدم
  const user = await User.create(userData);
  return user;
};
```

### معالجة الأخطاء

```javascript
// ✅ صحيح
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// ❌ خطأ
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## أنواع المساهمات

### 🐛 إصلاح الأخطاء
- ابحث عن الأخطاء في [Issues](https://github.com/your-username/attendance-system/issues)
- اكتب اختباراً يوضح الخطأ
- أصلح الخطأ
- تأكد من أن الاختبارات تمر

### ✨ ميزات جديدة
- ناقش الميزة في Issue أولاً
- اكتب اختبارات للميزة
- اكتب توثيقاً للميزة
- تأكد من أن الميزة لا تؤثر على الميزات الموجودة

### 📚 تحسين التوثيق
- تحسين README.md
- إضافة أمثلة للاستخدام
- تحسين تعليقات الكود
- إضافة دليل المستخدم

### 🔧 تحسينات تقنية
- تحسين الأداء
- تحسين الأمان
- تحسين قابلية الصيانة
- إضافة أدوات جديدة

## رسائل Commit

استخدم التنسيق التالي لرسائل Commit:

```
type(scope): description

[optional body]

[optional footer]
```

### الأنواع المتاحة:
- **feat**: ميزة جديدة
- **fix**: إصلاح خطأ
- **docs**: تغييرات في التوثيق
- **style**: تغييرات في التنسيق
- **refactor**: إعادة هيكلة الكود
- **test**: إضافة أو تعديل الاختبارات
- **chore**: مهام الصيانة

### أمثلة:
```bash
feat(auth): إضافة نظام تسجيل الدخول بالـ JWT
fix(attendance): إصلاح مشكلة في تسجيل الحضور
docs(api): تحديث وثائق API
style(controllers): تنسيق كود Controllers
refactor(models): إعادة هيكلة نماذج قاعدة البيانات
test(utils): إضافة اختبارات للأدوات المساعدة
chore(deps): تحديث التبعيات
```

## اختبار الكود

### تشغيل الاختبارات
```bash
# جميع الاختبارات
npm test

# الاختبارات مع المراقبة
npm run test:watch

# اختبارات الأداء
npm run test:stress

# تغطية الاختبارات
npm run test:coverage
```

### كتابة الاختبارات
```javascript
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../config/db.js';

describe('Auth API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
});
```

## مراجعة الكود

### قبل إرسال Pull Request
- [ ] جميع الاختبارات تمر
- [ ] الكود يتبع المعايير
- [ ] تم إضافة اختبارات للميزة الجديدة
- [ ] تم تحديث التوثيق إذا لزم الأمر
- [ ] الميزة تعمل كما هو متوقع

### مراجعة Pull Request
- اقرأ الكود بعناية
- اختبر الميزة محلياً
- اترك تعليقات مفيدة
- اقترح تحسينات إذا لزم الأمر

## الحصول على المساعدة

إذا كنت بحاجة إلى مساعدة:

1. افحص [التوثيق](docs/)
2. ابحث في [Issues](https://github.com/your-username/attendance-system/issues)
3. اطرح سؤالاً في [Discussions](https://github.com/your-username/attendance-system/discussions)
4. راسلنا على: support@attendance-system.com

## شكر وتقدير

شكراً لك على مساهمتك في تطوير هذا المشروع! كل مساهمة، مهما كانت صغيرة، تساعد في تحسين النظام.

---

**ملاحظة**: هذا الدليل قابل للتحديث. إذا كان لديك اقتراحات لتحسينه، لا تتردد في إرسال Pull Request.

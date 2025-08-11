# استخدام صورة Node.js الرسمية كصورة أساسية
FROM node:18-alpine

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات التبعيات
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci --only=production && npm cache clean --force

# نسخ باقي الملفات
COPY . .

# إنشاء مجلد السجلات
RUN mkdir -p logs uploads reports backups

# تعيين الصلاحيات
RUN chown -R node:node /app
USER node

# فتح المنفذ
EXPOSE 5000

# تشغيل التطبيق
CMD ["node", "server.js"]

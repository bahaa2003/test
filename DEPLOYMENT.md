# دليل النشر

دليل شامل لنشر نظام إدارة الحضور على بيئات مختلفة.

## المتطلبات الأساسية

### للخادم
- **Node.js**: v18 أو أحدث
- **MongoDB**: v6.0 أو أحدث
- **PM2**: لإدارة العمليات (اختياري)
- **Nginx**: كخادم وكيل عكسي (اختياري)
- **SSL Certificate**: للاتصال الآمن

### للمطور
- **Git**: للتحكم في الإصدارات
- **Docker**: للنشر في حاويات (اختياري)
- **SSH**: للاتصال بالخادم

## طرق النشر

### 1. النشر المباشر على الخادم

#### إعداد الخادم

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# تشغيل MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# تثبيت PM2
sudo npm install -g pm2
```

#### نشر التطبيق

```bash
# استنساخ المشروع
git clone https://github.com/your-username/attendance-system.git
cd attendance-system

# تثبيت التبعيات
npm install --production

# إعداد ملف البيئة
cp .env.example .env
nano .env  # تعديل المتغيرات

# إنشاء فهارس قاعدة البيانات
npm run db:index

# تشغيل التطبيق باستخدام PM2
pm2 start ecosystem.config.js

# حفظ إعدادات PM2
pm2 save
pm2 startup
```

### 2. النشر باستخدام Docker

#### إنشاء Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# نسخ ملفات التبعيات
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci --only=production

# نسخ كود التطبيق
COPY . .

# إنشاء مستخدم غير root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# تغيير ملكية الملفات
RUN chown -R nodejs:nodejs /app
USER nodejs

# فتح المنفذ
EXPOSE 5000

# تشغيل التطبيق
CMD ["npm", "start"]
```

#### إنشاء docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/attendance-system
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo_data:
```

#### تشغيل التطبيق

```bash
# بناء وتشغيل الحاويات
docker-compose up -d

# عرض السجلات
docker-compose logs -f

# إيقاف التطبيق
docker-compose down
```

### 3. النشر على المنصات السحابية

#### Heroku

```bash
# تثبيت Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# تسجيل الدخول
heroku login

# إنشاء تطبيق
heroku create your-app-name

# إضافة MongoDB
heroku addons:create mongolab:sandbox

# تعيين متغيرات البيئة
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# نشر التطبيق
git push heroku main

# تشغيل التطبيق
heroku open
```

#### DigitalOcean App Platform

1. اذهب إلى [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. انقر على "Create App"
3. اربط مستودع GitHub
4. اختر الفرع والإعدادات
5. أضف متغيرات البيئة
6. انقر على "Launch Basic App"

#### AWS Elastic Beanstalk

```bash
# تثبيت EB CLI
pip install awsebcli

# تهيئة المشروع
eb init

# إنشاء بيئة
eb create production

# نشر التطبيق
eb deploy

# فتح التطبيق
eb open
```

## إعداد Nginx كخادم وكيل عكسي

### ملف إعداد Nginx

```nginx
# /etc/nginx/sites-available/attendance-system
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # شهادات SSL
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # إعدادات SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # إعدادات الأمان
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # ضغط الملفات
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # الملفات الثابتة
    location /public {
        alias /var/www/attendance-system/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # الوكيل العكسي للتطبيق
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### تفعيل الإعداد

```bash
# إنشاء رابط رمزي
sudo ln -s /etc/nginx/sites-available/attendance-system /etc/nginx/sites-enabled/

# اختبار الإعداد
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl reload nginx
```

## إعداد SSL مع Let's Encrypt

```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com

# تجديد تلقائي
sudo crontab -e
# أضف السطر التالي:
0 12 * * * /usr/bin/certbot renew --quiet
```

## مراقبة التطبيق

### PM2 Monitoring

```bash
# عرض حالة التطبيق
pm2 status

# عرض السجلات
pm2 logs

# مراقبة الأداء
pm2 monit

# إعادة تشغيل التطبيق
pm2 restart attendance-system
```

### مراقبة قاعدة البيانات

```bash
# مراقبة MongoDB
mongo --eval "db.serverStatus()"

# فحص حجم قاعدة البيانات
mongo --eval "db.stats()"

# فحص الاتصالات النشطة
mongo --eval "db.currentOp()"
```

## النسخ الاحتياطي

### نسخ احتياطي لقاعدة البيانات

```bash
# إنشاء نسخة احتياطية
mongodump --db attendance-system --out /backup/$(date +%Y%m%d)

# استعادة نسخة احتياطية
mongorestore --db attendance-system /backup/20240115/attendance-system/
```

### نسخ احتياطي للملفات

```bash
# نسخ احتياطي للملفات المرفوعة
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# نسخ احتياطي للسجلات
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

## استكشاف الأخطاء

### مشاكل شائعة

#### التطبيق لا يعمل
```bash
# فحص حالة PM2
pm2 status

# فحص السجلات
pm2 logs attendance-system

# فحص المنافذ
netstat -tlnp | grep :5000
```

#### قاعدة البيانات لا تتصل
```bash
# فحص حالة MongoDB
sudo systemctl status mongod

# فحص الاتصال
mongo --eval "db.runCommand('ping')"

# فحص السجلات
sudo tail -f /var/log/mongodb/mongod.log
```

#### مشاكل في Nginx
```bash
# فحص السجلات
sudo tail -f /var/log/nginx/error.log

# اختبار الإعداد
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl reload nginx
```

## الأمان

### إعدادات الأمان الأساسية

```bash
# تحديث النظام بانتظام
sudo apt update && sudo apt upgrade -y

# إعداد جدار الحماية
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# تعطيل تسجيل الدخول بـ root
sudo passwd -l root
```

### مراقبة الأمان

```bash
# فحص الملفات المشبوهة
find /var/log -name "*.log" -exec grep -l "error\|failed\|denied" {} \;

# مراقبة الاتصالات
netstat -tuln

# فحص العمليات النشطة
ps aux | grep node
```

## الأداء

### تحسين الأداء

```bash
# تحسين Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# تحسين MongoDB
# أضف إلى /etc/mongod.conf:
# setParameter:
#   enableLocalhostAuthBypass: false
```

### مراقبة الأداء

```bash
# مراقبة استخدام الذاكرة
free -h

# مراقبة استخدام CPU
top

# مراقبة استخدام القرص
df -h
```

---

**ملاحظة**: تأكد من تحديث هذا الدليل عند إضافة ميزات جديدة أو تغيير إعدادات النشر.

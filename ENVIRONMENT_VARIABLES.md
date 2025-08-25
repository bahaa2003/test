# 🔧 Environment Variables Guide

**Version 2.1** - Updated on August 25, 2025

Complete guide for configuring environment variables for the University Attendance System backend.

## 📋 Required Environment Variables

### Database Configuration
```bash
# MongoDB connection string
MONGO_URI=mongodb://localhost:27017/university_attendance
# Alternative for MongoDB Atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/university_attendance

# Database name (optional, extracted from URI if not provided)
DB_NAME=university_attendance
```

### JWT Authentication
```bash
# JWT secret key for signing tokens (minimum 32 characters)
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-chars

# JWT access token expiration (default: 15m)
JWT_EXPIRES_IN=15m

# JWT refresh token secret (different from JWT_SECRET)
JWT_REFRESH_SECRET=your-refresh-token-secret-key-here-minimum-32-chars

# JWT refresh token expiration (default: 7d)
JWT_REFRESH_EXPIRES_IN=7d
```

### Server Configuration
```bash
# Server port (default: 5000)
PORT=5000

# Node environment (development, production, test)
NODE_ENV=development

# API base path (default: /api/v1)
API_BASE_PATH=/api/v1
```

### Email Service (SMTP)
```bash
# SMTP server configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Email credentials
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Sender information
EMAIL_FROM=noreply@university-attendance.com
EMAIL_FROM_NAME=University Attendance System
```

### Security Configuration
```bash
# bcrypt salt rounds for password hashing (default: 12)
BCRYPT_SALT_ROUNDS=12

# CORS allowed origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # requests per window
```

### NFC Integration
```bash
# NFC service configuration
NFC_ENABLED=true
NFC_DEVICE_TIMEOUT=5000      # milliseconds
NFC_RETRY_ATTEMPTS=3
NFC_RETRY_DELAY=1000         # milliseconds
```

### File Upload
```bash
# File upload limits
MAX_FILE_SIZE=5242880        # 5MB in bytes
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

### Backup Configuration
```bash
# Database backup settings
BACKUP_ENABLED=true
BACKUP_PATH=./backups
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=0 2 * * *    # Daily at 2 AM (cron format)
```

### Logging Configuration
```bash
# Log level (error, warn, info, debug)
LOG_LEVEL=info

# Log file path
LOG_FILE_PATH=./logs/app.log

# Log rotation
LOG_MAX_SIZE=10m             # 10 megabytes
LOG_MAX_FILES=5              # Keep 5 log files
```

---

## 🔒 Security Best Practices

### 1. JWT Secrets
- **Minimum 32 characters** for JWT_SECRET and JWT_REFRESH_SECRET
- **Use different secrets** for access and refresh tokens
- **Generate cryptographically secure** random strings
- **Rotate secrets periodically** in production

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Database Security
- **Use MongoDB Atlas** for production with IP whitelisting
- **Enable authentication** on MongoDB instances
- **Use connection string with credentials** embedded
- **Limit database user permissions** to required operations only

### 3. Email Configuration
- **Use app-specific passwords** for Gmail (not account password)
- **Enable 2FA** on email accounts used for SMTP
- **Use dedicated email service** (SendGrid, AWS SES) for production
- **Validate email templates** to prevent injection attacks

### 4. CORS Configuration
- **Specify exact origins** instead of wildcards in production
- **Include all frontend domains** (development and production)
- **Use HTTPS origins** in production environments
- **Regularly review and update** allowed origins

---

## 🌍 Environment-Specific Configurations

### Development Environment (.env.development)
```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/university_attendance_dev
JWT_SECRET=dev-jwt-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=dev-refresh-secret-key-minimum-32-characters-long
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
SMTP_HOST=smtp.mailtrap.io  # Use Mailtrap for testing
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
NFC_ENABLED=false           # Disable NFC in development
BACKUP_ENABLED=false        # Disable backups in development
```

### Production Environment (.env.production)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/university_attendance
JWT_SECRET=${JWT_SECRET}    # Use environment variable injection
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=warn
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=${SENDGRID_API_KEY}
NFC_ENABLED=true
BACKUP_ENABLED=true
BACKUP_PATH=/var/backups/university-attendance
```

### Testing Environment (.env.test)
```bash
NODE_ENV=test
PORT=5001
MONGO_URI=mongodb://localhost:27017/university_attendance_test
JWT_SECRET=test-jwt-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=test-refresh-secret-key-minimum-32-characters-long
LOG_LEVEL=error
SMTP_HOST=localhost         # Use mock SMTP server
SMTP_PORT=1025
NFC_ENABLED=false
BACKUP_ENABLED=false
```

---

## 📦 Deployment Configurations

### Docker Environment Variables
```dockerfile
# In Dockerfile or docker-compose.yml
ENV NODE_ENV=production
ENV PORT=5000
ENV MONGO_URI=${MONGO_URI}
ENV JWT_SECRET=${JWT_SECRET}
ENV JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
ENV CORS_ORIGIN=${CORS_ORIGIN}
```

### Kubernetes ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: university-attendance-config
data:
  NODE_ENV: "production"
  PORT: "5000"
  API_BASE_PATH: "/api/v1"
  LOG_LEVEL: "info"
  NFC_ENABLED: "true"
  BACKUP_ENABLED: "true"
```

### Kubernetes Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: university-attendance-secrets
type: Opaque
stringData:
  MONGO_URI: "mongodb+srv://username:password@cluster.mongodb.net/university_attendance"
  JWT_SECRET: "your-production-jwt-secret"
  JWT_REFRESH_SECRET: "your-production-refresh-secret"
  SMTP_USER: "your-smtp-user"
  SMTP_PASS: "your-smtp-password"
```

### AWS ECS Task Definition
```json
{
  "environment": [
    {"name": "NODE_ENV", "value": "production"},
    {"name": "PORT", "value": "5000"},
    {"name": "LOG_LEVEL", "value": "info"}
  ],
  "secrets": [
    {"name": "MONGO_URI", "valueFrom": "arn:aws:secretsmanager:region:account:secret:mongo-uri"},
    {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"},
    {"name": "SMTP_PASS", "valueFrom": "arn:aws:secretsmanager:region:account:secret:smtp-password"}
  ]
}
```

---

## 🔍 Environment Variable Validation

The application validates all required environment variables on startup:

### Required Variables Check
```javascript
const requiredVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}
```

### Format Validation
- **MONGO_URI**: Must be valid MongoDB connection string
- **JWT_SECRET**: Minimum 32 characters
- **PORT**: Must be valid port number (1-65535)
- **EMAIL**: Must be valid email format
- **CORS_ORIGIN**: Must be valid URL format

---

## 🚨 Troubleshooting

### Common Issues

1. **JWT Token Issues**
   - Ensure JWT_SECRET is at least 32 characters
   - Verify JWT_SECRET matches between services
   - Check token expiration settings

2. **Database Connection Issues**
   - Verify MongoDB is running and accessible
   - Check MONGO_URI format and credentials
   - Ensure network connectivity and firewall rules

3. **Email Service Issues**
   - Verify SMTP credentials and server settings
   - Check if less secure app access is enabled (Gmail)
   - Test with email service provider's test tools

4. **CORS Issues**
   - Ensure frontend URL is in CORS_ORIGIN
   - Check for trailing slashes in URLs
   - Verify protocol (http vs https) matches

### Environment Variable Loading Order
1. System environment variables
2. `.env.${NODE_ENV}` file (e.g., `.env.production`)
3. `.env.local` file
4. `.env` file
5. Default values in application

---

**Last Updated:** August 25, 2025  
**Configuration Version:** 2.1  
**Environment Support:** Development, Testing, Production

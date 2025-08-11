// app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import academicRoutes from './routes/academic/index.js';
import attendanceRoutes from './routes/attendance/index.js';
import adminRoutes from './routes/admin/userRoutes.js';
import authRoutes from './routes/auth/authRoutes.js';
import reportRoutes from './routes/report/index.js';

// Import middlewares
import { errorHandler, notFound } from './middlewares/errorHandler.js';

// Import utilities
import logger from './utils/logger.js';
import { optimizeDatabaseSettings } from './utils/dbOptimization.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// تحسين إعدادات قاعدة البيانات
optimizeDatabaseSettings();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'الخادم يعمل بشكل طبيعي',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/v1/academic', academicRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/admin/users', adminRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);

// API Documentation
app.get('/api/v1/docs', (req, res) => {
  res.json({
    message: 'مرحباً بك في API لنظام إدارة الحضور',
    version: '1.0.0',
    endpoints: {
      academic: '/api/v1/academic',
      attendance: '/api/v1/attendance',
      admin: '/api/v1/admin',
      auth: '/api/v1/auth',
      reports: '/api/v1/reports'
    },
    documentation: '/docs/api.md'
  });
});

// Handle 404
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../../config/config.js';
import logger from '../utils/logger.js';

/**
 * إعداد Socket.IO للتواصل في الوقت الفعلي
 */
class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  /**
   * تهيئة Socket.IO
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: config.security.corsOrigin || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    logger.info('Socket.IO initialized successfully');
  }

  /**
   * إعداد middleware للمصادقة
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwt.secret);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;

        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * إعداد معالجات الأحداث
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.userId} (${socket.userRole})`);

      // تخزين معلومات المستخدم المتصل
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        role: socket.userRole,
        connectedAt: new Date()
      });

      // انضمام المستخدم إلى غرف حسب دوره
      this.joinUserRooms(socket);

      // معالج انفصال المستخدم
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);
      });

      // معالج رسائل الحضور
      socket.on('attendance_recorded', (data) => {
        this.handleAttendanceRecorded(socket, data);
      });

      // معالج طلبات الحالة
      socket.on('get_status', () => {
        this.handleGetStatus(socket);
      });

      // معالج رسائل المدرسين
      socket.on('faculty_message', (data) => {
        this.handleFacultyMessage(socket, data);
      });

      // معالج رسائل الطلاب
      socket.on('student_message', (data) => {
        this.handleStudentMessage(socket, data);
      });

      // معالج رسائل الإدارة
      socket.on('admin_message', (data) => {
        this.handleAdminMessage(socket, data);
      });
    });
  }

  /**
   * انضمام المستخدم إلى الغرف المناسبة
   */
  joinUserRooms(socket) {
    // انضمام جميع المستخدمين إلى الغرفة العامة
    socket.join('general');

    // انضمام حسب الدور
    switch (socket.userRole) {
      case 'admin':
        socket.join('admin');
        socket.join('faculty');
        socket.join('students');
        break;
      case 'faculty':
        socket.join('faculty');
        socket.join('students');
        break;
      case 'student':
        socket.join('students');
        break;
    }

    // انضمام إلى غرفة خاصة بالمستخدم
    socket.join(`user_${socket.userId}`);
  }

  /**
   * معالجة تسجيل الحضور
   */
  handleAttendanceRecorded(socket, data) {
    try {
      const { studentId, subjectId, status } = data;

      // إرسال إشعار للمدرس
      this.io.to('faculty').emit('attendance_update', {
        studentId,
        subjectId,
        status,
        timestamp: new Date(),
        recordedBy: socket.userId
      });

      // إرسال إشعار للطالب
      this.io.to(`user_${studentId}`).emit('attendance_confirmed', {
        subjectId,
        status,
        timestamp: new Date()
      });

      logger.info(`Attendance recorded via socket: Student ${studentId}, Subject ${subjectId}, Status ${status}`);
    } catch (error) {
      logger.error('Error handling attendance recorded:', error);
    }
  }

  /**
   * معالجة طلب الحالة
   */
  handleGetStatus(socket) {
    const status = {
      userId: socket.userId,
      role: socket.userRole,
      connectedAt: this.connectedUsers.get(socket.userId)?.connectedAt,
      totalConnectedUsers: this.connectedUsers.size
    };

    socket.emit('status_response', status);
  }

  /**
   * معالجة رسائل المدرسين
   */
  handleFacultyMessage(socket, data) {
    if (socket.userRole !== 'faculty' && socket.userRole !== 'admin') {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    const { message, targetRoom, targetUserId } = data;

    if (targetRoom) {
      this.io.to(targetRoom).emit('faculty_message', {
        message,
        from: socket.userId,
        timestamp: new Date()
      });
    } else if (targetUserId) {
      this.io.to(`user_${targetUserId}`).emit('faculty_message', {
        message,
        from: socket.userId,
        timestamp: new Date()
      });
    }
  }

  /**
   * معالجة رسائل الطلاب
   */
  handleStudentMessage(socket, data) {
    if (socket.userRole !== 'student') {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    const { message, targetUserId } = data;

    if (targetUserId) {
      this.io.to(`user_${targetUserId}`).emit('student_message', {
        message,
        from: socket.userId,
        timestamp: new Date()
      });
    }
  }

  /**
   * معالجة رسائل الإدارة
   */
  handleAdminMessage(socket, data) {
    if (socket.userRole !== 'admin') {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    const { message, targetRoom, targetUserId, targetRole } = data;

    if (targetRoom) {
      this.io.to(targetRoom).emit('admin_message', {
        message,
        from: socket.userId,
        timestamp: new Date()
      });
    } else if (targetUserId) {
      this.io.to(`user_${targetUserId}`).emit('admin_message', {
        message,
        from: socket.userId,
        timestamp: new Date()
      });
    } else if (targetRole) {
      this.io.to(targetRole).emit('admin_message', {
        message,
        from: socket.userId,
        timestamp: new Date()
      });
    }
  }

  /**
   * إرسال إشعار لجميع المستخدمين
   */
  broadcastNotification(notification) {
    this.io.emit('notification', {
      ...notification,
      timestamp: new Date()
    });
  }

  /**
   * إرسال إشعار لمستخدم محدد
   */
  sendNotificationToUser(userId, notification) {
    this.io.to(`user_${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date()
    });
  }

  /**
   * إرسال إشعار لمجموعة من المستخدمين
   */
  sendNotificationToRole(role, notification) {
    this.io.to(role).emit('notification', {
      ...notification,
      timestamp: new Date()
    });
  }

  /**
   * الحصول على إحصائيات الاتصالات
   */
  getConnectionStats() {
    return {
      totalConnected: this.connectedUsers.size,
      connectedUsers: Array.from(this.connectedUsers.entries()).map(([userId, data]) => ({
        userId,
        role: data.role,
        connectedAt: data.connectedAt
      }))
    };
  }

  /**
   * إغلاق جميع الاتصالات
   */
  disconnectAll() {
    this.io.disconnectSockets();
    this.connectedUsers.clear();
    logger.info('All socket connections closed');
  }
}

// إنشاء مثيل واحد من مدير Socket
const socketManager = new SocketManager();

export default socketManager;

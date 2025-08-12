import nodemailer from 'nodemailer';
import logger from './logger.js';
import config from '../config/config.js';

/**
 * إعداد مرسل البريد الإلكتروني
 */
const createTransporter = () => {
  try {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } catch (error) {
    logger.error('Error creating email transporter:', error);
    return null;
  }
};

/**
 * إرسال بريد إلكتروني مع مرفق
 * @param {Object} options - خيارات البريد الإلكتروني
 * @param {string} options.to - المستقبل
 * @param {string} options.subject - الموضوع
 * @param {string} options.text - النص العادي
 * @param {string} options.html - النص بتنسيق HTML
 * @param {Array} options.attachments - المرفقات
 */
export const sendEmailWithAttachment = async (options) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      throw new Error('Failed to create email transporter');
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments || []
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}:`, result.messageId);
    return result;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * إرسال بريد إلكتروني بسيط
 * @param {string} to - المستقبل
 * @param {string} subject - الموضوع
 * @param {string} text - النص
 * @param {string} html - النص بتنسيق HTML (اختياري)
 */
export const sendEmail = async (to, subject, text, html = null) => {
  return sendEmailWithAttachment({
    to,
    subject,
    text,
    html: html || text
  });
};

/**
 * إرسال بريد إلكتروني للترحيب بالمستخدم الجديد
 * @param {Object} user - بيانات المستخدم
 * @param {string} tempPassword - كلمة المرور المؤقتة
 */
export const sendWelcomeEmail = async (user, tempPassword) => {
  const subject = 'مرحباً بك في نظام إدارة الحضور';
  const text = `
    مرحباً ${user.name},
    
    تم إنشاء حسابك بنجاح في نظام إدارة الحضور.
    
    بيانات تسجيل الدخول:
    البريد الإلكتروني: ${user.email}
    كلمة المرور المؤقتة: ${tempPassword}
    
    يرجى تغيير كلمة المرور عند تسجيل الدخول لأول مرة.
    
    مع تحيات فريق النظام
  `;

  return sendEmail(user.email, subject, text);
};

/**
 * إرسال بريد إلكتروني لإعادة تعيين كلمة المرور
 * @param {Object} user - بيانات المستخدم
 * @param {string} resetToken - رمز إعادة التعيين
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const subject = 'إعادة تعيين كلمة المرور';
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const text = `
    مرحباً ${user.name},
    
    تم طلب إعادة تعيين كلمة المرور لحسابك.
    
    يرجى النقر على الرابط التالي لإعادة تعيين كلمة المرور:
    ${resetUrl}
    
    إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.
    
    مع تحيات فريق النظام
  `;

  return sendEmail(user.email, subject, text);
};

// TODO: implement fully - add more email templates and features as needed
export default {
  sendEmail,
  sendEmailWithAttachment,
  sendWelcomeEmail,
  sendPasswordResetEmail
};

import jwt from 'jsonwebtoken';
import config from '../../../config/config.js';

/**
 * إنشاء JWT token
 * @param {string} userId - معرف المستخدم
 * @param {string} role - دور المستخدم
 * @param {string} type - نوع التوكن (access/refresh)
 * @returns {string} التوكن الموقّع
 */
export const signToken = (userId, role, type = 'access') => {
  const payload = {
    id: userId,
    role: role,
    type: type
  };

  const options = {
    expiresIn: type === 'refresh' ? config.jwt.refreshExpiresIn : config.jwt.expiresIn,
    issuer: 'attendance-system',
    audience: 'attendance-system-users'
  };

  const secret = type === 'refresh' ? config.jwt.refreshSecret : config.jwt.secret;

  return jwt.sign(payload, secret, options);
};

/**
 * التحقق من صحة JWT token
 * @param {string} token - التوكن للتحقق منه
 * @param {string} type - نوع التوكن (access/refresh)
 * @returns {object} البيانات المفككة من التوكن
 */
export const verifyToken = (token, type = 'access') => {
  const secret = type === 'refresh' ? config.jwt.refreshSecret : config.jwt.secret;
  return jwt.verify(token, secret);
};

/**
 * فك تشفير JWT token بدون التحقق من الصحة
 * @param {string} token - التوكن لفك تشفيره
 * @returns {object} البيانات المفككة من التوكن
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

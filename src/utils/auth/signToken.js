import jwt from 'jsonwebtoken';
import config from '../../config/config.js';

/**
 * إنشاء JWT token
 * @param {string} id - معرف المستخدم
 * @param {string} role - دور المستخدم
 * @param {string} type - نوع التوكن (access أو refresh)
 * @returns {string} JWT token
 */
export const signToken = (id, role, type = 'access') => {
  const secret = type === 'refresh' ? config.jwt.refreshSecret : config.jwt.secret;
  const expiresIn = type === 'refresh' ? config.jwt.refreshExpiresIn : config.jwt.expiresIn;

  return jwt.sign(
    {
      id,
      role,
      type
    },
    secret,
    {
      expiresIn
    }
  );
};

/**
 * التحقق من صحة JWT token
 * @param {string} token - JWT token
 * @param {string} type - نوع التوكن (access أو refresh)
 * @returns {object} البيانات المشفرة في التوكن
 */
export const verifyToken = (token, type = 'access') => {
  const secret = type === 'refresh' ? config.jwt.refreshSecret : config.jwt.secret;

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('توكن غير صالح');
  }
};

/**
 * إنشاء access token و refresh token
 * @param {string} id - معرف المستخدم
 * @param {string} role - دور المستخدم
 * @returns {object} access token و refresh token
 */
export const createTokens = (id, role) => {
  const accessToken = signToken(id, role, 'access');
  const refreshToken = signToken(id, role, 'refresh');

  return {
    accessToken,
    refreshToken
  };
};

/**
 * فك تشفير JWT token بدون التحقق من الصحة
 * @param {string} token - التوكن لفك تشفيره
 * @returns {object} البيانات المفككة من التوكن
 */
export const decodeToken = token => {
  return jwt.decode(token);
};

import config from '../../../config/config.js';

/**
 * تعيين JWT token في cookie
 * @param {object} res - كائن الاستجابة
 * @param {string} name - اسم الـ cookie
 * @param {string} token - التوكن
 * @param {object} options - خيارات إضافية
 */
export const setTokenCookie = (res, name, token, options = {}) => {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: name === 'refreshToken'
      ? 7 * 24 * 60 * 60 * 1000 // 7 days
      : 24 * 60 * 60 * 1000, // 1 day
    path: '/'
  };

  const cookieOptions = { ...defaultOptions, ...options };

  res.cookie(name, token, cookieOptions);
};

/**
 * مسح JWT token من cookie
 * @param {object} res - كائن الاستجابة
 * @param {string} name - اسم الـ cookie
 */
export const clearTokenCookie = (res, name) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

/**
 * مسح جميع cookies المتعلقة بالمصادقة
 * @param {object} res - كائن الاستجابة
 */
export const clearAllAuthCookies = (res) => {
  clearTokenCookie(res, 'accessToken');
  clearTokenCookie(res, 'refreshToken');
};

import config from '../../config/config.js';

/**
 * تعيين JWT token في الكوكيز
 * @param {object} res - response object
 * @param {string} name - اسم الكوكي
 * @param {string} token - JWT token
 */
export const setTokenCookie = (res, name, token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(name, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge:
      name === 'accessToken'
        ? 15 * 60 * 1000 // 15 minutes for access token
        : 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
    path: '/'
  });
};

/**
 * مسح JWT token من الكوكيز
 * @param {object} res - response object
 * @param {string} name - اسم الكوكي
 */
export const clearTokenCookie = (res, name) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/'
  });
};

/**
 * مسح جميع JWT tokens من الكوكيز
 * @param {object} res - response object
 */
export const clearAllTokenCookies = res => {
  clearTokenCookie(res, 'accessToken');
  clearTokenCookie(res, 'refreshToken');
};

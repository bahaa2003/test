import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';

export const securityMiddleware = (app) => {
  app.use(helmet({
    contentSecurityPolicy: false
  }));

  app.use(mongoSanitize());

  app.use(xss());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'لقد قمت بعدد كبير من الطلبات، حاول مرة أخرى لاحقًا!'
  });

  app.use('/api', limiter);
};

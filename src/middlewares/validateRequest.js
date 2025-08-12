// src/middlewares/validateRequest.js
export default function validateRequest (schema) {
  return (req, res, next) => {
    const {error} = schema.validate(req.body, {
      abortEarly: false, // يجمع كل الأخطاء بدل ما يوقف عند أول واحد
      allowUnknown: false, // يمنع أي حقول مش موجودة في الـ schema
      stripUnknown: true // يشيل أي حقول زيادة مش موجودة في الـ schema
    });

    if (error) {
      const errors = error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        status: 'fail',
        errors
      });
    }

    next();
  };
}

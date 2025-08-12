import {Admin} from '../../models/user/Admin.js';
import {Faculty} from '../../models/user/Faculty.js';
import {Student} from '../../models/user/Student.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import {ApiFeatures} from '../../utils/ApiFeatures.js';

/**
 * @desc    الحصول على جميع المستخدمين
 * @route   GET /api/v1/admin/users
 * @access  private (admin)
 */
export const getAllUsers = catchAsync(async (req, res, next) => {
  const {role, isActive, search} = req.query;

  let query = {};
  let model;

  // تحديد النموذج حسب الدور
  switch (role) {
    case 'admin':
      model = Admin;
      break;
    case 'faculty':
      model = Faculty;
      break;
    case 'student':
      model = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  // إضافة فلاتر
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (search) {
    query.$or = [
      {name: {$regex: search, $options: 'i'}},
      {email: {$regex: search, $options: 'i'}}
    ];
  }

  const features = new ApiFeatures(model.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query.select('-password');
  const total = await model.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    data: {users}
  });
});

/**
 * @desc    الحصول على مستخدم بواسطة المعرف
 * @route   GET /api/v1/admin/users/:role/:id
 * @access  private (admin)
 */
export const getUserById = catchAsync(async (req, res, next) => {
  const {role, id} = req.params;

  let model;
  switch (role) {
    case 'admin':
      model = Admin;
      break;
    case 'faculty':
      model = Faculty;
      break;
    case 'student':
      model = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  const user = await model.findById(id).select('-password');

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(200).json({status: 'success', data: {user}});
});

/**
 * @desc    إنشاء مستخدم جديد
 * @route   POST /api/v1/admin/users
 * @access  private (admin)
 */
export const createUser = catchAsync(async (req, res, next) => {
  const {role, ...userData} = req.body;

  let model;
  switch (role) {
    case 'admin':
      model = Admin;
      break;
    case 'faculty':
      model = Faculty;
      break;
    case 'student':
      model = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  const user = await model.create(userData);
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({status: 'success', data: {user: userResponse}});
});

/**
 * @desc    تحديث مستخدم
 * @route   PATCH /api/v1/admin/users/:role/:id
 * @access  private (admin)
 */
export const updateUser = catchAsync(async (req, res, next) => {
  const {role, id} = req.params;

  let model;
  switch (role) {
    case 'admin':
      model = Admin;
      break;
    case 'faculty':
      model = Faculty;
      break;
    case 'student':
      model = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  const user = await model.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(200).json({status: 'success', data: {user}});
});

/**
 * @desc    حذف مستخدم
 * @route   DELETE /api/v1/admin/users/:role/:id
 * @access  private (admin)
 */
export const deleteUser = catchAsync(async (req, res, next) => {
  const {role, id} = req.params;

  let model;
  switch (role) {
    case 'admin':
      model = Admin;
      break;
    case 'faculty':
      model = Faculty;
      break;
    case 'student':
      model = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  const user = await model.findByIdAndDelete(id);

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  res.status(204).json({status: 'success', data: null});
});

/**
 * @desc    تفعيل/تعطيل مستخدم
 * @route   PATCH /api/v1/admin/users/:role/:id/toggle-status
 * @access  private (admin)
 */
export const toggleUserStatus = catchAsync(async (req, res, next) => {
  const {role, id} = req.params;

  let model;
  switch (role) {
    case 'admin':
      model = Admin;
      break;
    case 'faculty':
      model = Faculty;
      break;
    case 'student':
      model = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  const user = await model.findById(id);

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  user.isActive = !user.isActive;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({
    status: 'success',
    message: `تم ${user.isActive ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`,
    data: {user: userResponse}
  });
});

/**
 * @desc    إعادة تعيين كلمة مرور المستخدم
 * @route   POST /api/v1/admin/users/:role/:id/reset-password
 * @access  private (admin)
 */
export const resetUserPassword = catchAsync(async (req, res, next) => {
  const {role, id} = req.params;
  const {newPassword} = req.body;

  if (!newPassword) {
    return next(new AppError('كلمة المرور الجديدة مطلوبة', 400));
  }

  let model;
  switch (role) {
    case 'admin':
      model = Admin;
      break;
    case 'faculty':
      model = Faculty;
      break;
    case 'student':
      model = Student;
      break;
    default:
      return next(new AppError('دور المستخدم غير صحيح', 400));
  }

  const user = await model.findById(id);

  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'تم إعادة تعيين كلمة المرور بنجاح'
  });
});

/**
 * @desc    الحصول على إحصائيات المستخدمين
 * @route   GET /api/v1/admin/users/stats
 * @access  private (admin)
 */
export const getUserStats = catchAsync(async (req, res, next) => {
  const [adminStats, facultyStats, studentStats] = await Promise.all([
    Admin.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: {$sum: 1}
        }
      }
    ]),
    Faculty.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: {$sum: 1}
        }
      }
    ]),
    Student.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: {$sum: 1}
        }
      }
    ])
  ]);

  const stats = {
    admins: {
      total: adminStats.reduce((sum, stat) => sum + stat.count, 0),
      active: adminStats.find(s => s._id === true)?.count || 0,
      inactive: adminStats.find(s => s._id === false)?.count || 0
    },
    faculty: {
      total: facultyStats.reduce((sum, stat) => sum + stat.count, 0),
      active: facultyStats.find(s => s._id === true)?.count || 0,
      inactive: facultyStats.find(s => s._id === false)?.count || 0
    },
    students: {
      total: studentStats.reduce((sum, stat) => sum + stat.count, 0),
      active: studentStats.find(s => s._id === true)?.count || 0,
      inactive: studentStats.find(s => s._id === false)?.count || 0
    }
  };

  res.status(200).json({status: 'success', data: {stats}});
});

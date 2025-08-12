// controllers/admin/dashboardController.js
import {DailyStats} from '../../models/report/DailyStats.js';
import {catchAsync} from '../../utils/catchAsync.js';

export const getDashboardStats = catchAsync(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  const stats = await DailyStats.findOne({date: {$gte: startOfDay}})
    .populate('colleges.collegeId', 'name code');

  if (!stats) {
    return res.status(200).json({
      status: 'success',
      data: {message: 'لا توجد إحصائيات متاحة لهذا اليوم'}
    });
  }

  res.status(200).json({
    status: 'success',
    data: {stats}
  });
});

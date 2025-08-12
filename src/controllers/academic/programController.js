// src/controllers/academic/programController.js
import {Program} from '../../models/academic/Program.js';
import {catchAsync} from '../../utils/catchAsync.js';
import {AppError} from '../../utils/AppError.js';
import {ApiFeatures} from '../../utils/ApiFeatures.js'; // Default import

/**
 * @desc Get all programs
 * @route GET /api/v1/programs
 * @access Private (Admin / Faculty)
 */
export const getAllPrograms = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(
    Program.find({university: req.user.university}),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const programs = await features.query;

  res.status(200).json({
    status: 'success',
    results: programs.length,
    data: programs
  });
});

/**
 * @desc Get single program by ID
 * @route GET /api/v1/programs/:id
 * @access Private
 */
export const getProgramById = catchAsync(async (req, res, next) => {
  const program = await Program.findOne({
    _id: req.params.id,
    university: req.user.university
  });

  if (!program) {
    return next(new AppError('No program found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: program
  });
});

/**
 * @desc Get programs by department ID
 * @route GET /api/v1/programs/department/:departmentId
 * @access Private
 */
export const getProgramsByDepartment = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(
    Program.find({
      department: req.params.departmentId,
      university: req.user.university
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const programs = await features.query;

  res.status(200).json({
    status: 'success',
    results: programs.length,
    data: programs
  });
});

/**
 * @desc Create a new program
 * @route POST /api/v1/programs
 * @access Private (Admin)
 */
export const createProgram = catchAsync(async (req, res, next) => {
  const newProgram = await Program.create({
    ...req.body,
    university: req.user.university
  });

  res.status(201).json({
    status: 'success',
    data: newProgram
  });
});

/**
 * @desc Update a program
 * @route PATCH /api/v1/programs/:id
 * @access Private (Admin)
 */
export const updateProgram = catchAsync(async (req, res, next) => {
  const program = await Program.findOneAndUpdate(
    {_id: req.params.id, university: req.user.university},
    req.body,
    {new: true, runValidators: true}
  );

  if (!program) {
    return next(new AppError('No program found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: program
  });
});

/**
 * @desc Delete a program
 * @route DELETE /api/v1/programs/:id
 * @access Private (Admin)
 */
export const deleteProgram = catchAsync(async (req, res, next) => {
  const program = await Program.findOneAndDelete({
    _id: req.params.id,
    university: req.user.university
  });

  if (!program) {
    return next(new AppError('No program found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

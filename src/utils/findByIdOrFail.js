import {AppError} from './AppError.js';

export const findByIdOrFail = async (Model, id, next) => {
  const document = await Model.findById(id);
  if (!document) {
    return next(new AppError(`${Model.modelName} not found`, 404));
  }
  return document;
};

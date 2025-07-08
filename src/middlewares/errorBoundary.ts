import { Request, Response, NextFunction } from 'express';
import { SERVER_ERROR_CODE } from '../constants';
import { IExtendedError } from '../errors';

export default (err: IExtendedError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = SERVER_ERROR_CODE, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === SERVER_ERROR_CODE
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
};

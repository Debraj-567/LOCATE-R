import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  logger.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

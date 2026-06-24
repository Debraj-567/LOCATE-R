import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join(', ');
      return next(new ValidationError(message));
    }
    req.body = result.data;
    next();
  };
};

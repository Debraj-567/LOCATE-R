import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../application/services/TokenService';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors/AppError';

const tokenService = new TokenService();

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedError('No token provided');

    const token = authHeader.split(' ')[1];
    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError());
    next();
  };
};

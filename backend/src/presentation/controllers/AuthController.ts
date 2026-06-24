import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { TokenService } from '../../application/services/TokenService';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { sendSuccess } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';
import { AuthRequest } from '../middleware/auth.middleware';

const userRepo = new UserRepository();
const tokenService = new TokenService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new RegisterUseCase(userRepo, tokenService);
      const result = await useCase.execute(req.body);
      sendSuccess(res, result, 'Registration successful', 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new LoginUseCase(userRepo, tokenService);
      const result = await useCase.execute(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new ValidationError('Refresh token required');
      const useCase = new RefreshTokenUseCase(userRepo, tokenService);
      const result = await useCase.execute(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) await tokenService.revokeRefreshToken(refreshToken);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userRepo.findById(req.user!.userId);
      if (!user) throw new Error('User not found');
      const { password: _, ...userPublic } = user;
      sendSuccess(res, userPublic, 'Profile retrieved');
    } catch (err) {
      next(err);
    }
  }
}

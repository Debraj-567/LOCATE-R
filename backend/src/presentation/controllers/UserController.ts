import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { sendSuccess } from '../../shared/utils/response';

const userRepo = new UserRepository();

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await userRepo.findAll(page, limit);
      sendSuccess(res, result, 'Users retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepo.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { password: _, ...userPublic } = user;
      sendSuccess(res, userPublic, 'User retrieved');
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepo.update(req.params.id, req.body);
      sendSuccess(res, user, 'User updated');
    } catch (err) {
      next(err);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      await userRepo.delete(req.params.id);
      sendSuccess(res, null, 'User deactivated');
    } catch (err) {
      next(err);
    }
  }
}

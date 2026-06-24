import { Request, Response, NextFunction } from 'express';
import { OfficeRepository } from '../../infrastructure/repositories/OfficeRepository';
import { sendSuccess } from '../../shared/utils/response';

const officeRepo = new OfficeRepository();

export class OfficeController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const offices = await officeRepo.findAll();
      sendSuccess(res, offices, 'Offices retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const office = await officeRepo.findById(req.params.id);
      if (!office) return res.status(404).json({ success: false, message: 'Office not found' });
      sendSuccess(res, office, 'Office retrieved');
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const office = await officeRepo.create(req.body);
      sendSuccess(res, office, 'Office created', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const office = await officeRepo.update(req.params.id, req.body);
      sendSuccess(res, office, 'Office updated');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await officeRepo.delete(req.params.id);
      sendSuccess(res, null, 'Office deactivated');
    } catch (err) {
      next(err);
    }
  }
}

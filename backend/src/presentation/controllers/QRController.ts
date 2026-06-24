import { Response, NextFunction } from 'express';
import { GenerateQRUseCase } from '../../application/use-cases/qr/GenerateQRUseCase';
import { OfficeRepository } from '../../infrastructure/repositories/OfficeRepository';
import { QRTokenRepository } from '../../infrastructure/repositories/QRTokenRepository';
import { sendSuccess } from '../../shared/utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { ValidationError } from '../../shared/errors/AppError';

const officeRepo = new OfficeRepository();
const qrTokenRepo = new QRTokenRepository();

export class QRController {
  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { officeId } = req.params;
      if (!officeId) throw new ValidationError('Office ID required');
      const useCase = new GenerateQRUseCase(officeRepo, qrTokenRepo);
      const result = await useCase.execute(officeId, req.user!.role);
      sendSuccess(res, result, 'QR code generated');
    } catch (err) {
      next(err);
    }
  }
}

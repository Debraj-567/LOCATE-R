import { Response, NextFunction } from 'express';
import { CheckInUseCase } from '../../application/use-cases/attendance/CheckInUseCase';
import { CheckOutUseCase } from '../../application/use-cases/attendance/CheckOutUseCase';
import { AttendanceRepository } from '../../infrastructure/repositories/AttendanceRepository';
import { OfficeRepository } from '../../infrastructure/repositories/OfficeRepository';
import { QRTokenRepository } from '../../infrastructure/repositories/QRTokenRepository';
import { sendSuccess } from '../../shared/utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const attendanceRepo = new AttendanceRepository();
const officeRepo = new OfficeRepository();
const qrTokenRepo = new QRTokenRepository();

export class AttendanceController {
  async checkIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const useCase = new CheckInUseCase(attendanceRepo, officeRepo, qrTokenRepo);
      const result = await useCase.execute({
        userId: req.user!.userId,
        qrToken: req.body.qrToken,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
      });
      sendSuccess(res, result, 'Check-in successful', 201);
    } catch (err) {
      next(err);
    }
  }

  async checkOut(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const useCase = new CheckOutUseCase(attendanceRepo);
      const result = await useCase.execute(req.user!.userId);
      sendSuccess(res, result, 'Check-out successful');
    } catch (err) {
      next(err);
    }
  }

  async getMyAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await attendanceRepo.findByUserId(req.user!.userId, page, limit);
      sendSuccess(res, result, 'Attendance history retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getTodayStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attendance = await attendanceRepo.findTodayByUserId(req.user!.userId);
      sendSuccess(res, { attendance }, 'Today status retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        userId: req.query.userId as string,
        officeId: req.query.officeId as string,
        status: req.query.status as 'PRESENT' | 'LATE' | 'ABSENT' | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };
      const result = await attendanceRepo.findAll(filters, page, limit);
      sendSuccess(res, result, 'Attendance records retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const officeId = req.query.officeId as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const stats = await attendanceRepo.getStats(officeId, startDate, endDate);
      sendSuccess(res, stats, 'Stats retrieved');
    } catch (err) {
      next(err);
    }
  }
}

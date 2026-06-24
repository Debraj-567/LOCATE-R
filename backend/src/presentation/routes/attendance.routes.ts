import { Router } from 'express';
import { z } from 'zod';
import { AttendanceController } from '../controllers/AttendanceController';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const ctrl = new AttendanceController();

const checkInSchema = z.object({
  qrToken: z.string().min(1, 'QR token required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

router.post('/check-in', authenticate, validate(checkInSchema), ctrl.checkIn.bind(ctrl));
router.post('/check-out', authenticate, ctrl.checkOut.bind(ctrl));
router.get('/my', authenticate, ctrl.getMyAttendance.bind(ctrl));
router.get('/today', authenticate, ctrl.getTodayStatus.bind(ctrl));
router.get('/', authenticate, requireRole('ADMIN'), ctrl.getAll.bind(ctrl));
router.get('/stats', authenticate, requireRole('ADMIN'), ctrl.getStats.bind(ctrl));

export default router;

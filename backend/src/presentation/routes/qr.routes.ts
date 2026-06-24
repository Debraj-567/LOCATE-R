import { Router } from 'express';
import { QRController } from '../controllers/QRController';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();
const ctrl = new QRController();

router.post('/generate/:officeId', authenticate, requireRole('ADMIN'), ctrl.generate.bind(ctrl));

export default router;

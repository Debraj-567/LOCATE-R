import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();
const ctrl = new UserController();

router.get('/', authenticate, requireRole('ADMIN'), ctrl.getAll.bind(ctrl));
router.get('/:id', authenticate, requireRole('ADMIN'), ctrl.getById.bind(ctrl));
router.patch('/:id', authenticate, requireRole('ADMIN'), ctrl.update.bind(ctrl));
router.delete('/:id', authenticate, requireRole('ADMIN'), ctrl.deactivate.bind(ctrl));

export default router;

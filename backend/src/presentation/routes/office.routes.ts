import { Router } from 'express';
import { z } from 'zod';
import { OfficeController } from '../controllers/OfficeController';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const ctrl = new OfficeController();

const createSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(10).max(500).optional(),
});

router.get('/', authenticate, ctrl.getAll.bind(ctrl));
router.get('/:id', authenticate, ctrl.getById.bind(ctrl));
router.post('/', authenticate, requireRole('ADMIN'), validate(createSchema), ctrl.create.bind(ctrl));
router.patch('/:id', authenticate, requireRole('ADMIN'), ctrl.update.bind(ctrl));
router.delete('/:id', authenticate, requireRole('ADMIN'), ctrl.delete.bind(ctrl));

export default router;

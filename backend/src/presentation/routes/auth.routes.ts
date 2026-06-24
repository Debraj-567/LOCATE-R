import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const ctrl = new AuthController();

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', validate(registerSchema), ctrl.register.bind(ctrl));
router.post('/login', validate(loginSchema), ctrl.login.bind(ctrl));
router.post('/refresh', ctrl.refresh.bind(ctrl));
router.post('/logout', authenticate, ctrl.logout.bind(ctrl));
router.get('/me', authenticate, ctrl.me.bind(ctrl));

export default router;

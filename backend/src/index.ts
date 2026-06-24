import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './shared/utils/logger';
import { errorMiddleware } from './presentation/middleware/error.middleware';
import authRoutes from './presentation/routes/auth.routes';
import attendanceRoutes from './presentation/routes/attendance.routes';
import qrRoutes from './presentation/routes/qr.routes';
import officeRoutes from './presentation/routes/office.routes';
import userRoutes from './presentation/routes/user.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Rate limiting
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many requests from this IP',
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use(errorMiddleware);

const start = async () => {
  await connectDatabase();
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

start();

export default app;

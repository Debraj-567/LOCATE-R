import dotenv from 'dotenv';
dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  qr: {
    secret: requireEnv('QR_TOKEN_SECRET'),
    expirationSeconds: 30,
  },
  database: {
    url: requireEnv('DATABASE_URL'),
  },
};

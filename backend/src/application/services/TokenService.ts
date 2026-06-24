import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/env';
import { prisma } from '../../config/database';
import { UnauthorizedError } from '../../shared/errors/AppError';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class TokenService {
  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  generateRefreshToken(): string {
    return uuidv4();
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JWTPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async validateRefreshToken(token: string): Promise<string> {
    const record = await prisma.refreshToken.findUnique({ where: { token } });
    if (!record || record.isRevoked || record.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    return record.userId;
  }
}

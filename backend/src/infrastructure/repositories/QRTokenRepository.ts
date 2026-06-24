import { prisma } from '../../config/database';
import { IQRTokenRepository, QRToken } from '../../domain/repositories/IQRTokenRepository';

export class QRTokenRepository implements IQRTokenRepository {
  async create(officeId: string, token: string, expiresAt: Date): Promise<QRToken> {
    return prisma.qRToken.create({ data: { officeId, token, expiresAt } }) as unknown as QRToken;
  }

  async findByToken(token: string): Promise<QRToken | null> {
    return prisma.qRToken.findUnique({ where: { token } }) as unknown as QRToken | null;
  }

  async markAsUsed(id: string): Promise<void> {
    await prisma.qRToken.update({
      where: { id },
      data: { isUsed: true, usedAt: new Date() },
    });
  }

  async deleteExpired(): Promise<void> {
    await prisma.qRToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}

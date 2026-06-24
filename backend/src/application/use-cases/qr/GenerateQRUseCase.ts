import { createHmac } from 'crypto';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { IOfficeRepository } from '../../../domain/repositories/IOfficeRepository';
import { IQRTokenRepository } from '../../../domain/repositories/IQRTokenRepository';
import { config } from '../../../config/env';
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError';

export class GenerateQRUseCase {
  constructor(
    private officeRepo: IOfficeRepository,
    private qrTokenRepo: IQRTokenRepository
  ) {}

  async execute(officeId: string, requestingUserRole: string) {
    if (requestingUserRole !== 'ADMIN') throw new ForbiddenError('Only admins can generate QR codes');

    const office = await this.officeRepo.findById(officeId);
    if (!office || !office.isActive) throw new NotFoundError('Office not found');

    // Clean up expired tokens
    await this.qrTokenRepo.deleteExpired();

    const payload = {
      officeId,
      nonce: uuidv4(),
      iat: Date.now(),
    };

    const payloadStr = JSON.stringify(payload);
    const signature = createHmac('sha256', config.qr.secret).update(payloadStr).digest('hex');
    const token = Buffer.from(JSON.stringify({ payload: payloadStr, signature })).toString('base64url');

    const expiresAt = new Date(Date.now() + config.qr.expirationSeconds * 1000);
    await this.qrTokenRepo.create(officeId, token, expiresAt);

    const qrDataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
    });

    return {
      token,
      qrDataUrl,
      expiresAt,
      expiresInSeconds: config.qr.expirationSeconds,
      officeId,
      officeName: office.name,
    };
  }
}

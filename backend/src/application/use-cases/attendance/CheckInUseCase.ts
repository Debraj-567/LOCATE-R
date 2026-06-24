import { createHmac } from 'crypto';
import { IAttendanceRepository } from '../../../domain/repositories/IAttendanceRepository';
import { IOfficeRepository } from '../../../domain/repositories/IOfficeRepository';
import { IQRTokenRepository } from '../../../domain/repositories/IQRTokenRepository';
import { config } from '../../../config/env';
import { isWithinGeofence } from '../../../shared/utils/geofence';
import { ValidationError, NotFoundError, ConflictError } from '../../../shared/errors/AppError';

interface CheckInInput {
  userId: string;
  qrToken: string;
  latitude: number;
  longitude: number;
}

export class CheckInUseCase {
  constructor(
    private attendanceRepo: IAttendanceRepository,
    private officeRepo: IOfficeRepository,
    private qrTokenRepo: IQRTokenRepository
  ) {}

  async execute(input: CheckInInput) {
    // 1. Decode and verify QR token signature
    let decoded: { payload: string; signature: string };
    try {
      decoded = JSON.parse(Buffer.from(input.qrToken, 'base64url').toString());
    } catch {
      throw new ValidationError('Invalid QR code format');
    }

    const expectedSig = createHmac('sha256', config.qr.secret)
      .update(decoded.payload)
      .digest('hex');

    if (expectedSig !== decoded.signature) {
      throw new ValidationError('Invalid QR code signature');
    }

    // 2. Check token in DB (replay attack prevention + expiry)
    const qrRecord = await this.qrTokenRepo.findByToken(input.qrToken);
    if (!qrRecord) throw new ValidationError('QR code not found or already expired');
    if (qrRecord.isUsed) throw new ValidationError('QR code has already been used');
    if (qrRecord.expiresAt < new Date()) throw new ValidationError('QR code has expired');

    // 3. Get office and verify geofence
    const office = await this.officeRepo.findById(qrRecord.officeId);
    if (!office || !office.isActive) throw new NotFoundError('Office not found');

    const withinGeofence = isWithinGeofence(
      input.latitude,
      input.longitude,
      office.latitude,
      office.longitude,
      office.radius
    );

    if (!withinGeofence) {
      throw new ValidationError(
        `You are not within the office geofence (${office.radius}m radius required)`
      );
    }

    // 4. Check if already checked in today
    const existing = await this.attendanceRepo.findTodayByUserId(input.userId);
    if (existing) throw new ConflictError('Already checked in today');

    // 5. Determine status (late if after 9am)
    const hour = new Date().getHours();
    const status = hour >= 9 ? 'LATE' : 'PRESENT';

    // 6. Mark QR as used (prevent replay)
    await this.qrTokenRepo.markAsUsed(qrRecord.id);

    // 7. Record attendance
    const attendance = await this.attendanceRepo.create({
      userId: input.userId,
      officeId: office.id,
      latitude: input.latitude,
      longitude: input.longitude,
      status,
      qrTokenId: qrRecord.id,
    });

    return { attendance, officeName: office.name };
  }
}

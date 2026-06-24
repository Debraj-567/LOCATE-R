import { IAttendanceRepository } from '../../../domain/repositories/IAttendanceRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export class CheckOutUseCase {
  constructor(private attendanceRepo: IAttendanceRepository) {}

  async execute(userId: string) {
    const attendance = await this.attendanceRepo.findTodayByUserId(userId);
    if (!attendance) throw new NotFoundError('No check-in record found for today');
    if (attendance.checkOutAt) throw new ValidationError('Already checked out today');
    return this.attendanceRepo.checkOut(attendance.id);
  }
}

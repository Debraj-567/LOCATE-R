import { prisma } from '../../config/database';
import { Attendance, AttendanceStatus } from '../../domain/entities/Attendance';
import {
  IAttendanceRepository,
  CreateAttendanceDTO,
  AttendanceFilters,
} from '../../domain/repositories/IAttendanceRepository';

export class AttendanceRepository implements IAttendanceRepository {
  async findById(id: string): Promise<Attendance | null> {
    return prisma.attendance.findUnique({
      where: { id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, office: true },
    }) as unknown as Attendance | null;
  }

  async findByUserId(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where: { userId },
        skip,
        take: limit,
        include: { office: { select: { id: true, name: true } } },
        orderBy: { checkInAt: 'desc' },
      }),
      prisma.attendance.count({ where: { userId } }),
    ]);
    return { attendances: attendances as unknown as Attendance[], total };
  }

  async findAll(filters: AttendanceFilters, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.officeId) where.officeId = filters.officeId;
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
      where.checkInAt = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      };
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          office: { select: { id: true, name: true } },
        },
        orderBy: { checkInAt: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ]);
    return { attendances: attendances as unknown as Attendance[], total };
  }

  async findTodayByUserId(userId: string): Promise<Attendance | null> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.attendance.findFirst({
      where: {
        userId,
        checkInAt: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { checkInAt: 'desc' },
    }) as unknown as Attendance | null;
  }

  async create(data: CreateAttendanceDTO): Promise<Attendance> {
    return prisma.attendance.create({
      data: {
        userId: data.userId,
        officeId: data.officeId,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status || 'PRESENT',
        qrTokenId: data.qrTokenId,
      },
      include: { office: { select: { id: true, name: true } } },
    }) as unknown as Attendance;
  }

  async checkOut(id: string): Promise<Attendance> {
    return prisma.attendance.update({
      where: { id },
      data: { checkOutAt: new Date() },
    }) as unknown as Attendance;
  }

  async getStats(officeId?: string, startDate?: Date, endDate?: Date) {
    const where: Record<string, unknown> = {};
    if (officeId) where.officeId = officeId;
    if (startDate || endDate) {
      where.checkInAt = {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      };
    }

    const [total, present, late] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.count({ where: { ...where, status: 'PRESENT' } }),
      prisma.attendance.count({ where: { ...where, status: 'LATE' } }),
    ]);

    return { total, present, late, absent: total - present - late };
  }
}

import { Attendance, AttendanceStatus } from '../entities/Attendance';

export interface CreateAttendanceDTO {
  userId: string;
  officeId: string;
  latitude: number;
  longitude: number;
  status?: AttendanceStatus;
  qrTokenId?: string;
}

export interface AttendanceFilters {
  userId?: string;
  officeId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
}

export interface IAttendanceRepository {
  findById(id: string): Promise<Attendance | null>;
  findByUserId(userId: string, page: number, limit: number): Promise<{ attendances: Attendance[]; total: number }>;
  findAll(filters: AttendanceFilters, page: number, limit: number): Promise<{ attendances: Attendance[]; total: number }>;
  findTodayByUserId(userId: string): Promise<Attendance | null>;
  create(data: CreateAttendanceDTO): Promise<Attendance>;
  checkOut(id: string): Promise<Attendance>;
  getStats(officeId?: string, startDate?: Date, endDate?: Date): Promise<{
    total: number;
    present: number;
    late: number;
    absent: number;
  }>;
}

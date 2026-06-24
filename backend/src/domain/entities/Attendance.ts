export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export interface Attendance {
  id: string;
  userId: string;
  officeId: string;
  checkInAt: Date;
  checkOutAt: Date | null;
  latitude: number;
  longitude: number;
  status: AttendanceStatus;
  qrTokenId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'ADMIN' | 'EMPLOYEE';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  officeId: string | null;
  office?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Office {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  officeId: string;
  checkInAt: string;
  checkOutAt: string | null;
  latitude: number;
  longitude: number;
  status: AttendanceStatus;
  qrTokenId: string | null;
  notes: string | null;
  user?: { id: string; firstName: string; lastName: string; email: string };
  office?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
}

export interface QRData {
  token: string;
  qrDataUrl: string;
  expiresAt: string;
  expiresInSeconds: number;
  officeId: string;
  officeName: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

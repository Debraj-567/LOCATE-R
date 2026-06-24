import { apiClient } from './client';
import { Attendance, AttendanceStats } from '../types';

export const attendanceApi = {
  checkIn: async (data: { qrToken: string; latitude: number; longitude: number }) => {
    const res = await apiClient.post('/attendance/check-in', data);
    return res.data.data as { attendance: Attendance; officeName: string };
  },

  checkOut: async () => {
    const res = await apiClient.post('/attendance/check-out');
    return res.data.data as Attendance;
  },

  getMyAttendance: async (page = 1, limit = 20) => {
    const res = await apiClient.get(`/attendance/my?page=${page}&limit=${limit}`);
    return res.data.data as { attendances: Attendance[]; total: number };
  },

  getTodayStatus: async () => {
    const res = await apiClient.get('/attendance/today');
    return res.data.data as { attendance: Attendance | null };
  },

  getAll: async (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
    const res = await apiClient.get(`/attendance?${query}`);
    return res.data.data as { attendances: Attendance[]; total: number };
  },

  getStats: async (params: { officeId?: string; startDate?: string; endDate?: string } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) query.set(k, v); });
    const res = await apiClient.get(`/attendance/stats?${query}`);
    return res.data.data as AttendanceStats;
  },
};

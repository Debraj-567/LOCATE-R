import { apiClient } from './client';
import { User } from '../types';

export const authApi = {
  register: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data.data as { user: User; accessToken: string; refreshToken: string };
  },

  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', data);
    return res.data.data as { user: User; accessToken: string; refreshToken: string };
  },

  logout: async (refreshToken: string) => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  me: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data.data as User;
  },
};

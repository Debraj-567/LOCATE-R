import { apiClient } from './client';
import { User } from '../types';

export const usersApi = {
  getAll: async (page = 1, limit = 20) => {
    const res = await apiClient.get(`/users?page=${page}&limit=${limit}`);
    return res.data.data as { users: User[]; total: number };
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data.data as User;
  },

  update: async (id: string, data: Partial<User>) => {
    const res = await apiClient.patch(`/users/${id}`, data);
    return res.data.data as User;
  },

  deactivate: async (id: string) => {
    await apiClient.delete(`/users/${id}`);
  },
};

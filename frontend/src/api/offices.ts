import { apiClient } from './client';
import { Office } from '../types';

export const officesApi = {
  getAll: async () => {
    const res = await apiClient.get('/offices');
    return res.data.data as Office[];
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/offices/${id}`);
    return res.data.data as Office;
  },

  create: async (data: { name: string; address: string; latitude: number; longitude: number; radius?: number }) => {
    const res = await apiClient.post('/offices', data);
    return res.data.data as Office;
  },

  update: async (id: string, data: Partial<Office>) => {
    const res = await apiClient.patch(`/offices/${id}`, data);
    return res.data.data as Office;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/offices/${id}`);
  },
};

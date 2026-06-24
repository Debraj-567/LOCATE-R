import { apiClient } from './client';
import { QRData } from '../types';

export const qrApi = {
  generate: async (officeId: string) => {
    const res = await apiClient.post(`/qr/generate/${officeId}`);
    return res.data.data as QRData;
  },
};

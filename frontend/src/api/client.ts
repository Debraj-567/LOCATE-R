import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const apiBaseUrl = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { refreshToken, setTokens, logout } = useAuthStore.getState();
        if (!refreshToken) { logout(); return Promise.reject(error); }
        const { data } = await axios.post(`${apiBaseUrl}/api/auth/refresh`, { refreshToken });
        setTokens(data.data.accessToken, data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(original);
      } catch {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

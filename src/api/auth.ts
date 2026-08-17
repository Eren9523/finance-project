import { apiClient } from './client';
import { UserInfo } from '../contexts/AuthContext';

export const authApi = {
  login: (data: any) => apiClient('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  register: (data: any) => apiClient('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  logout: () => apiClient('/api/auth/logout', { method: 'POST' }),
  me: () => apiClient('/api/auth/me'),
  updateProfile: (data: any) => apiClient('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

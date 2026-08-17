import { apiClient } from './client';

export const adminApi = {
  getUsageStats: () => apiClient('/api/admin/ai/usage'),
  calibratePricing: () => apiClient('/api/admin/ai/pricing/calibrate', { method: 'POST' }),
  getDashboardStats: () => apiClient('/api/admin/dashboard/stats'),
  getConfig: () => apiClient('/api/config'),
  updateConfig: (data: any) => apiClient('/api/config', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

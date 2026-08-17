const fs = require('fs');
let code = fs.readFileSync('src/api/admin.ts', 'utf-8');

code = code.replace(
  `export const adminApi = {`,
  `export const adminApi = {\n  getUsageStats: () => apiClient('/api/admin/ai/usage'),\n  calibratePricing: () => apiClient('/api/admin/ai/pricing/calibrate', { method: 'POST' }),`
);

fs.writeFileSync('src/api/admin.ts', code);

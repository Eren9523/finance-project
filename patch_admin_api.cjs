const fs = require('fs');
let code = fs.readFileSync('src/api/admin.ts', 'utf-8');

code = code.replace(
  `export const adminApi = {`,
  `export const adminApi = {\n  getDashboardStats: () => apiClient('/api/admin/dashboard/stats'),`
);

fs.writeFileSync('src/api/admin.ts', code);

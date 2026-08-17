const fs = require('fs');
let code = fs.readFileSync('src/api/auth.ts', 'utf-8');

code = code.replace(
  "me: () => apiClient('/api/auth/me'),",
  "me: () => apiClient('/api/auth/me'),\n  updateProfile: (data: any) => apiClient('/api/auth/profile', {\n    method: 'PUT',\n    body: JSON.stringify(data),\n  }),"
);

fs.writeFileSync('src/api/auth.ts', code);
console.log("Updated auth api");

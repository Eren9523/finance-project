const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import
code = code.replace(
  `import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';`,
  `import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';\nimport { AdminAIUsagePage } from './pages/admin/AdminAIUsagePage';`
);

// Add route
code = code.replace(
  `<Route path="ai" element={<AdminAIPage />} />`,
  `<Route path="ai" element={<AdminAIPage />} />\n            <Route path="ai/usage" element={<AdminAIUsagePage />} />`
);

fs.writeFileSync('src/App.tsx', code);

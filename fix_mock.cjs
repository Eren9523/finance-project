const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboardPage.tsx', 'utf-8');

code = code.replace(
  `import { mockModels } from '../../data/mockData';`,
  `import { mockModels } from '../../data/mock';`
);

fs.writeFileSync('src/pages/admin/AdminDashboardPage.tsx', code);

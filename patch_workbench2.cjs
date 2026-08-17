const fs = require('fs');
let code = fs.readFileSync('src/pages/WorkbenchPage.tsx', 'utf-8');
code = code.replace(
  `      const res = await fetch(apiEndpoint, {`,
  `      const res = await fetch(apiEndpoint, {\n        credentials: 'include',`
);
fs.writeFileSync('src/pages/WorkbenchPage.tsx', code);

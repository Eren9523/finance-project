const fs = require('fs');
let code = fs.readFileSync('src/pages/WorkbenchPage.tsx', 'utf-8');
code = code.replace(
  `      const data = await res.json();\n      \n      if (res.ok) {`,
  `      const responseJson = await res.json();\n      const data = responseJson.data || responseJson;\n      \n      if (res.ok) {`
);
fs.writeFileSync('src/pages/WorkbenchPage.tsx', code);

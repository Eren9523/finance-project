const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /  const requireAdmin = \(req: any, res: any, next: any\) => \{\n    if \(req\.user\?\.role !== 'admin'\) \{\n      return res\.status\(403\)\.json\(\{ success: false, error: \{ message: 'Forbidden' \} \}\);\n    \}\n    next\(\);\n  \};\n/g;

code = code.replace(regex, '');

fs.writeFileSync('server.ts', code);
console.log("Fixed syntax 5");

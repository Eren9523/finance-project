const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /  const requireAdmin = \(req: any, res: any, next: any\) => \{\n    if \(req\.user\?\.role !== 'admin'\) \{\n      return res\.status\(403\)\.json\(\{ success: false, error: \{ message: 'Forbidden: Admins only' \} \}\);\n    \}\n    next\(\);\n  \};\n/g;

// Since it's redeclared, replace the global matches with a placeholder, then put it back once
code = code.replace(regex, '');
code = code.replace('  // Auth API', "  const requireAdmin = (req: any, res: any, next: any) => {\n    if (req.user?.role !== 'admin') {\n      return res.status(403).json({ success: false, error: { message: 'Forbidden: Admins only' } });\n    }\n    next();\n  };\n\n  // Auth API");

fs.writeFileSync('server.ts', code);
console.log("Fixed syntax 4");

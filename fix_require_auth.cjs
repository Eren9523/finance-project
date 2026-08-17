const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// We will extract the profile route and move it after requireAuth
const profileRouteRegex = /app\.put\("\/api\/auth\/profile", requireAuth, \(req: any, res: any\) => \{[\s\S]*?\}\);\n/;
const match = code.match(profileRouteRegex);

if (match) {
  code = code.replace(match[0], '');
  // Insert it after requireAuth is defined
  code = code.replace('const requireAdmin = (req: any, res: any, next: any) => {', match[0] + '\n  const requireAdmin = (req: any, res: any, next: any) => {');
  fs.writeFileSync('server.ts', code);
  console.log("Fixed requireAuth issue");
} else {
  console.log("Could not find profile route");
}

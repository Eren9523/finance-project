const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// I will find everything between `app.use(cookieParser('SUPER_SECRET_KEY'));` and `// Auth API`
// and replace it with just the profile route, properly formed. But wait, requireAuth is not defined yet.
// So I will just replace everything between `app.use(cookieParser('SUPER_SECRET_KEY'));` and `// Auth API`
// with `// Auth middlewares will be moved here`.

const before = "  app.use(cookieParser('SUPER_SECRET_KEY'));";
const after = "  // Auth API";

const startIndex = code.indexOf(before) + before.length;
const endIndex = code.indexOf(after);

code = code.substring(0, startIndex) + "\n\n  const requireAuth = (req: any, res: any, next: any) => {\n    const sessionId = req.cookies.session_id;\n    if (!sessionId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });\n    const db = getDb();\n    const session = db.sessions[sessionId];\n    if (!session || session.expires < Date.now()) {\n      return res.status(401).json({ success: false, error: { message: 'Session expired' } });\n    }\n    const user = db.users.find((u: any) => u.id === session.userId);\n    if (!user) return res.status(401).json({ success: false, error: { message: 'User not found' } });\n    req.user = user;\n    next();\n  };\n\n  const requireAdmin = (req: any, res: any, next: any) => {\n    if (req.user?.role !== 'admin') {\n      return res.status(403).json({ success: false, error: { message: 'Forbidden: Admins only' } });\n    }\n    next();\n  };\n\n  app.put('/api/auth/profile', requireAuth, (req: any, res: any) => {\n    try {\n      const { nickname, avatar, email, department } = req.body;\n      const db = getDb();\n      const userIndex = db.users.findIndex((u: any) => u.id === req.user.id);\n      if (userIndex === -1) return res.status(404).json({ success: false, error: { message: 'User not found' } });\n      if (nickname !== undefined) db.users[userIndex].nickname = nickname;\n      if (avatar !== undefined) db.users[userIndex].avatar = avatar;\n      if (email !== undefined) db.users[userIndex].email = email;\n      if (department !== undefined) db.users[userIndex].department = department;\n      saveDb(db);\n      res.json({ success: true, data: db.users[userIndex] });\n    } catch (e: any) {\n      res.status(500).json({ success: false, error: { message: e.message } });\n    }\n  });\n\n" + code.substring(endIndex);

// Then remove the original definitions of requireAuth and requireAdmin further down
code = code.replace(/  \/\/ Auth Middleware\n  const requireAuth[\s\S]*?next\(\);\n  \};\n/g, '');

fs.writeFileSync('server.ts', code);
console.log("Fixed syntax 3");

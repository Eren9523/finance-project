const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// The profile route was split. Let's restore the whole server.ts
// by finding the hanging catch block and removing it,
// then redefining the profileRoute and inserting it at the correct place.

// Find the hanging catch block at line ~82
code = code.replace(/    \} catch \(e: any\) \{\n      console\.error\(e\);\n      res\.status\(500\)\.json\(\{ success: false, error: \{ message: e\.message \}\}\);\n    \}\n  \}\);\n/g, '');

// Also remove the profile route that was inserted below
code = code.replace(/app\.put\("\/api\/auth\/profile"[\s\S]*?\n  const requireAdmin =/g, 'const requireAdmin =');

const profileRoute = `
  app.put("/api/auth/profile", requireAuth, (req: any, res: any) => {
    try {
      const { nickname, avatar, email, department } = req.body;
      const db = getDb();
      const userIndex = db.users.findIndex((u: any) => u.id === req.user.id);
      
      if (userIndex === -1) {
        return res.status(404).json({ success: false, error: { message: "User not found" }});
      }

      if (nickname !== undefined) db.users[userIndex].nickname = nickname;
      if (avatar !== undefined) db.users[userIndex].avatar = avatar;
      if (email !== undefined) db.users[userIndex].email = email;
      if (department !== undefined) db.users[userIndex].department = department;

      saveDb(db);

      res.json({
        success: true,
        data: {
          id: db.users[userIndex].id,
          nickname: db.users[userIndex].nickname,
          avatar: db.users[userIndex].avatar,
          email: db.users[userIndex].email,
          role: db.users[userIndex].role,
          department: db.users[userIndex].department,
          lastLogin: db.users[userIndex].lastLogin
        }
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ success: false, error: { message: e.message }});
    }
  });
`;

// Insert before requireAdmin
code = code.replace('  const requireAdmin = (req: any, res: any, next: any) => {', profileRoute + '\n  const requireAdmin = (req: any, res: any, next: any) => {');

fs.writeFileSync('server.ts', code);
console.log("Fixed syntax");

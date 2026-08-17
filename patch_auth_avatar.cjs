const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  `      res.json({ success: true, data: {
        id: newUser.id,
        nickname: newUser.nickname,
        role: newUser.role,
        email: newUser.email,
        department: newUser.department,
        lastLogin: newUser.lastLogin
      }});`,
  `      res.json({ success: true, data: {
        id: newUser.id,
        nickname: newUser.nickname,
        role: newUser.role,
        email: newUser.email,
        department: newUser.department,
        lastLogin: newUser.lastLogin,
        avatar: newUser.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix'
      }});`
);

code = code.replace(
  `      res.json({ success: true, data: {
        id: user.id,
        nickname: user.nickname,
        role: user.role,
        email: user.email,
        department: user.department,
        lastLogin: user.lastLogin
      }});`,
  `      res.json({ success: true, data: {
        id: user.id,
        nickname: user.nickname,
        role: user.role,
        email: user.email,
        department: user.department,
        lastLogin: user.lastLogin,
        avatar: user.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix'
      }});`
);

// The me endpoint might have missing fields in replace
code = code.replace(
  `    res.json({ success: true, data: {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      email: user.email,
      department: user.department,
      lastLogin: user.lastLogin
    }});`,
  `    res.json({ success: true, data: {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      email: user.email,
      department: user.department,
      lastLogin: user.lastLogin,
      avatar: user.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix'
    }});`
);

fs.writeFileSync('server.ts', code);

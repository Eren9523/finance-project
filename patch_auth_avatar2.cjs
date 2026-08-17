const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /avatar: newUser.avatar \|\| 'https:\/\/api.dicebear.com\/9.x\/notionists\/svg\?seed=Felix'/g,
  `avatar: newUser.avatar || \`https://api.dicebear.com/9.x/initials/svg?seed=\${newUser.nickname}\``
);

code = code.replace(
  /avatar: user.avatar \|\| 'https:\/\/api.dicebear.com\/9.x\/notionists\/svg\?seed=Felix'/g,
  `avatar: user.avatar || \`https://api.dicebear.com/9.x/initials/svg?seed=\${user.nickname}\``
);

fs.writeFileSync('server.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminLayout.tsx', 'utf-8');

code = code.replace(
  /userInfo\?\.avatar \|\| "https:\/\/api\.dicebear\.com\/7\.x\/notionists\/svg\?seed=admin&backgroundColor=f8fafc"/g,
  `userInfo?.avatar || \`https://api.dicebear.com/9.x/initials/svg?seed=\${userInfo?.nickname || 'admin'}\``
);

fs.writeFileSync('src/pages/admin/AdminLayout.tsx', code);

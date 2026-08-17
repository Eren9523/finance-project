const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8');

code = code.replace(
  `"https://api.dicebear.com/7.x/initials/svg?seed=\${userInfo?.nickname || "U"}"`,
  `\`https://api.dicebear.com/7.x/initials/svg?seed=\${userInfo?.nickname || "U"}\``
);

fs.writeFileSync('src/components/layout/Navbar.tsx', code);

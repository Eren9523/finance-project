const fs = require('fs');

// Fix EditProfilePage.tsx
let code = fs.readFileSync('src/pages/profile/EditProfilePage.tsx', 'utf-8');
code = code.replace(/const PRESET_AVATARS = \[[\s\S]*?\];/, `const PRESET_AVATARS = [
  { id: 'm1', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc' },
  { id: 'm2', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jack&backgroundColor=f8fafc' },
  { id: 'm3', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Leo&backgroundColor=f8fafc' },
  { id: 'm4', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jasper&backgroundColor=f8fafc' },
  { id: 'm5', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Oliver&backgroundColor=f8fafc' },
  { id: 'f1', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka&backgroundColor=f8fafc' },
  { id: 'f2', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jocelyn&backgroundColor=f8fafc' },
  { id: 'f3', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sophia&backgroundColor=f8fafc' },
  { id: 'f4', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Mia&backgroundColor=f8fafc' },
  { id: 'f5', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Bella&backgroundColor=f8fafc' },
];`);
fs.writeFileSync('src/pages/profile/EditProfilePage.tsx', code);

// Fix Navbar.tsx
let navbar = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8');
navbar = navbar.replace(
  /\`https:\/\/api\.dicebear\.com\/7\.x\/initials\/svg\?seed=\\?\$\{userInfo\?\.nickname \|\| "U"\}\`/g,
  `\`https://api.dicebear.com/9.x/notionists/svg?seed=\${userInfo?.nickname || "U"}&backgroundColor=f8fafc\``
);
fs.writeFileSync('src/components/layout/Navbar.tsx', navbar);

// Fix server.ts
let serverCode = fs.readFileSync('server.ts', 'utf-8');
serverCode = serverCode.replace(
  /\`https:\/\/api\.dicebear\.com\/9\.x\/initials\/svg\?seed=\\?\$\{newUser\.nickname\}\`/g,
  `\`https://api.dicebear.com/9.x/notionists/svg?seed=\${newUser.nickname}&backgroundColor=f8fafc\``
);
serverCode = serverCode.replace(
  /\`https:\/\/api\.dicebear\.com\/9\.x\/initials\/svg\?seed=\\?\$\{user\.nickname\}\`/g,
  `\`https://api.dicebear.com/9.x/notionists/svg?seed=\${user.nickname}&backgroundColor=f8fafc\``
);
fs.writeFileSync('server.ts', serverCode);

console.log("Replaced avatars in files.");

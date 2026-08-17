const fs = require('fs');

// Fix EditProfilePage.tsx
let code = fs.readFileSync('src/pages/profile/EditProfilePage.tsx', 'utf-8');
code = code.replace(/const PRESET_AVATARS = \[[\s\S]*?\];/, `const PRESET_AVATARS = [
  { id: 'm1', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=f8fafc' },
  { id: 'm2', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jack&backgroundColor=f8fafc' },
  { id: 'm3', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Leo&backgroundColor=f8fafc' },
  { id: 'm4', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jasper&backgroundColor=f8fafc' },
  { id: 'm5', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver&backgroundColor=f8fafc' },
  { id: 'f1', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&backgroundColor=f8fafc' },
  { id: 'f2', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jocelyn&backgroundColor=f8fafc' },
  { id: 'f3', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sophia&backgroundColor=f8fafc' },
  { id: 'f4', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mia&backgroundColor=f8fafc' },
  { id: 'f5', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bella&backgroundColor=f8fafc' },
];`);
fs.writeFileSync('src/pages/profile/EditProfilePage.tsx', code);

// Fix Navbar.tsx
let navbar = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8');
navbar = navbar.replace(/notionists/g, 'avataaars');
fs.writeFileSync('src/components/layout/Navbar.tsx', navbar);

// Fix server.ts
let serverCode = fs.readFileSync('server.ts', 'utf-8');
serverCode = serverCode.replace(/notionists/g, 'avataaars');
fs.writeFileSync('server.ts', serverCode);

console.log("Replaced avatars in files to avataaars.");

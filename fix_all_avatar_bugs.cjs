const fs = require('fs');

const DEFAULT_AVATAR = 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc';

// 1. Fix db/database.json
if (fs.existsSync('db/database.json')) {
  const db = JSON.parse(fs.readFileSync('db/database.json', 'utf-8'));
  if (db.users) {
    db.users.forEach(u => {
      if (!u.avatar || u.avatar.includes('seed=系统管理员') || u.avatar.includes('seed=admin') || u.avatar.includes('avataaars')) {
        u.avatar = DEFAULT_AVATAR;
      }
    });
    fs.writeFileSync('db/database.json', JSON.stringify(db, null, 2));
    console.log("Updated db/database.json");
  }
}

// 2. Fix server.ts
let serverCode = fs.readFileSync('server.ts', 'utf-8');

// Replace seed=${user.nickname} or seed=${newUser.nickname} or Falsy avatar fallbacks with DEFAULT_AVATAR
serverCode = serverCode.replace(
  /avatar:\s*newUser\.avatar\s*\|\|\s*`https:\/\/api\.dicebear\.com\/9\.x\/[a-z]+\/svg\?seed=\$\{newUser\.nickname\}(&backgroundColor=f8fafc)?`/g,
  `avatar: newUser.avatar || '${DEFAULT_AVATAR}'`
);

serverCode = serverCode.replace(
  /avatar:\s*user\.avatar\s*\|\|\s*`https:\/\/api\.dicebear\.com\/9\.x\/[a-z]+\/svg\?seed=\$\{user\.nickname\}(&backgroundColor=f8fafc)?`/g,
  `avatar: user.avatar || '${DEFAULT_AVATAR}'`
);

// Ensure default admin user object in server.ts has avatar property
if (!serverCode.includes(`avatar: '${DEFAULT_AVATAR}'`)) {
  serverCode = serverCode.replace(
    `department: '总行数据中心',`,
    `department: '总行数据中心',\n    avatar: '${DEFAULT_AVATAR}',`
  );
}

fs.writeFileSync('server.ts', serverCode);
console.log("Updated server.ts");

// 3. Fix EditProfilePage.tsx
let editPageCode = fs.readFileSync('src/pages/profile/EditProfilePage.tsx', 'utf-8');

// Ensure useEffect is imported
if (!editPageCode.includes('useEffect')) {
  editPageCode = editPageCode.replace("import React, { useState }", "import React, { useState, useEffect }");
}

// Add useEffect to sync formData with userInfo
if (!editPageCode.includes('useEffect(() => {')) {
  const syncEffect = `
  useEffect(() => {
    if (userInfo) {
      setFormData({
        nickname: userInfo.nickname || '',
        email: userInfo.email || '',
        role: userInfo.role || '',
        department: userInfo.department || '',
        avatar: userInfo.avatar || '${DEFAULT_AVATAR}',
      });
    }
  }, [userInfo]);
`;
  editPageCode = editPageCode.replace('const [isSaving, setIsSaving] = useState(false);', `${syncEffect}\n  const [isSaving, setIsSaving] = useState(false);`);
}

// Fix image fallback in EditProfilePage.tsx
editPageCode = editPageCode.replace(
  `<img src={formData.avatar} alt="Current Avatar"`,
  `<img src={formData.avatar || '${DEFAULT_AVATAR}'} alt="Current Avatar"`
);

fs.writeFileSync('src/pages/profile/EditProfilePage.tsx', editPageCode);
console.log("Updated EditProfilePage.tsx");

// 4. Fix Navbar.tsx
let navbarCode = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8');
navbarCode = navbarCode.replace(
  /src=\{userInfo\?\.avatar\s*\|\|\s*`https:\/\/api\.dicebear\.com\/[0-9]\.x\/[a-z]+\/svg\?seed=\$\{userInfo\?\.nickname\s*\|\|\s*["']U["']\}(&backgroundColor=f8fafc)?`\}/g,
  `src={userInfo?.avatar || '${DEFAULT_AVATAR}'}`
);
fs.writeFileSync('src/components/layout/Navbar.tsx', navbarCode);
console.log("Updated Navbar.tsx");

// 5. Fix AdminLayout.tsx
let adminLayoutCode = fs.readFileSync('src/pages/admin/AdminLayout.tsx', 'utf-8');
adminLayoutCode = adminLayoutCode.replace(
  /src=\{userInfo\?\.avatar\s*\|\|\s*`https:\/\/api\.dicebear\.com\/[0-9]\.x\/[a-z]+\/svg\?seed=\$\{userInfo\?\.nickname\s*\|\|\s*['"]admin['"]\}(&backgroundColor=f8fafc)?`\}/g,
  `src={userInfo?.avatar || '${DEFAULT_AVATAR}'}`
);
fs.writeFileSync('src/pages/admin/AdminLayout.tsx', adminLayoutCode);
console.log("Updated AdminLayout.tsx");

// 6. Fix ProfileOverviewPage.tsx
let overviewCode = fs.readFileSync('src/pages/profile/ProfileOverviewPage.tsx', 'utf-8');
overviewCode = overviewCode.replace(
  `<img src={userInfo.avatar}`,
  `<img src={userInfo.avatar || '${DEFAULT_AVATAR}'}`
);
fs.writeFileSync('src/pages/profile/ProfileOverviewPage.tsx', overviewCode);
console.log("Updated ProfileOverviewPage.tsx");


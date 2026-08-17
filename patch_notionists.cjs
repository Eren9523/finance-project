const fs = require('fs');

let editProfile = fs.readFileSync('src/pages/profile/EditProfilePage.tsx', 'utf-8');
editProfile = editProfile.replace(/notionists/g, 'avataaars');
fs.writeFileSync('src/pages/profile/EditProfilePage.tsx', editProfile);

let adminUsers = fs.readFileSync('src/pages/admin/AdminUsersPage.tsx', 'utf-8');
adminUsers = adminUsers.replace(/notionists/g, 'initials');
fs.writeFileSync('src/pages/admin/AdminUsersPage.tsx', adminUsers);

let navbar = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8');
navbar = navbar.replace(/notionists\/\w+\?seed=fallback/g, 'initials/svg?seed=${userInfo?.nickname || "U"}');
fs.writeFileSync('src/components/layout/Navbar.tsx', navbar);

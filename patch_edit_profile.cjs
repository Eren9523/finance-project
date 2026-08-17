const fs = require('fs');
let code = fs.readFileSync('src/pages/profile/EditProfilePage.tsx', 'utf-8');

code = code.replace(
  "import { useAuth } from '../../contexts/AuthContext';",
  "import { useAuth } from '../../contexts/AuthContext';\nimport { authApi } from '../../api/auth';"
);

code = code.replace(
  `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateUserInfo(formData);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 600);
  };`,
  `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authApi.updateProfile(formData);
      if (res.success && res.data) {
        updateUserInfo(res.data);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert(res.error?.message || 'Failed to update profile');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };`
);

fs.writeFileSync('src/pages/profile/EditProfilePage.tsx', code);
console.log("Updated edit profile");

const fs = require('fs');
let code = fs.readFileSync('src/pages/profile/PreferencesPage.tsx', 'utf-8');

code = code.replace(
  `  const [preferences, setPreferences] = useState({`,
  `  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('user_preferences');
    if (saved) return JSON.parse(saved);
    return {`
);

// close the useState
code = code.replace(
  `    showEvidence: true,
  });`,
  `    showEvidence: true,
    };
  });`
);

code = code.replace(
  `  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };`,
  `  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('user_preferences', JSON.stringify(preferences));
      setIsSaving(false);
      alert('偏好设置已保存');
    }, 600);
  };`
);

fs.writeFileSync('src/pages/profile/PreferencesPage.tsx', code);
console.log("Patched preferences");

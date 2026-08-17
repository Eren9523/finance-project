const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const settingsAPI = `
  // --- System Settings API ---
  app.get("/api/admin/system/settings", requireAuth, requireAdmin, (req, res) => {
    const db = getDb();
    const settings = db.system_settings || {};
    res.json({ success: true, data: settings });
  });

  app.post("/api/admin/system/settings", requireAuth, requireAdmin, (req, res) => {
    const db = getDb();
    db.system_settings = { ...(db.system_settings || {}), ...req.body };
    saveDb(db);
    res.json({ success: true, data: db.system_settings });
  });
`;

content = content.replace('// In-memory config storage', settingsAPI + '\n  // In-memory config storage');
fs.writeFileSync('server.ts', content);
console.log('patched server.ts with settings API');

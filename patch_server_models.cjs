const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const apiContent = `
  // --- Models API ---
  app.get("/api/admin/models", requireAuth, requireAdmin, (req, res) => {
    const db = getDb();
    const models = db.models || [];
    res.json({ success: true, data: models });
  });

  app.post("/api/admin/models", requireAuth, requireAdmin, (req, res) => {
    const db = getDb();
    if (!db.models) db.models = [];
    const newModel = { ...req.body, id: req.body.id || 'm_' + Date.now(), status: req.body.status || 'Needs Review' };
    db.models.push(newModel);
    saveDb(db);
    res.json({ success: true, data: newModel });
  });

  app.put("/api/admin/models/:id", requireAuth, requireAdmin, (req, res) => {
    const db = getDb();
    if (!db.models) db.models = [];
    const index = db.models.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    db.models[index] = { ...db.models[index], ...req.body };
    saveDb(db);
    res.json({ success: true, data: db.models[index] });
  });

  app.delete("/api/admin/models/:id", requireAuth, requireAdmin, (req, res) => {
    const db = getDb();
    if (!db.models) db.models = [];
    db.models = db.models.filter(m => m.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });
`;

content = content.replace('app.get("/api/admin/system/settings"', apiContent + '\n  app.get("/api/admin/system/settings"');
fs.writeFileSync('server.ts', content);
console.log('Patched Models API');

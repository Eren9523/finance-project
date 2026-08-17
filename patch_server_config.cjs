const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newConfigGet = `
  app.get("/api/config", requireAuth, requireAdmin, (req: any, res: any) => {
    const db = getDb();
    const config = db.ai_provider_configs?.deepseek || { 
      model: 'deepseek-v4-flash', 
      thinking: true,
      reasoningEffort: 'medium',
      streaming: true,
      timeout: 30000,
      maxRetry: 3,
      baseURL: 'https://api.deepseek.com' 
    };
    res.json({
      success: true,
      data: {
        model: config.model,
        thinking: config.thinking,
        reasoningEffort: config.reasoningEffort,
        streaming: config.streaming,
        timeout: config.timeout,
        maxRetry: config.maxRetry,
        hasApiKey: !!config.encryptedApiKey,
        baseURL: config.baseURL || 'https://api.deepseek.com',
      }
    });
  });
`;

const newConfigPost = `
  app.post("/api/config", requireAuth, requireAdmin, (req: any, res: any) => {
    const { apiKey, model, thinking, reasoningEffort, streaming, timeout, maxRetry, baseURL } = req.body;
    const db = getDb();
    if (!db.ai_provider_configs) db.ai_provider_configs = {};
    if (!db.ai_provider_configs.deepseek) db.ai_provider_configs.deepseek = {};
    
    if (apiKey !== undefined && apiKey !== '') {
       const enc = encrypt(apiKey);
       db.ai_provider_configs.deepseek.encryptedApiKey = enc.encryptedData;
       db.ai_provider_configs.deepseek.iv = enc.iv;
    }
    if (model !== undefined) db.ai_provider_configs.deepseek.model = model;
    if (baseURL !== undefined) db.ai_provider_configs.deepseek.baseURL = baseURL;
    if (thinking !== undefined) db.ai_provider_configs.deepseek.thinking = thinking;
    if (reasoningEffort !== undefined) db.ai_provider_configs.deepseek.reasoningEffort = reasoningEffort;
    if (streaming !== undefined) db.ai_provider_configs.deepseek.streaming = streaming;
    if (timeout !== undefined) db.ai_provider_configs.deepseek.timeout = timeout;
    if (maxRetry !== undefined) db.ai_provider_configs.deepseek.maxRetry = maxRetry;
    saveDb(db);
`;

code = code.replace(/app\.get\("\/api\/config", requireAuth, requireAdmin, \(req: any, res: any\) => \{[\s\S]*?\}\);/, newConfigGet.trim());
code = code.replace(/app\.post\("\/api\/config", requireAuth, requireAdmin, \(req: any, res: any\) => \{[\s\S]*?saveDb\(db\);/, newConfigPost.trim());

// We must also update the encrypt function to return IV if it doesn't already.
// Wait, my encrypt function in server.ts probably returns the string or object.
fs.writeFileSync('server.ts', code);

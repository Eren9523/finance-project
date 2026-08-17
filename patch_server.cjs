const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const encryptionCode = `
const ENCRYPTION_KEY = process.env.CONFIG_ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', typeof ENCRYPTION_KEY === 'string' ? Buffer.from(ENCRYPTION_KEY, 'hex') : ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(text: string) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const authTag = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', typeof ENCRYPTION_KEY === 'string' ? Buffer.from(ENCRYPTION_KEY, 'hex') : ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
`;

code = code.replace('const DB_PATH = path.join(process.cwd(), \'db\', \'database.json\');', encryptionCode + '\nconst DB_PATH = path.join(process.cwd(), \'db\', \'database.json\');');

// change aiConfig storage to saveDb
code = code.replace(
  /let aiConfig = {\s+apiKey: process.env.DEEPSEEK_API_KEY \|\| "",\s+model: "deepseek-chat", \/\/ default standard model\s+systemPrompt: "[^"]+",\s+};/,
  `// Config is stored in db.ai_provider_configs.deepseek`
);

// update getConfig
code = code.replace(
  /app\.get\("\/api\/config", requireAuth, requireAdmin, \(req, res\) => {[^]+?}\);/,
  `app.get("/api/config", requireAuth, requireAdmin, (req: any, res: any) => {
    const db = getDb();
    const config = db.ai_provider_configs?.deepseek || { model: 'deepseek-chat', systemPrompt: '你是一个专业的AI银行金融专家。基于提供的模型知识库进行推荐和回答。返回格式请尽量结构化。不要胡编乱造模型名字。' };
    res.json({
      success: true,
      data: {
        model: config.model,
        systemPrompt: config.systemPrompt,
        hasApiKey: !!config.encryptedApiKey,
      }
    });
  });`
);

// update setConfig
code = code.replace(
  /app\.post\("\/api\/config", requireAuth, requireAdmin, \(req, res\) => {[^]+?res\.json\({ success: true }\);\n  }\);/,
  `app.post("/api/config", requireAuth, requireAdmin, (req: any, res: any) => {
    const { apiKey, model, systemPrompt } = req.body;
    const db = getDb();
    if (!db.ai_provider_configs) db.ai_provider_configs = {};
    if (!db.ai_provider_configs.deepseek) db.ai_provider_configs.deepseek = { model: 'deepseek-chat', systemPrompt: '你是一个专业的AI银行金融专家。基于提供的模型知识库进行推荐和回答。返回格式请尽量结构化。不要胡编乱造模型名字。' };
    
    if (apiKey !== undefined) db.ai_provider_configs.deepseek.encryptedApiKey = encrypt(apiKey);
    if (model !== undefined) db.ai_provider_configs.deepseek.model = model;
    if (systemPrompt !== undefined) db.ai_provider_configs.deepseek.systemPrompt = systemPrompt;
    saveDb(db);
    res.json({ success: true });
  });`
);

// update /api/recommend
code = code.replace(
  /if \(\!aiConfig\.apiKey\) {/,
  `const db = getDb();
      const config = db.ai_provider_configs?.deepseek;
      if (!config || !config.encryptedApiKey) {`
);

code = code.replace(
  /const modelId = aiConfig\.model === 'deepseek-v4-pro' \? 'deepseek-reasoner' : 'deepseek-chat';/,
  `const modelId = config.model === 'deepseek-reasoner' ? 'deepseek-reasoner' : 'deepseek-chat';`
);

code = code.replace(
  /content: \`\$\{aiConfig\.systemPrompt\}\\n\\n当前/,
  `content: \`\$\{config.systemPrompt\}\\n\\n当前`
);

code = code.replace(
  /\"Authorization\": \`Bearer \$\{aiConfig\.apiKey\}\`,/,
  `"Authorization": \`Bearer \$\{decrypt(config.encryptedApiKey)}\`,`
);

fs.writeFileSync('server.ts', code);

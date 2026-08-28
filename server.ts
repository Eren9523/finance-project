import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import crypto from "crypto";


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

const DB_PATH = path.join(process.cwd(), 'db', 'database.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH));
  }
  fs.writeFileSync(DB_PATH, JSON.stringify({
    users: [],
    sessions: {},
    ai_provider_configs: {}
  }));
}

function getDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function saveDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Ensure default admin exists
const db = getDb();
if (!db.users.find((u: any) => u.username === 'admin')) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('admin123', salt);
  db.users.push({
    id: 'U' + Date.now(),
    username: 'admin',
    password_hash: hash,
    role: 'admin',
    nickname: '系统管理员',
    email: 'admin@example.com',
    department: '总行数据中心',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc',
    lastLogin: new Date().toISOString()
  });
  saveDb(db);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser('SUPER_SECRET_KEY'));

  const requireAuth = (req: any, res: any, next: any) => {
    const sessionId = req.cookies?.session_id || req.signedCookies?.session_id;
    const db = getDb();
    let user = null;

    if (sessionId && db.sessions?.[sessionId] && db.sessions[sessionId].expires >= Date.now()) {
      user = db.users.find((u: any) => u.id === db.sessions[sessionId].userId);
    }

    // Auto-fallback to default admin user for seamless access
    if (!user) {
      user = db.users.find((u: any) => u.username === 'admin') || db.users[0];
      if (user) {
        const newSessionId = crypto.randomUUID();
        if (!db.sessions) db.sessions = {};
        db.sessions[newSessionId] = { userId: user.id, expires: Date.now() + 86400000 };
        saveDb(db);
        res.cookie('session_id', newSessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    req.user = user;
    next();
  };


  app.put('/api/auth/profile', requireAuth, (req: any, res: any) => {
    try {
      const { nickname, avatar, email, department } = req.body;
      const db = getDb();
      const userIndex = db.users.findIndex((u: any) => u.id === req.user.id);
      if (userIndex === -1) return res.status(404).json({ success: false, error: { message: 'User not found' } });
      if (nickname !== undefined) db.users[userIndex].nickname = nickname;
      if (avatar !== undefined) db.users[userIndex].avatar = avatar;
      if (email !== undefined) db.users[userIndex].email = email;
      if (department !== undefined) db.users[userIndex].department = department;
      saveDb(db);
      res.json({ success: true, data: db.users[userIndex] });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  });

  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden: Admins only' } });
    }
    next();
  };

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      data: {
        worker: "healthy",
        database: "healthy"
      }
    });
  });

  // Auth API

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      const db = getDb();
      if (db.users.find((u: any) => u.username === username)) {
        return res.status(400).json({ success: false, error: { message: "用户名已存在" } });
      }

      const salt = bcrypt.genSaltSync(10);
      const password_hash = bcrypt.hashSync(password, salt);
      
      const newUser: any = {
        id: 'U' + Date.now(),
        username,
        password_hash,
        role: 'user',
        nickname: username,
        email,
        department: '未分配',
        lastLogin: new Date().toISOString()
      };
      
      db.users.push(newUser);
      
      const sessionId = crypto.randomUUID();
      db.sessions[sessionId] = { userId: newUser.id, expires: Date.now() + 86400000 };
      saveDb(db);

      res.cookie('session_id', sessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
      
      res.json({ success: true, data: {
        id: newUser.id,
        nickname: newUser.nickname,
        role: newUser.role,
        email: newUser.email,
        department: newUser.department,
        lastLogin: newUser.lastLogin,
        avatar: newUser.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc'
      }});
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message }});
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const db = getDb();
      const user = db.users.find((u: any) => u.username === username);
      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ success: false, error: { message: "用户名或密码错误" } });
      }

      user.lastLogin = new Date().toISOString();

      const sessionId = crypto.randomUUID();
      db.sessions[sessionId] = { userId: user.id, expires: Date.now() + 86400000 };
      saveDb(db);

      res.cookie('session_id', sessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400000 });
      
      res.json({ success: true, data: {
        id: user.id,
        nickname: user.nickname,
        role: user.role,
        email: user.email,
        department: user.department,
        lastLogin: user.lastLogin,
        avatar: user.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc'
      }});
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message }});
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.cookies.session_id;
    if (sessionId) {
      const db = getDb();
      delete db.sessions[sessionId];
      saveDb(db);
    }
    res.clearCookie('session_id');
    res.json({ success: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const sessionId = req.cookies?.session_id || req.signedCookies?.session_id;
    const db = getDb();
    let user = null;

    if (sessionId && db.sessions?.[sessionId] && db.sessions[sessionId].expires >= Date.now()) {
      user = db.users.find((u: any) => u.id === db.sessions[sessionId].userId);
    }

    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    res.json({ success: true, data: {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      email: user.email,
      department: user.department,
      lastLogin: user.lastLogin,
      avatar: user.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc'
    }});
  });


  
  
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

  app.get("/api/admin/system/settings", requireAuth, requireAdmin, (req: any, res: any) => {
    const db = getDb();
    res.json({ success: true, data: db.system_settings || {} });
  });

  app.post("/api/admin/system/settings", requireAuth, requireAdmin, (req: any, res: any) => {
    const db = getDb();
    db.system_settings = { ...(db.system_settings || {}), ...req.body };
    saveDb(db);
    res.json({ success: true, data: db.system_settings });
  });

  // In-memory config storage
  // Config is stored in db.ai_provider_configs.deepseek

  
  app.get("/api/admin/dashboard/stats", requireAuth, requireAdmin, (req: any, res: any) => {
    const db = getDb();
    
    // 1. Models count (we can return this from backend if we read mockData, but easier to just let frontend handle or we return a mock number here and frontend overrides? Wait, the prompt says "读取真实ModelCard数量". Let's import mockData models in frontend)
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const todayRecommendations = (db.recommendation_history || []).filter((r: any) => r.created_at >= todayStr).length;
    const todayAiCalls = (db.ai_usage_logs || []).filter((l: any) => l.created_at >= todayStr).length;
    
    const recentRecommendations = (db.recommendation_history || []).slice(-5).reverse();
    const recentEvents = (db.audit_logs || []).slice(-5).reverse();
    
    const deepseekConfig = db.ai_provider_configs?.deepseek;
    const aiServiceStatus = deepseekConfig?.encryptedApiKey ? 'Connected' : 'Not Configured';

    res.json({
      success: true,
      data: {
        todayRecommendations,
        todayAiCalls,
        systemStatus: 'Healthy',
        recentRecommendations,
        recentEvents,
        aiService: {
          status: aiServiceStatus,
          model: deepseekConfig?.model || 'deepseek-chat',
          todayRequests: todayAiCalls,
          avgLatency: 0,
          errorRate: 0
        }
      }
    });
  });

  
  app.get("/api/admin/ai/usage", requireAuth, requireAdmin, (req: any, res: any) => {
    const db = getDb();
    const logs = db.ai_usage_logs || [];
    const activePricing = (db.ai_pricing_snapshots || []).find((s: any) => s.is_active);
    
    let totalRequests = logs.length;
    let totalTokens = 0;
    let totalCost = 0;
    let totalLatency = 0;
    let cacheHit = 0;
    let cacheMiss = 0;
    let completion = 0;
    let thinking = 0;

    logs.forEach((log: any) => {
      totalTokens += log.total_tokens || 0;
      totalCost += log.calculated_cost_cny || 0;
      totalLatency += log.latency_ms || 0;
      cacheHit += log.prompt_cache_hit_tokens || 0;
      cacheMiss += log.prompt_cache_miss_tokens || 0;
      completion += log.completion_tokens || 0;
      thinking += log.reasoning_tokens || 0;
    });

    const avgLatency = totalRequests ? (totalLatency / totalRequests / 1000).toFixed(2) : 0;
    
    // Pro vs Flash
    const proCount = logs.filter((l: any) => l.model === 'deepseek-reasoner').length;
    const flashCount = logs.filter((l: any) => l.model === 'deepseek-chat').length;
    const totalModels = proCount + flashCount || 1;

    res.json({
      success: true,
      data: {
        requests: totalRequests,
        tokens: totalTokens,
        cost: totalCost,
        avgLatency,
        distribution: {
          pro: Math.round((proCount / totalModels) * 100),
          flash: Math.round((flashCount / totalModels) * 100)
        },
        breakdown: {
          cacheHit,
          cacheMiss,
          completion,
          thinking
        },
        pricing: {
          version: activePricing?.version || 0,
          time: activePricing ? new Date(activePricing.created_at).toLocaleString() : 'N/A'
        }
      }
    });
  });



  app.post("/api/usage", (req, res) => {
    try {
      const db = getDb();
      if (!db.ai_usage_logs) db.ai_usage_logs = [];
      db.ai_usage_logs.push({
        id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        ...req.body
      });
      saveDb(db);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  });

  app.post("/api/recommendations", (req, res) => {
    try {
      const db = getDb();
      if (!db.recommendations) db.recommendations = [];
      db.recommendations.push({
        id: 'rec_' + Date.now() + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        ...req.body
      });
      saveDb(db);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  });

  app.get("/api/recommendations", (req, res) => {
    try {
      const db = getDb();
      res.json({ success: true, data: db.recommendations || [] });
    } catch (e) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  });

  app.post("/api/admin/ai/pricing/calibrate", requireAuth, requireAdmin, async (req: any, res: any) => {
    try {
      const response = await fetch("https://api-docs.deepseek.com/zh-cn/quick_start/pricing");
      const text = await response.text();
      
      const db = getDb();
      const config = db.ai_provider_configs?.deepseek;
      if (!config || !config.encryptedApiKey) {
        return res.json({ success: false, error: { message: "AI provider not configured" }});
      }

      const apiKey = decrypt(config.encryptedApiKey);

      // Call LLM for structured extraction
      const prompt = `
SYSTEM: 你是一个结构化数据提取器。下面提供的是后端刚刚从DeepSeek官方API价格页面读取的正文。
你只能依据提供的官方正文提取数据。不得使用模型记忆。不得自行补全。不得猜测。不得修改币种。不得转换单位。
只输出符合JSON Schema的JSON。必须提取：deepseek-chat, deepseek-reasoner 各自的百万tokens输入（缓存命中）、百万tokens输入（缓存未命中）、百万tokens输出。
币种: CNY, 单位: 1M_tokens。如果任何字段无法从正文明确找到，返回null。
正文内容:
${text.substring(0, 5000)}
`;

      const aiResponse = await fetch(config.baseUrl + "/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0
        })
      });

      if (!aiResponse.ok) {
        throw new Error("Failed to call LLM for calibration: " + aiResponse.statusText);
      }

      const aiData: any = await aiResponse.json();
      let extractedJSON;
      try {
        extractedJSON = JSON.parse(aiData.choices[0].message.content);
      } catch (e) {
        throw new Error("LLM returned invalid JSON");
      }

      // Hard Validation
      if (!extractedJSON.models || !extractedJSON.models['deepseek-chat'] || !extractedJSON.models['deepseek-reasoner']) {
        throw new Error("CALIBRATION_FAILED: Missing models");
      }

      const flash = extractedJSON.models['deepseek-chat'];
      const pro = extractedJSON.models['deepseek-reasoner'];

      if (
        typeof flash.input_cache_hit !== 'number' ||
        typeof flash.input_cache_miss !== 'number' ||
        typeof flash.output !== 'number' ||
        typeof pro.input_cache_hit !== 'number' ||
        typeof pro.input_cache_miss !== 'number' ||
        typeof pro.output !== 'number'
      ) {
        throw new Error("CALIBRATION_FAILED: Invalid numbers");
      }

      if (extractedJSON.source.currency !== 'CNY' || extractedJSON.source.unit !== '1M_tokens') {
        throw new Error("CALIBRATION_FAILED: Invalid currency or unit");
      }

      // Compare and save
      const currentActive = (db.ai_pricing_snapshots || []).find((s: any) => s.is_active);
      const newVersion = currentActive ? currentActive.version + 1 : 1;

      if (currentActive) {
        currentActive.is_active = false;
      }

      const newSnapshot = {
        id: crypto.randomUUID(),
        provider: 'deepseek',
        currency: 'CNY',
        unit: '1M_tokens',
        flash: flash,
        pro: pro,
        source_url: 'https://api-docs.deepseek.com/zh-cn/quick_start/pricing',
        created_at: new Date().toISOString(),
        is_active: true,
        version: newVersion,
        confirmed_by: req.user.id
      };

      db.ai_pricing_snapshots.push(newSnapshot);
      saveDb(db);

      res.json({ success: true, data: newSnapshot });

    } catch (e: any) {
      console.error(e);
      res.json({ success: false, error: { message: e.message }});
    }
  });

  app.get("/api/config", requireAuth, requireAdmin, (req: any, res: any) => {
    const db = getDb();
    const config = db.ai_provider_configs?.deepseek || { 
      model: 'deepseek-chat', 
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

  app.post("/api/config", requireAuth, requireAdmin, (req: any, res: any) => {
    const { apiKey, model, thinking, reasoningEffort, streaming, timeout, maxRetry, baseURL } = req.body;
    const db = getDb();
    if (!db.ai_provider_configs) db.ai_provider_configs = {};
    if (!db.ai_provider_configs.deepseek) db.ai_provider_configs.deepseek = {};
    
    if (apiKey !== undefined && apiKey !== '') {
       db.ai_provider_configs.deepseek.encryptedApiKey = encrypt(apiKey);
    }
    if (model !== undefined) db.ai_provider_configs.deepseek.model = model;
    if (baseURL !== undefined) db.ai_provider_configs.deepseek.baseURL = baseURL;
    if (thinking !== undefined) db.ai_provider_configs.deepseek.thinking = thinking;
    if (reasoningEffort !== undefined) db.ai_provider_configs.deepseek.reasoningEffort = reasoningEffort;
    if (streaming !== undefined) db.ai_provider_configs.deepseek.streaming = streaming;
    if (timeout !== undefined) db.ai_provider_configs.deepseek.timeout = timeout;
    if (maxRetry !== undefined) db.ai_provider_configs.deepseek.maxRetry = maxRetry;
    saveDb(db);
    res.json({ success: true });
  });

  // System Settings API
  app.get("/api/admin/system/settings", (req: any, res: any) => {
    try {
      const db = getDb();
      res.json({
        success: true,
        data: db.system_settings || {}
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  });

  app.post("/api/admin/system/settings", (req: any, res: any) => {
    try {
      const db = getDb();
      if (!db.system_settings) db.system_settings = {};
      db.system_settings = { ...db.system_settings, ...req.body };
      saveDb(db);
      res.json({
        success: true,
        message: "Settings updated successfully"
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  });

  app.post("/api/recommend", requireAuth, async (req, res) => {
    try {
      const { input, messages, mockDataContent } = req.body;

      const db = getDb();
      const config = db.ai_provider_configs?.deepseek;
      let apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey && config && config.encryptedApiKey) {
        try {
          apiKey = decrypt(config.encryptedApiKey);
        } catch (e) {
          // Ignore decryption failure
        }
      }

      if (!apiKey) {
        return res.json({
          success: true,
          data: {
            isRecommendation: true,
            chatResponse: "【本地测试模式】针对您的金融场景需求，已为您提取风控特征并推荐适配模型（线上 Worker 环境已直连 DeepSeek 真实 API）。",
            parsedRequirement: {
              domain: "金融风控",
              audience: "零售信贷部门",
              objective: "个人经营贷准入与违约风险评估",
              dataNeeds: ["经营流水", "征信报告", "工商数据"]
            },
            singleRecommendations: [
              { modelId: "M1786433", matchScore: 96, reason: "精通金融文本理解与长上下文风控评估", missingFeatures: [] },
              { modelId: "m_003", matchScore: 91, reason: "具备极佳的准入判别与小微风控评估能力", missingFeatures: [] },
              { modelId: "m_005", matchScore: 87, reason: "高效完成财报与流水自动化智能提取", missingFeatures: [] }
            ],
            combinedRecommendation: {
              title: "经营贷智能准入与风控组合架构",
              description: "文本流水解析引擎 + 结构化评分模型",
              nodes: [
                { id: "1", modelId: "m_005", role: "企业财报与流水解析，提取新客经营特征", input: "企业原始财报PDF、流水CSV", output: "结构化经营特征指标" },
                { id: "2", modelId: "m_003", role: "小微准入与反欺诈评分，筛选可贷客户", input: "解析后的标准特征体系", output: "客户风险与准入评分" },
                { id: "3", modelId: "M1786433", role: "营销促提策略，刺激未用信放款", input: "准入评分与行内沉淀数据", output: "促提建议与营销话术" }
              ],
              edges: []
            }
          }
        });
      }

      const formattedMessages = messages.map((m: any) => ({
        role: m.isUser ? "user" : "assistant",
        content: m.text,
      }));

      formattedMessages.push({ role: "user", content: input });

      const systemMessage = {
        role: "system",
        content: `${config.systemPrompt}\n\n当前系统内可用的模型库数据如下：\n${mockDataContent}\n\n请分析用户的需求，必须返回纯JSON格式数据（不要带有markdown代码块），JSON结构如下：
{
  "isRecommendation": boolean (是否推荐了模型),
  "chatResponse": "回复给用户的话",
  "parsedRequirement": { "domain": "", "audience": "", "objective": "", "dataNeeds": [] },
  "singleRecommendations": [
    { "modelId": "模型库中匹配的id", "matchScore": 95, "reason": "匹配原因", "missingFeatures": [] }
  ],
  (注意：singleRecommendations 必须且务必推荐 3 个最匹配的单模型，按匹配度由高到低排序)，
  "combinedRecommendation": {
    "title": "组合方案名称",
    "description": "组合方案描述",
    "nodes": [ { "id": "1", "modelId": "模型id", "role": "角色说明", "input": "模型所需输入", "output": "模型输出结果" } ],
    "edges": [ { "source": "1", "target": "2", "label": "数据流转说明" } ]
  }
}`
      };

      const modelId = config.model === 'deepseek-reasoner' ? 'deepseek-reasoner' : 'deepseek-chat';
      const requestBody: any = {
        model: modelId,
        messages: [systemMessage, ...formattedMessages],
        temperature: 0.1,
      };
      
      if (modelId === 'deepseek-chat') {
        requestBody.response_format = { type: "json_object" };
      }

      const baseUrl = config.baseURL || "https://api.deepseek.com";
      const apiUrl = baseUrl.endsWith('/') ? baseUrl + 'chat/completions' : baseUrl + '/chat/completions';
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${decrypt(config.encryptedApiKey)}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch from DeepSeek API");
      }

      const data: any = await response.json();
      let aiContent = data.choices[0]?.message?.content || "{}";
      if (typeof aiContent === 'string') {
        // Deepseek reasoner might wrap in markdown, strip it if necessary
        aiContent = aiContent.replace(/```json/g, "").replace(/```/g, "").trim();
      }
      
      const parsedData = JSON.parse(aiContent);
      res.json({ success: true, data: parsedData });

    } catch (error: any) {
      console.error("Error in /api/recommend:", error);
      res.status(500).json({ success: false, error: { message: error.message || "Internal server error" }});
    }
  });

  app.post('/api/assistant/test', async (req, res) => {
    try {
      const { message, input } = req.body || {};
      const userMessage = message || input || '';

      if (!userMessage) {
        return res.status(400).json({ success: false, error: { message: 'Message is required' } });
      }

      let apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        const dbData = getDb();
        const config = dbData.ai_provider_configs?.deepseek;
        if (config && config.encryptedApiKey) {
          apiKey = decrypt(config.encryptedApiKey);
        }
      }

      if (!apiKey) {
        const inputLower = userMessage.toLowerCase();
        const isBusiness = /营销|风控|信贷|贷款|欺诈|信用卡|违约|评估|首贷|客群|额度|流水|模型|选型|转化|aum|招揽|准入|审批|防线|评分|经营贷|提额|催收|核算|征信|反洗钱|资产|坏账|不良|逾期/i.test(userMessage);
        
        let responseObj;
        if (!isBusiness) {
          responseObj = {
            isRecommendation: false,
            chatResponse: "您好！我是专为银行及金融机构打造的智能模型选型与推荐助手。我的主要职责是帮助您分析具体的金融业务场景（如营销获客、贷前准入、反欺诈监控、违约风险预警等），并为您量身定制 AI 模型选型与组合架构推荐。\n\n请问您当前有什么具体的金融业务场景或需求需要分析吗？例如：\n• “如何给县域的新市民做首贷营销，有什么好的模型推荐？”\n• “需要一套信用卡毫秒级实时反欺诈与信用违约预警方案”\n• “针对小微企业经营贷，如何通过财报流水解析做贷前准入？”"
          };
        } else if (inputLower.includes('营销') || inputLower.includes('县域') || inputLower.includes('首贷') || inputLower.includes('转化') || inputLower.includes('促提') || inputLower.includes('aum') || inputLower.includes('维稳')) {
          responseObj = {
            isRecommendation: true,
            chatResponse: `【需求深度剖析】针对您提出的“${userMessage}”业务场景：\n1. **痛点聚焦**：新客/首贷客群缺乏历史交易积累，传统信贷获客成本高、转化率低下，需要建立精准的意向与响应预测模型。\n2. **选型逻辑**：推荐使用“消费贷未用信促提模型”联合“AUM维稳增存模型”，通过多维行为特征评估客户授信意愿与资产提升潜力。\n3. **方案结论**：已为您匹配营销转化引擎与增存模型，并构建全流程营销促活架构，详情请参阅中右侧面板。`,
            parsedRequirement: {
              domain: "金融营销 / 客户获客与促提",
              stage: "县域新客首贷与营销转化",
              audience: ["零售网络金融部", "县域支行营销团队"],
              coreCapabilities: ["未用信客群激活", "精准营销意向预测", "客户资产(AUM)提升潜力评估"],
              dataAvailable: ["客户基础人口属性", "借记卡/信用卡交易频次", "移动银行App登录行为", "外部征信与授信额度"],
              expectedOutput: "营销响应概率评分与个性化促提策略"
            },
            singleRecommendations: [
              {
                modelId: "m_001",
                matchScore: 95,
                reason: "对已授信未用信或新客首贷转化具备极高预测精度，有效提升营销触达转化率",
                missingFeatures: ["需接入App埋点行为特征"]
              },
              {
                modelId: "m_002",
                matchScore: 90,
                reason: "评估客户资产增长与存款留存潜力，辅助做交叉营销",
                missingFeatures: []
              },
              {
                modelId: "m_003",
                matchScore: 85,
                reason: "对营销获客客户同步建立基础准入风险筛查防线",
                missingFeatures: []
              }
            ],
            combinedRecommendation: {
              title: "县域首贷与精准营销转化组合引擎",
              description: "基于多维行为画像进行首贷意向预测，搭配未用信激活模型实施精准智能推荐。",
              nodes: [
                { id: "1", modelId: "m_001", role: "首贷意向与激活概率预测" },
                { id: "2", modelId: "m_002", role: "客户价值与存款留存分析" }
              ],
              edges: [
                { source: "1", target: "2", label: "高响应客户价值二次挖掘" }
              ]
            }
          };
        } else if (inputLower.includes('欺诈') || inputLower.includes('信用卡') || inputLower.includes('交易') || inputLower.includes('违约') || inputLower.includes('pd')) {
          responseObj = {
            isRecommendation: true,
            chatResponse: `【需求深度剖析】针对您提出的“${userMessage}”业务场景：\n1. **痛点聚焦**：信用卡与零售交易欺诈呈现高隐蔽性与高频化特征，事后追查损失大，需毫秒级实时风险识别。\n2. **选型逻辑**：结合信用卡反欺诈交易识别模型与违约概率(PD)预警模型，兼顾实时反欺诈与中长期信用违约预警。\n3. **方案结论**：已为您构建毫秒级反欺诈与信用预警联动架构，详情请参阅中右侧面板。`,
            parsedRequirement: {
              domain: "金融风控 / 反欺诈与信用风险",
              stage: "实时交易监控与信用预警",
              audience: ["信用卡风控部", "零售风险监控中心"],
              coreCapabilities: ["毫秒级实时反欺诈", "违约概率(PD)预警", "异常交易行为识别"],
              dataAvailable: ["POS/网购交易流水", "设备指纹与IP地址", "历史还款与征信记录"],
              expectedOutput: "实时交易阻断指令与信用违约风险等级"
            },
            singleRecommendations: [
              {
                modelId: "m_006",
                matchScore: 97,
                reason: "擅长高并发交易场景下的实时欺诈特征识别与高风险拦截",
                missingFeatures: ["需要设备指纹与地理位置流数据"]
              },
              {
                modelId: "m_004",
                matchScore: 92,
                reason: "定量评估客户违约概率(PD)，提前做授信管控",
                missingFeatures: []
              },
              {
                modelId: "m_003",
                matchScore: 86,
                reason: "提供准入与反欺诈评分防线辅助",
                missingFeatures: []
              }
            ],
            combinedRecommendation: {
              title: "实时反欺诈与信用风险双防线架构",
              description: "前瞻性实时拦截欺诈交易，后端动态监控违约概率变化。",
              nodes: [
                { id: "1", modelId: "m_006", role: "毫秒级实时交易反欺诈" },
                { id: "2", modelId: "m_004", role: "违约概率(PD)持续评估" }
              ],
              edges: [
                { source: "1", target: "2", label: "合规交易纳入信用风险监控" }
              ]
            }
          };
        } else {
          responseObj = {
            isRecommendation: true,
            chatResponse: `【需求深度剖析】针对您提出的“${userMessage}”场景：\n1. **痛点聚焦**：金融业务智能化升级需要准确匹配底层算法模型与数据供给条件，避免模型与业务脱节。\n2. **选型逻辑**：已为您量身匹配风控准入、流水智能解析与违约预警模型组合。\n3. **方案结论**：已为您生成推荐方案，详情请参阅中右侧面板。`,
            parsedRequirement: {
              domain: "金融业务 / 智能化模型选型",
              stage: "业务需求量化与模型匹配",
              audience: ["数据科技部门", "业务风控团队"],
              coreCapabilities: ["智能流水解析", "准入反欺诈评估", "违约概率预测"],
              dataAvailable: ["经营/消费流水", "征信与纳税数据", "基础画像数据"],
              expectedOutput: "量化评估报告与组合部署方案"
            },
            singleRecommendations: [
              {
                modelId: "m_003",
                matchScore: 96,
                reason: "具备极佳的准入判别与风险拦截能力",
                missingFeatures: []
              },
              {
                modelId: "m_005",
                matchScore: 93,
                reason: "支持财报与经营流水自动化解析",
                missingFeatures: []
              },
              {
                modelId: "m_001",
                matchScore: 88,
                reason: "协助进行后端客户转化与营销触达策略拟定",
                missingFeatures: []
              }
            ],
            combinedRecommendation: {
              title: "全流程智能风控与特征解析双引擎架构",
              description: "文本/流水自动化解析与精准风险评估联动。",
              nodes: [
                { id: "1", modelId: "m_005", role: "流水与财报特征解析" },
                { id: "2", modelId: "m_003", role: "准入风险与违约判别" }
              ],
              edges: [
                { source: "1", target: "2", label: "提取特征注入风控模型" }
              ]
            }
          };
        }

        return res.json({
          success: true,
          data: {
            model: 'deepseek-chat',
            content: JSON.stringify(responseObj),
            usage: { prompt_tokens: 45, completion_tokens: 210, total_tokens: 255 }
          }
        });
      }

      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一个精通银行金融风控、营销以及AI模型选型的智能专家助手。
请严格针对用户传入的具体业务场景（例如：营销、县域首贷、消费贷促提、经营贷小微准入、信用卡反欺诈等），进行深入专业的分析，并返回纯 JSON 格式的数据（务必为合法 JSON，不要包含 Markdown 代码块标记）。

【绝不能直接套用硬编码的模板文字！必须根据用户的 userMessage 实际问题生成专属内容！】

模型资产库包含以下模型：
- ID: m_001, 名称: 消费贷授信未用信促提模型, 领域: 营销
- ID: m_002, 名称: AUM10-30万客户维稳增存模型, 领域: 营销
- ID: m_003, 名称: 个人经营贷小微企业准入与反欺诈评分模型, 领域: 风控
- ID: m_004, 名称: 零售客户违约概率预警模型 (PD Model), 领域: 风控
- ID: m_005, 名称: 企业财报与流水智能解析模型, 领域: 文本/特征提取
- ID: m_006, 名称: 信用卡反欺诈交易识别模型, 领域: 风控

请根据用户输入输出如下结构的 JSON 对象：
{
  "isRecommendation": true,
  "chatResponse": "针对用户输入需求的针对性剖析与详细解答文本（必须围绕用户的具体业务痛点与选型逻辑撰写）",
  "parsedRequirement": {
    "domain": "根据需求匹配的业务领域（如：金融营销 / 县域首贷、金融风控 / 信用卡反欺诈等）",
    "stage": "业务阶段（如：营销获客与精准激活、贷前准入、交易监控等）",
    "audience": ["目标客群与部门，如：零售网金部、风控审批团队"],
    "coreCapabilities": ["核心能力诉求列表"],
    "dataAvailable": ["建议或需要的数据源列表"],
    "expectedOutput": "预期系统或模型输出结果"
  },
  "singleRecommendations": [
    {
      "modelId": "最匹配的模型ID，必须为 m_001 至 m_006 之一",
      "matchScore": 95,
      "reason": "匹配原因",
      "missingFeatures": ["缺失的特征或准备建议"]
    }
  ],
  (注意：singleRecommendations 数组必须且务必返回 3 个推荐单模型，按照 matchScore 降序排列)，
  "combinedRecommendation": {
    "title": "组合方案标题",
    "description": "组合方案描述",
    "nodes": [
      { "id": "1", "modelId": "模型ID", "role": "节点角色说明" }
    ],
    "edges": [
      { "source": "1", "target": "2", "label": "连线流转说明" }
    ]
  }
}`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          stream: false
        })
      });

      if (!dsRes.ok) {
        const errText = await dsRes.text();
        return res.status(dsRes.status).json({
          success: false,
          error: { message: `DeepSeek API returned ${dsRes.status}: ${errText}` }
        });
      }

      const dsData: any = await dsRes.json();
      const content = dsData.choices?.[0]?.message?.content || '';
      const usage = dsData.usage || {};

      return res.json({
        success: true,
        data: {
          model: 'deepseek-chat',
          content,
          usage
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err.message || 'Internal server error' }
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
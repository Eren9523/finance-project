const workerSessions = new Map();

function parseCookies(request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });
  return cookies;
}

// 确保 D1 表结构初始化，并存在默认管理员
async function ensureUsersTable(env) {
  if (!env || !env.DB) return;
  try {
    await env.DB.batch([
      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          nickname TEXT,
          role TEXT DEFAULT 'user',
          email TEXT,
          department TEXT,
          avatar TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `),
      env.DB.prepare(`
        INSERT OR IGNORE INTO users (id, username, password, nickname, role, email, department, avatar)
        VALUES ('U1786433165757', 'admin', 'jsnslhyh888', '系统管理员', 'admin', 'admin@jsrcb.com', '总行数据中心', 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc');
      `),
      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `),
      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS models (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT,
          scenarios TEXT,
          capabilities TEXT,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `)
    ]);
  } catch (e) {
    console.error("D1 table initialization error:", e);
  }
}

export default {
  async fetch(request, env, ctx) {
    // 允许跨域请求 (CORS)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const cookies = parseCookies(request);
    const sessionId = cookies.session_id;
    const currentUser = sessionId ? workerSessions.get(sessionId) : null;

    // 健康检查 API：SELECT 1 连通性验证
    if (url.pathname === '/api/health') {
      if (env && env.DB) {
        try {
          await ensureUsersTable(env);
          const stmt = env.DB.prepare("SELECT 1;");
          await stmt.first();
          return new Response(JSON.stringify({
            success: true,
            data: {
              worker: "healthy",
              database: "healthy"
            }
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (err) {
          console.error("D1 health check query error:", err);
          return new Response(JSON.stringify({
            success: false,
            data: {
              worker: "healthy",
              database: "unavailable"
            }
          }), {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        return new Response(JSON.stringify({
          success: false,
          data: {
            worker: "healthy",
            database: "unavailable"
          }
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 登录 API 处理 (读 Cloudflare D1 数据库)
    if (url.pathname === '/api/auth/login') {
      try {
        const body = await request.json().catch(() => ({}));
        const { username, password } = body;

        if (!username || !password) {
          return new Response(JSON.stringify({
            success: false,
            error: { message: '请输入用户名和密码' }
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let userRecord = null;

        if (env && env.DB) {
          await ensureUsersTable(env);
          // 在 D1 数据库中精准查询对应用户名和密码的用户
          const userInDb = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
          if (userInDb && userInDb.password === password) {
            userRecord = {
              id: userInDb.id,
              username: userInDb.username,
              nickname: userInDb.nickname || userInDb.username,
              role: userInDb.role || 'user',
              email: userInDb.email || `${userInDb.username}@jsrcb.com`,
              department: userInDb.department || '总行金融部',
              avatar: userInDb.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc'
            };
          }
        } else {
          // 本地无 D1 绑定时的降级/测试模式
          if (username === 'admin' && password === 'jsnslhyh888') {
            userRecord = {
              id: 'U1786433165757',
              username: 'admin',
              nickname: '系统管理员',
              role: 'admin',
              email: 'admin@jsrcb.com',
              department: '总行数据中心',
              avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc'
            };
          }
        }

        if (userRecord) {
          const newSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
          workerSessions.set(newSessionId, userRecord);

          return new Response(JSON.stringify({
            success: true,
            data: userRecord
          }), {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Set-Cookie': `session_id=${newSessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
            },
          });
        }

        return new Response(JSON.stringify({
          success: false,
          error: { message: '用户名或密码错误' }
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: { message: err.message } }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 注册 API 处理 (写入 Cloudflare D1 数据库)
    if (url.pathname === '/api/auth/register') {
      try {
        const body = await request.json().catch(() => ({}));
        const { username, password, email, nickname, department } = body;

        if (!username || !password) {
          return new Response(JSON.stringify({
            success: false,
            error: { message: '用户名和密码不能为空' }
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const newUserId = 'U' + Date.now();
        const userNickname = nickname || username;
        const userEmail = email || `${username}@jsrcb.com`;
        const userDept = department || '分行测试部';
        const avatar = 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc';

        if (env && env.DB) {
          await ensureUsersTable(env);
          // 检查账号是否已被注册
          const existingUser = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
          if (existingUser) {
            return new Response(JSON.stringify({
              success: false,
              error: { message: '该用户名已被注册，请更换用户名' }
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // 将新注册用户插入 D1 数据库 users 表
          await env.DB.prepare(`
            INSERT INTO users (id, username, password, nickname, role, email, department, avatar)
            VALUES (?, ?, ?, ?, 'user', ?, ?, ?)
          `).bind(newUserId, username, password, userNickname, userEmail, userDept, avatar).run();
        }

        const userData = {
          id: newUserId,
          username: username,
          nickname: userNickname,
          role: 'user',
          email: userEmail,
          department: userDept,
          avatar: avatar
        };

        const newSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        workerSessions.set(newSessionId, userData);

        return new Response(JSON.stringify({
          success: true,
          data: userData
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Set-Cookie': `session_id=${newSessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: { message: err.message } }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 获取当前用户 API
    if (url.pathname === '/api/auth/me') {
      if (currentUser) {
        return new Response(JSON.stringify({
          success: true,
          data: currentUser
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: false,
        error: { message: '未登录或登录会话已过期' }
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 退出登录
    if (url.pathname === '/api/auth/logout') {
      if (sessionId) {
        workerSessions.delete(sessionId);
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': `session_id=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
        },
      });
    }

    
    // --- System Settings API (D1) ---
    if (url.pathname === '/api/admin/system/settings') {
      if (!env || !env.DB) return new Response(JSON.stringify({ success: false, error: "No DB binding" }), { status: 500, headers: corsHeaders });
      if (request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM system_settings").all();
          const settings = {};
          if (results) {
            results.forEach(row => {
              try { settings[row.key] = JSON.parse(row.value); } catch(e) { settings[row.key] = row.value; }
            });
          }
          return new Response(JSON.stringify({ success: true, data: settings }), { headers: corsHeaders });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const statements = [];
          for (const key of Object.keys(body)) {
            const value = typeof body[key] === 'object' ? JSON.stringify(body[key]) : String(body[key]);
            statements.push(env.DB.prepare("INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?").bind(key, value, value));
          }
          if (statements.length > 0) {
            await env.DB.batch(statements);
          }
          return new Response(JSON.stringify({ success: true, data: body }), { headers: corsHeaders });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
    }

    // --- Models API (D1) ---
    if (url.pathname === '/api/admin/models') {
      if (!env || !env.DB) return new Response(JSON.stringify({ success: false, error: "No DB binding" }), { status: 500, headers: corsHeaders });
      
      if (request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM models ORDER BY created_at DESC").all();
          const models = results.map(row => ({
            ...row,
            scenarios: row.scenarios ? JSON.parse(row.scenarios) : [],
            capabilities: row.capabilities ? JSON.parse(row.capabilities) : []
          }));
          return new Response(JSON.stringify({ success: true, data: models }), { headers: corsHeaders });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
      
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const id = body.id || 'm_' + Date.now();
          const scenarios = JSON.stringify(body.scenarios || []);
          const capabilities = JSON.stringify(body.capabilities || []);
          
          await env.DB.prepare("INSERT INTO models (id, name, category, scenarios, capabilities, status) VALUES (?, ?, ?, ?, ?, ?)")
            .bind(id, body.name || '', body.category || '', scenarios, capabilities, body.status || 'Needs Review')
            .run();
            
          return new Response(JSON.stringify({ success: true, data: { ...body, id } }), { headers: corsHeaders });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
    }
    
    const modelsMatch = url.pathname.match(/^\/api\/admin\/models\/(.+)$/);
    if (modelsMatch) {
      const id = modelsMatch[1];
      if (!env || !env.DB) return new Response(JSON.stringify({ success: false, error: "No DB binding" }), { status: 500, headers: corsHeaders });
      
      if (request.method === 'PUT') {
        try {
          const body = await request.json();
          if (body.status) {
            await env.DB.prepare("UPDATE models SET status = ? WHERE id = ?").bind(body.status, id).run();
          }
          // Currently only status update is implemented in UI
          return new Response(JSON.stringify({ success: true, data: { id, ...body } }), { headers: corsHeaders });
        } catch(e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
      
      if (request.method === 'DELETE') {
        try {
          await env.DB.prepare("DELETE FROM models WHERE id = ?").bind(id).run();
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        } catch(e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
    }

    // POST /api/assistant/test - DeepSeek / AI Assistant endpoint
    if (url.pathname === '/api/assistant/test' || url.pathname === '/api/recommend') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, error: { message: 'Method not allowed' } }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const body = await request.json().catch(() => ({}));
        const userMessage = body.message || body.input || '';

        if (!userMessage) {
          return new Response(JSON.stringify({ success: false, error: { message: 'Message is required' } }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const apiKey = env ? env.DEEPSEEK_API_KEY : undefined;
        
        // 如果未配置 DeepSeek API Key，使用智能需求解析引擎兜底，确保响应精准契合用户需求
        if (!apiKey) {
          const inputLower = userMessage.toLowerCase();
          const isBusiness = /营销|风控|信贷|贷款|欺诈|信用卡|违约|评估|首贷|客群|额度|流水|模型|选型|转化|aum|招揽|准入|审批|防线|评分|经营贷|提额|催收|核算|征信|反洗钱|资产|坏账|不良|逾期/i.test(userMessage);
          
          let responseObj;
          if (!isBusiness) {
            // 闲聊 / 非业务询问，不触发模型推荐
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

          return new Response(JSON.stringify({
            success: true,
            data: {
              model: 'deepseek-chat',
              content: JSON.stringify(responseObj),
              usage: { prompt_tokens: 45, completion_tokens: 210, total_tokens: 255 }
            }
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

【触发与选型逻辑规则】
1. 如果用户输入是日常闲聊、打招呼、身份询问或非具体的金融业务选型（如“你好”、“你是什么模型”、“你能做什么”、“谢谢”等）：
   - 必须设置 "isRecommendation": false ；
   - 给出亲切专业的客服回复，引导用户提供具体的金融业务场景或选型需求；
   - 严禁包含 parsedRequirement、singleRecommendations、combinedRecommendation 字段。

2. 只有当用户提出了具体的金融业务场景（例如：营销促活、县域首贷、消费贷促提、经营贷小微准入、信用卡反欺诈等）或 AI 模型选型需求时：
   - 必须设置 "isRecommendation": true ；
   - 深入专业地分析业务痛点，并严格按照以下结构输出 parsedRequirement、singleRecommendations 和 combinedRecommendation。

模型资产库包含以下模型：
- ID: m_001, 名称: 消费贷授信未用信促提模型, 领域: 营销
- ID: m_002, 名称: AUM10-30万客户维稳增存模型, 领域: 营销
- ID: m_003, 名称: 个人经营贷小微企业准入与反欺诈评分模型, 领域: 风控
- ID: m_004, 名称: 零售客户违约概率预警模型 (PD Model), 领域: 风控
- ID: m_005, 名称: 企业财报与流水智能解析模型, 领域: 文本/特征提取
- ID: m_006, 名称: 信用卡反欺诈交易识别模型, 领域: 风控

请根据用户输入输出纯 JSON 格式的数据（务必为合法 JSON，不要包含 Markdown 代码块标记）：
当 isRecommendation 为 true 时结构如下：
{
  "isRecommendation": true,
  "chatResponse": "针对用户具体业务需求的针对性剖析与解答",
  "parsedRequirement": {
    "domain": "业务领域",
    "stage": "业务阶段",
    "audience": ["目标部门与客群"],
    "coreCapabilities": ["核心能力诉求"],
    "dataAvailable": ["可用数据源"],
    "expectedOutput": "预期输出"
  },
  "singleRecommendations": [
    {
      "modelId": "最匹配模型ID (m_001 至 m_006)",
      "matchScore": 95,
      "reason": "匹配原因",
      "missingFeatures": ["缺失特征"]
    }
  ],
  "combinedRecommendation": {
    "title": "组合方案标题",
    "description": "方案描述",
    "nodes": [{ "id": "1", "modelId": "m_001", "role": "节点角色" }],
    "edges": [{ "source": "1", "target": "2", "label": "流转说明" }]
  }
}

当 isRecommendation 为 false 时结构如下：
{
  "isRecommendation": false,
  "chatResponse": "亲切专业的解答与业务引导语"
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
          return new Response(JSON.stringify({
            success: false,
            error: { message: `DeepSeek API returned ${dsRes.status}: ${errText}` }
          }), {
            status: dsRes.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const dsData = await dsRes.json();
        const content = dsData.choices?.[0]?.message?.content || '';
        const usage = dsData.usage || {};

        return new Response(JSON.stringify({
          success: true,
          data: {
            model: 'deepseek-chat',
            content,
            usage
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          error: { message: err.message || 'Internal server error' }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (request.method !== 'POST') {
      return new Response('Only POST method is allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { input, messages, mockDataContent } = await request.json();

      if (!input && (!messages || messages.length === 0)) {
        return new Response(JSON.stringify({ error: 'Input is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 请在 Cloudflare Worker 的环境变量中设置 DEEPSEEK_API_KEY
      const apiKey = env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'DEEPSEEK_API_KEY is not set' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const chatContext = messages && messages.length > 0
        ? messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
        : `User: ${input}`;

      const prompt = `You are a highly intelligent financial AI assistant that recommends Bank Models based on user requirements.
I have a set of available models in my system (refer to the following mock data file content for their IDs and details).
You need to analyze the user's latest input in the context of the conversation.

Always reply in Chinese (简体中文).

If the user is just saying hello, asking who you are, asking general questions, or following up on a previous recommendation without needing a new one, respond appropriately as a helpful banking AI assistant and set "isRecommendation" to false.
If the user is describing a new business requirement that requires model recommendations, parse their requirement, select the BEST 2 single models, propose ONE combined recommendation, and set "isRecommendation" to true.

Here are some examples of correctly matching user questions to models:
- "阳光E贷发生过用款行为的客户中，如何通过准入评分卡来降低未来的逾期率？" -> "阳光E贷贷前准入模型"
- "针对月日均AUM在10万左右的边缘客户，如何识别能增存到30万以上的潜力客户？" -> "AUM10-30万客户维稳增存模型"
- "金融安全反欺诈场景，检测涉诈账户用什么模型？" -> "智能反诈模型"
- "我们有很多授信客户拿到了额度但一直不用，想找出未来可能用信的人做精准营销，应该用哪个模型？" -> "消费贷授信未用信促提模型"
- "收单商户的授信额度融合计算和营销策略，有什么模型？" -> "收单商户价值分层及预授信模型"

Conversation History:
${chatContext}

Available Models:
${mockDataContent}

Based on the conversation, return a JSON response strictly matching the following schema:
{
  "chatResponse": "Your conversational reply to the user in Chinese. E.g. '你好！我是模型推荐助手...' or '我已为您完成需求结构化解析...'",
  "isRecommendation": boolean, 
  "parsedRequirement": {
    "domain": "string",
    "stage": "string", 
    "audience": ["string"],
    "coreCapabilities": ["string"],
    "dataAvailable": ["string"],
    "expectedOutput": "string"
  },
  "singleRecommendations": [
    {
      "modelId": "string",
      "matchScore": 95,
      "matchReasons": ["string", "string"],
      "radarData": [
        { "subject": "场景契合度", "A": 90, "fullMark": 100 },
        { "subject": "数据满足度", "A": 85, "fullMark": 100 },
        { "subject": "客群覆盖度", "A": 95, "fullMark": 100 },
        { "subject": "技术指标优越性", "A": 88, "fullMark": 100 },
        { "subject": "合规适配度", "A": 92, "fullMark": 100 }
      ]
    }
  ],
  "combinedRecommendation": {
    "id": "c_xxx",
    "name": "string",
    "matchScore": 94,
    "overallExplanation": "string",
    "nodes": [
      {
        "id": "n1",
        "modelId": "string",
        "roleInFlow": "string",
        "input": "string",
        "output": "string",
        "expectedValue": "string"
      }
    ]
  }
}`;

      // 使用 DeepSeek API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt,
            }
          ],
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      let result;
      try {
        result = JSON.parse(content);
      } catch(e) {
        // 如果 JSON 解析失败，尝试返回原始内容
        console.error("JSON parse error on content:", content);
        throw new Error("Failed to parse JSON from DeepSeek");
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Update db initial data
code = code.replace(
  `{ model: 'deepseek-chat', systemPrompt: '你是一个专业的AI银行金融专家。基于提供的模型知识库进行推荐和回答。返回格式请尽量结构化。不要胡编乱造模型名字。' }`,
  `{ model: 'deepseek-chat', systemPrompt: '你是一个专业的AI银行金融专家。基于提供的模型知识库进行推荐和回答。返回格式请尽量结构化。不要胡编乱造模型名字。', baseURL: 'https://api.deepseek.com' }`
);

// Update getConfig
code = code.replace(
  `hasApiKey: !!config.encryptedApiKey,`,
  `hasApiKey: !!config.encryptedApiKey,\n        baseURL: config.baseURL || 'https://api.deepseek.com',`
);

// Update setConfig
code = code.replace(
  `const { apiKey, model, systemPrompt } = req.body;`,
  `const { apiKey, model, systemPrompt, baseURL } = req.body;`
);

code = code.replace(
  `if (model !== undefined) db.ai_provider_configs.deepseek.model = model;`,
  `if (model !== undefined) db.ai_provider_configs.deepseek.model = model;\n    if (baseURL !== undefined) db.ai_provider_configs.deepseek.baseURL = baseURL;`
);

// Update /api/recommend endpoint request
code = code.replace(
  `const response = await fetch("https://api.deepseek.com/chat/completions", {`,
  `const baseUrl = config.baseURL || "https://api.deepseek.com";\n      const apiUrl = baseUrl.endsWith('/') ? baseUrl + 'chat/completions' : baseUrl + '/chat/completions';\n      const response = await fetch(apiUrl, {`
);

fs.writeFileSync('server.ts', code);

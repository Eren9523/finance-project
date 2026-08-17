const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const aiUsageRoutes = `
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
    const proCount = logs.filter((l: any) => l.model === 'deepseek-v4-pro').length;
    const flashCount = logs.filter((l: any) => l.model === 'deepseek-v4-flash').length;
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

  app.post("/api/admin/ai/pricing/calibrate", requireAuth, requireAdmin, async (req: any, res: any) => {
    try {
      const response = await fetch("https://api-docs.deepseek.com/zh-cn/quick_start/pricing");
      const text = await response.text();
      
      const db = getDb();
      const config = db.ai_provider_configs?.deepseek;
      if (!config || !config.encryptedApiKey) {
        return res.json({ success: false, error: { message: "AI provider not configured" }});
      }

      const apiKey = decrypt(config.encryptedApiKey, config.iv);

      // Call LLM for structured extraction
      const prompt = \`
SYSTEM: 你是一个结构化数据提取器。下面提供的是后端刚刚从DeepSeek官方API价格页面读取的正文。
你只能依据提供的官方正文提取数据。不得使用模型记忆。不得自行补全。不得猜测。不得修改币种。不得转换单位。
只输出符合JSON Schema的JSON。必须提取：deepseek-v4-flash, deepseek-v4-pro 各自的百万tokens输入（缓存命中）、百万tokens输入（缓存未命中）、百万tokens输出。
币种: CNY, 单位: 1M_tokens。如果任何字段无法从正文明确找到，返回null。
正文内容:
\${text.substring(0, 5000)}
\`;

      const aiResponse = await fetch(config.baseUrl + "/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${apiKey}\`
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0
        })
      });

      if (!aiResponse.ok) {
        throw new Error("Failed to call LLM for calibration: " + aiResponse.statusText);
      }

      const aiData = await aiResponse.json();
      let extractedJSON;
      try {
        extractedJSON = JSON.parse(aiData.choices[0].message.content);
      } catch (e) {
        throw new Error("LLM returned invalid JSON");
      }

      // Hard Validation
      if (!extractedJSON.models || !extractedJSON.models['deepseek-v4-flash'] || !extractedJSON.models['deepseek-v4-pro']) {
        throw new Error("CALIBRATION_FAILED: Missing models");
      }

      const flash = extractedJSON.models['deepseek-v4-flash'];
      const pro = extractedJSON.models['deepseek-v4-pro'];

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
`;

code = code.replace(
  `app.get("/api/config", requireAuth, requireAdmin`,
  aiUsageRoutes + `\n  app.get("/api/config", requireAuth, requireAdmin`
);

fs.writeFileSync('server.ts', code);

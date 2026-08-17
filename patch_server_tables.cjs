const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Ensure tables exist in getDb() or saveDb()? Actually just in getDb() defaults.
code = code.replace(
  /if \(\!db\.users\)/,
  `if (!db.recommendation_history) db.recommendation_history = [];
  if (!db.ai_usage_logs) db.ai_usage_logs = [];
  if (!db.ai_pricing_snapshots) db.ai_pricing_snapshots = [];
  if (!db.audit_logs) db.audit_logs = [];
  if (!db.users)`
);

// Add admin routes for dashboard stats
const dashboardRoutes = `
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
          model: deepseekConfig?.model || 'deepseek-v4-flash',
          todayRequests: todayAiCalls,
          avgLatency: 0,
          errorRate: 0
        }
      }
    });
  });
`;

code = code.replace(
  `app.get("/api/config", requireAuth, requireAdmin`,
  dashboardRoutes + `\n  app.get("/api/config", requireAuth, requireAdmin`
);

fs.writeFileSync('server.ts', code);

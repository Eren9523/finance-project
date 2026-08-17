const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminAIPage.tsx', 'utf-8');

code = code.replace(
  `systemPrompt: res.data.systemPrompt || ''`,
  `systemPrompt: res.data.systemPrompt || '',
          baseURL: res.data.baseURL || 'https://api.deepseek.com'`
);

code = code.replace(
  `model: 'deepseek-chat',
    systemPrompt: ''`,
  `model: 'deepseek-chat',
    systemPrompt: '',
    baseURL: 'https://api.deepseek.com'`
);

code = code.replace(
  `await adminApi.updateConfig({ model: aiConfig.model, systemPrompt: aiConfig.systemPrompt });`,
  `await adminApi.updateConfig({ model: aiConfig.model, systemPrompt: aiConfig.systemPrompt, baseURL: aiConfig.baseURL });`
);

code = code.replace(
  `<div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">API Endpoint</span>
                <span className="font-medium text-slate-900">https://api.deepseek.com</span>
              </div>`,
  `<div>
                <label className="block text-sm font-medium text-slate-700 mb-2 mt-4">API Endpoint</label>
                <input 
                  type="text"
                  value={aiConfig.baseURL}
                  onChange={(e) => setAiConfig({...aiConfig, baseURL: e.target.value})}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="https://api.deepseek.com"
                />
              </div>`
);

fs.writeFileSync('src/pages/admin/AdminAIPage.tsx', code);

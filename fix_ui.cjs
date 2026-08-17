const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminAIPage.tsx', 'utf-8');

// revert the first replacement
code = code.replace(
  `<div>
                <label className="block text-sm font-medium text-slate-700 mb-2 mt-4">API Endpoint</label>
                <input 
                  type="text"
                  value={aiConfig.baseURL}
                  onChange={(e) => setAiConfig({...aiConfig, baseURL: e.target.value})}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="https://api.deepseek.com"
                />
              </div>`,
  `<div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">API Endpoint</span>
                <span className="font-medium text-slate-900 truncate max-w-[200px]">{aiConfig.baseURL}</span>
              </div>`
);

// add to Model Params
code = code.replace(
  `<div>
                <label className="block text-sm font-medium text-slate-700 mb-2">默认推理模型</label>`,
  `<div>
                <label className="block text-sm font-medium text-slate-700 mb-2">API Endpoint (代理地址)</label>
                <input 
                  type="text"
                  value={aiConfig.baseURL}
                  onChange={(e) => setAiConfig({...aiConfig, baseURL: e.target.value})}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-6"
                  placeholder="https://api.deepseek.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">默认推理模型</label>`
);

fs.writeFileSync('src/pages/admin/AdminAIPage.tsx', code);

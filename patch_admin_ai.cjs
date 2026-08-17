const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminAIPage.tsx', 'utf-8');

code = code.replace(
  `{ id: 'deepseek-chat', name: 'DeepSeek V3 (Chat)', desc: '标准对话与推荐，速度快' },
                    { id: 'deepseek-reasoner', name: 'DeepSeek R1 (Reasoner)', desc: '深度思考，逻辑更强' }`,
  `{ id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', desc: '标准对话与推荐，速度极快' },
                    { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', desc: '深度思考，逻辑更强' }`
);

// We need to add Thinking, Reasoning Effort, Streaming, Timeout, Max Retry
// The existing state aiConfig can be expanded.
// We'll replace the textarea systemPrompt with these fields.
code = code.replace(
  `<div>
                <label className="block text-sm font-medium text-slate-700 mb-2">系统提示词 (System Prompt)</label>
                <textarea 
                  value={aiConfig.systemPrompt}
                  onChange={(e) => setAiConfig({...aiConfig, systemPrompt: e.target.value})}
                  className="w-full h-32 p-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="在此配置系统级别Prompt..."
                ></textarea>
              </div>`,
  `
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Thinking</label>
                  <select 
                    value={aiConfig.thinking ? 'true' : 'false'} 
                    onChange={(e) => setAiConfig({...aiConfig, thinking: e.target.value === 'true'})}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reasoning Effort</label>
                  <select 
                    value={aiConfig.reasoningEffort || 'medium'} 
                    onChange={(e) => setAiConfig({...aiConfig, reasoningEffort: e.target.value})}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Streaming</label>
                  <select 
                    value={aiConfig.streaming ? 'true' : 'false'} 
                    onChange={(e) => setAiConfig({...aiConfig, streaming: e.target.value === 'true'})}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Timeout (ms)</label>
                  <input 
                    type="number"
                    value={aiConfig.timeout || 30000} 
                    onChange={(e) => setAiConfig({...aiConfig, timeout: Number(e.target.value)})}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Retry</label>
                  <input 
                    type="number"
                    value={aiConfig.maxRetry || 3} 
                    onChange={(e) => setAiConfig({...aiConfig, maxRetry: Number(e.target.value)})}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
  `
);

code = code.replace(
  /V3 \(Chat\)/g,
  'V4 Flash'
);

code = code.replace(
  /R1 \(Reasoner\)/g,
  'V4 Pro'
);

fs.writeFileSync('src/pages/admin/AdminAIPage.tsx', code);

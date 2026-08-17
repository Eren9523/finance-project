const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminAIPage.tsx', 'utf-8');

code = code.replace(
  `  const [aiConfig, setAiConfig] = useState({
    model: 'deepseek-chat',
    systemPrompt: '',
    baseURL: 'https://api.deepseek.com'
  });`,
  `  const [aiConfig, setAiConfig] = useState({
    model: 'deepseek-v4-flash',
    thinking: true,
    reasoningEffort: 'medium',
    streaming: true,
    timeout: 30000,
    maxRetry: 3,
    baseURL: 'https://api.deepseek.com'
  });`
);

code = code.replace(
  `          setAiConfig({
            model: data.model || 'deepseek-chat',
            systemPrompt: data.systemPrompt || '',
            baseURL: data.baseURL || 'https://api.deepseek.com'
          });`,
  `          setAiConfig({
            model: data.model || 'deepseek-v4-flash',
            thinking: data.thinking !== undefined ? data.thinking : true,
            reasoningEffort: data.reasoningEffort || 'medium',
            streaming: data.streaming !== undefined ? data.streaming : true,
            timeout: data.timeout || 30000,
            maxRetry: data.maxRetry || 3,
            baseURL: data.baseURL || 'https://api.deepseek.com'
          });`
);

fs.writeFileSync('src/pages/admin/AdminAIPage.tsx', code);

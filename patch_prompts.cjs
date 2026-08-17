const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminPromptsPage.tsx', 'utf-8');

code = code.replace(
  `{
      id: 'p_report',`,
  `{
      id: 'p_pricing',
      name: 'Pricing Extractor Prompt',
      version: 'v1.0.0',
      status: 'Active',
      updatedAt: '2026-08-11 00:00',
      updatedBy: 'admin',
      preview: 'SYSTEM: 你是一个结构化数据提取器。下面提供的是后端刚刚从DeepSeek官方API价格页面读取的正文...'
    },
    {
      id: 'p_report',`
);

fs.writeFileSync('src/pages/admin/AdminPromptsPage.tsx', code);

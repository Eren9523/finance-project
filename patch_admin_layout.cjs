const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminLayout.tsx', 'utf-8');

code = code.replace(
  `{ name: 'DeepSeek配置', to: '/admin/ai' },
      { name: 'Prompt管理', to: '/admin/prompts' }`,
  `{ name: '服务配置', to: '/admin/ai' },
      { name: '用量与成本', to: '/admin/ai/usage' },
      { name: 'Prompt管理', to: '/admin/prompts' }`
);

code = code.replace(
  `import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';`,
  `import React, { useState } from 'react';\nimport { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';`
);

fs.writeFileSync('src/pages/admin/AdminLayout.tsx', code);

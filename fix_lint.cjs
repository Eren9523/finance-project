const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf-8');
serverCode = serverCode.replace('const newUser = {', 'const newUser: any = {');
fs.writeFileSync('server.ts', serverCode);

let layoutCode = fs.readFileSync('src/pages/admin/AdminLayout.tsx', 'utf-8');
layoutCode = layoutCode.replace("import React, { useState } from 'react';import React, { useState } from 'react';", "import React, { useState } from 'react';");
fs.writeFileSync('src/pages/admin/AdminLayout.tsx', layoutCode);

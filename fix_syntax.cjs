const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/    \}\);\n  \}\);\n  \}\);/g, '    });\n  });');
code = code.replace(/    \}\);\n  \}\);\n  app\.post/g, '    });\n  });\n  app.post');

fs.writeFileSync('server.ts', code);

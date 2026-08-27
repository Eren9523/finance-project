const fs = require('fs');
let code = fs.readFileSync('src/pages/ArchitecturePage.tsx', 'utf8');

code = code.replace(/<\/motion\.div>\s*\{\/\* Footer Note \*\/\}/, '</SequenceSection>\n\n          {/* Footer Note */}');

fs.writeFileSync('src/pages/ArchitecturePage.tsx', code);

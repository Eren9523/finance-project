const fs = require('fs');
let code = fs.readFileSync('src/pages/ArchitecturePage.tsx', 'utf8');

// Replace `</motion.div>` above "离线治理平面" with `</SequenceSection>\n</div>`
const regex = /<\/div>\s*<\/div>\s*<\/motion\.div>\s*\{\/\* ========================================================================= \*\/\}\s*\{\/\* 离线治理平面/;
code = code.replace(regex, '</div>\n            </div>\n          </SequenceSection>\n          </div>\n\n          {/* ========================================================================= */}\n          {/* 离线治理平面');

fs.writeFileSync('src/pages/ArchitecturePage.tsx', code);

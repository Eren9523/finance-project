const fs = require('fs');
let code = fs.readFileSync('src/pages/ArchitecturePage.tsx', 'utf8');

// The original closing for 03 was just before 04:
// </div>
// {/* 04 ... */}
// And I replaced the `04` comment with `</SequenceSection>` + comment.
// So there's an extra `</div>` before `</SequenceSection>`.
code = code.replace(/<\/div>\s*<\/SequenceSection>\s*\{\/\* 04 基础设施与算力保障 \(Clean Contained Layout - No Overflow\) \*\/\}/, '</SequenceSection>\n\n            {/* 04 基础设施与算力保障 (Clean Contained Layout - No Overflow) */}');

// The original closing for 04 was `</div>` just before `</motion.div>`.
// I replaced `</div>\n</motion.div>` with `</SequenceSection>\n</div>`.
// Wait, if 04 was opened with `<SequenceSection ...>`, the original `</div>` was replaced?
// Let's look at what I did:
// code = code.replace(/<\/div>\s*<\/motion\.div>\s*\{\/\* ========================================================================= \*\/\}\s*\{\/\* 05 离线治理平面/, '</SequenceSection>\n          </div>\n\n          {/* ========================================================================= */}\n          {/* 05 离线治理平面');
// If I replaced `</div>\n</motion.div>` with `</SequenceSection>\n</div>`, that should match perfectly! 

// Let's check line 1073 which was: `src/pages/ArchitecturePage.tsx(1073,13): error TS17002: Expected corresponding JSX closing tag for 'div'.`
// And line 1205: `src/pages/ArchitecturePage.tsx(1205,13): error TS17002: Expected corresponding JSX closing tag for 'SequenceSection'.`

// Let's print out the exact errors and the surroundings.
fs.writeFileSync('src/pages/ArchitecturePage.tsx', code);

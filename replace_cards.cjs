const fs = require('fs');
let code = fs.readFileSync('src/pages/ArchitecturePage.tsx', 'utf8');

let index = 0;
code = code.replace(/<FastCard([\s\S]*?)\/>/g, (match, p1) => {
  const result = `<DeckCard index={${index}}>\n                  <FastCard${p1}/>\n                </DeckCard>`;
  index++;
  return result;
});

fs.writeFileSync('src/pages/ArchitecturePage.tsx', code);

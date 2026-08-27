const fs = require('fs');
let code = fs.readFileSync('src/pages/ArchitecturePage.tsx', 'utf8');

const target = `                />
              </div>
            </div>
          </SequenceSection>
          </div>`;

const replacement = `                />
              </div>
          </SequenceSection>
          </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/ArchitecturePage.tsx', code);

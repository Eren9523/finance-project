const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminLayout.tsx', 'utf-8');
code = code.replace("import React, { useState } from 'react';import React, { useState } from 'react';", "import React, { useState } from 'react';");
if (code.startsWith("import React, { useState } from 'react';\nimport React, { useState } from 'react';")) {
  code = code.replace("import React, { useState } from 'react';\nimport React, { useState } from 'react';", "import React, { useState } from 'react';");
}
// Maybe there are other variations
code = code.replace(/import React, { useState } from 'react';\s*import React, { useState } from 'react';/g, "import React, { useState } from 'react';");

fs.writeFileSync('src/pages/admin/AdminLayout.tsx', code);

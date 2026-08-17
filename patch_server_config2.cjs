const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  `       const enc = encrypt(apiKey);
       db.ai_provider_configs.deepseek.encryptedApiKey = enc.encryptedData;
       db.ai_provider_configs.deepseek.iv = enc.iv;`,
  `       db.ai_provider_configs.deepseek.encryptedApiKey = encrypt(apiKey);`
);

// Also in /api/admin/ai/pricing/calibrate:
// const apiKey = decrypt(config.encryptedApiKey, config.iv);
// should be decrypt(config.encryptedApiKey)
code = code.replace(
  `const apiKey = decrypt(config.encryptedApiKey, config.iv);`,
  `const apiKey = decrypt(config.encryptedApiKey);`
);

fs.writeFileSync('server.ts', code);

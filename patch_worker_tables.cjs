const fs = require('fs');
let content = fs.readFileSync('cloudflare-worker.js', 'utf8');

const newInit = `
async function ensureUsersTable(env) {
  if (!env || !env.DB) return;
  try {
    await env.DB.batch([
      env.DB.prepare(\`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          nickname TEXT,
          role TEXT DEFAULT 'user',
          email TEXT,
          department TEXT,
          avatar TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      \`),
      env.DB.prepare(\`
        INSERT OR IGNORE INTO users (id, username, password, nickname, role, email, department, avatar)
        VALUES ('U1786433165757', 'admin', 'jsnslhyh888', '系统管理员', 'admin', 'admin@jsrcb.com', '总行数据中心', 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc');
      \`),
      env.DB.prepare(\`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      \`),
      env.DB.prepare(\`
        CREATE TABLE IF NOT EXISTS models (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT,
          scenarios TEXT,
          capabilities TEXT,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      \`)
    ]);
  } catch (e) {
    console.error("D1 table initialization error:", e);
  }
}
`;

content = content.replace(/async function ensureUsersTable\(env\) \{[\s\S]*?\}\n\}/, newInit.trim());
fs.writeFileSync('cloudflare-worker.js', content);
console.log('Patched worker tables');

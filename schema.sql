-- Cloudflare D1 数据库初始化建表脚本 (database: finance-project-db)

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

-- 默认管理员账号 (账号: admin / 密码: jsnslhyh888)
INSERT OR IGNORE INTO users (id, username, password, nickname, role, email, department, avatar)
VALUES (
  'U1786433165757',
  'admin',
  'jsnslhyh888',
  '系统管理员',
  'admin',
  'admin@jsrcb.com',
  '总行数据中心',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f8fafc'
);

# SECURITY_AI_CONFIG_CHECKLIST - DeepSeek Key 审查

本检查单针对管理员配置 DeepSeek API Key 及其在系统全链路流转过程中的安全性。

## 前端设计审查（已达成）
- [x] **界面不回显**：配置好的 API Key 不在前端任何地方进行完整明文展示，只显示最后四位。
- [x] **状态隔离**：输入框的值 (`apiKey` state) 仅在提交阶段存在，提交完成后立即被清空，不滞留于内存生命周期中。
- [x] **无持久化泄漏**：API Key 绝对禁止写入 `localStorage`、`sessionStorage` 及任何前端持久化存储插件中。
- [x] **无网络返回泄漏**：要求服务端在返回 `GET /api/admin/ai/config` 时，务必过滤 `api_key` 字段，只返回 `{ configured: true, lastFour: 'xxxx' }`。
- [x] **请求一次性**：替换新 Key 时，前端仅进行一次性加密或明文 HTTPS 传输至 Worker，之后销毁。

## 后端要求审查（待 API 侧确保）
- [ ] **HTTPS 强制**：控制台与 Worker 间的所有交互必须基于 TLS 1.2+。
- [ ] **二次加密存储**：Worker 必须使用 AES-GCM 或同等级别对称加密算法加密 Key，并将密文和 IV 存入 D1。
- [ ] **Master Key 隔离**：用于加密/解密的 `CONFIG_ENCRYPTION_KEY` 必须以环境变量或 Secret 形式独立于数据库存放。
- [ ] **鉴权拦截**：`POST /api/admin/ai/config` 及相关测试连接接口，必须严格验证用户是否具有超级管理员 (`role === 'admin'`) 权限，并且验证 Session 有效性。
- [ ] **审计日志脱敏**：记录事件 `AI_KEY_REPLACED`，但绝不允许将明文 Key、密文 Key 打入任何应用日志、监控或控制台 stdout。

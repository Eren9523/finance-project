# PROJECT FULLSTACK AUDIT

## 当前技术栈
- **前端框架**: React 19, Vite, TypeScript
- **CSS框架**: Tailwind CSS 4, Motion/React
- **图标**: Lucide React
- **图表**: Recharts
- **后端架构**: Express (Node.js) / TypeScript (Currently not using Cloudflare Worker based on the code in `server.ts`)
- **数据库**: 本地 JSON 文件 (db/database.json) (Currently not using Cloudflare D1 based on the code)
- **认证**: 基于 Cookie 的本地 Session 认证
- **AI 接入**: DeepSeek API (目前存在 baseURL, model, apiKey)

## 当前路由表
- `/` - WorkbenchPage (智能推荐助手)
- `/market` - ModelMarketPage (模型市场)
- `/architecture` - ArchitecturePage (系统架构)
- `/login` - LoginPage (登录/注册)
- `/profile` - ProfileLayout (个人中心容器)
  - `/profile` - ProfileOverviewPage (默认工作台)
  - `/profile/edit` - EditProfilePage
  - `/profile/security` - SecurityPage
  - `/profile/recommendations` - RecommendationsPage
  - `/profile/favorites` - FavoritesPage
  - `/profile/reports` - ReportsPage
  - `/profile/preferences` - PreferencesPage
- `/admin` - AdminLayout (管理后台容器)
  - `/admin` - AdminDashboardPage (控制面板)
  - `/admin/models` - AdminModelsPage (模型资产)
  - `/admin/taxonomy` - AdminTaxonomyPage (标签管理)
  - `/admin/recommendations` - AdminRecommendationsPage (推荐记录)
  - `/admin/feedback` - AdminFeedbackPage (用户反馈)
  - `/admin/reports` - AdminReportsPage (推荐报告)
  - `/admin/ai` - AdminAIPage (AI服务配置)
  - `/admin/prompts` - AdminPromptsPage (Prompt管理)
  - `/admin/users` - AdminUsersPage (用户管理)
  - `/admin/roles` - AdminRolesPage (角色权限)
  - `/admin/audit` - AdminAuditPage (审计日志)
  - `/admin/versions` - AdminVersionsPage (版本管理)
  - `/admin/status` - AdminStatusPage (系统状态)
  - `/admin/settings` - AdminSettingsPage (系统设置)

## 当前Mock与硬编码数据
- **Dashboard**: `AdminDashboardPage.tsx` 中大量硬编码趋势图数据和统计数字。
- **推荐记录**: `AdminRecommendationsPage.tsx` 是硬编码数据。
- **用户反馈**: `AdminFeedbackPage.tsx` 是硬编码数据。
- **分类标签**: `AdminTaxonomyPage.tsx` 是硬编码数据。
- **ModelCard**: 模型市场部分读取自 `mockData.ts` (硬编码)。

## 当前不能点击的功能
- Sidebar中的 `ai/usage` 路由缺失。
- `AdminDashboardPage` 的部分按钮没有具体行为。
- 部分 Profile 页面内容是空白或者 Placeholder。

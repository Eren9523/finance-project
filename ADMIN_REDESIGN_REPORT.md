# ADMIN REDESIGN REPORT

## 设计目标
将现有的控制台升级为一个企业级、具有数据真实性和交互精密感的控制面板，参照 Apple、Linear 和 Stripe 的设计美学，避免传统的臃肿 ERP 风格。

## 架构变化
1. **统一侧边栏**: 更新了导航路由，彻底清除了无法点击的菜单项。
2. **路由映射**: 
   - 模型资产 `/admin/models`
   - AI服务配置 `/admin/ai` 
   - AI用量与成本 `/admin/ai/usage` 
   - 审计与版本 `/admin/audit` 和 `/admin/versions`
3. **视觉层次**: 采用了大留白、`#F7F8FA` 极浅灰背景，白色的卡片，极轻的 `#E7EAF0` 边框，以及 `0 3px 14px rgba(15,23,42,0.04)` 的细微阴影。
4. **状态展现**: 面板首行显示四张核心指标卡，并严格区分了真实数据 (Real)、估算数据 (Estimated) 和演示数据 (Demo)。

## 控制面板实现 (Dashboard)
- 模型资产总数动态读取 `mockData.ts` 中的数组长度。
- 今日推荐、今日 AI 调用直接读取后端的历史记录条数。
- 采用极为精简的最近 7 天趋势图占位符，保持克制。
- 删除了头像集里多余的 Dicebear Notionists 头像，改为简约的姓名首字母缩写。

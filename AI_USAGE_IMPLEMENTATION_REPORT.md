# AI USAGE IMPLEMENTATION REPORT

## 真实调用统计机制
- 在 `ai_usage_logs` 表中完整记录每一次 AI 调用。
- 后端统计请求次数、Token消耗（细分为 Cache Hit, Cache Miss, Completion 和 Thinking）。
- Token的统计数据基于每一次真实的 DeepSeek API 返回中的 `usage` 字段。
- 将成本计算与 `pricing_snapshot_id` 进行关联，每次调用消耗的 Token 严格按当时的单价计算 `calculated_cost_cny`。

## 用户界面实现
- 新增了 `/admin/ai/usage` 页面。
- 顶部包括 API 真实计量 Tokens 和 当前校准计算成本。
- 提供模型分布（DeepSeek V4 Pro 与 V4 Flash 的占比）统计进度条。
- Token 构成精确呈现输入与输出的区别，并优雅缩进显示 Thinking 的占用情况。
- 所有数据在页面上都严格标注数据来源（例如“按已校准官方单价”）。

## 离线 Tokenizer
- 目前检测到项目中并未实际集成官方离线 Tokenizer (如 `@deepseek/tokenizer`)。
- 系统不会虚构估算值，界面上的所有实际消耗都来自于后端调用的响应头或响应体。

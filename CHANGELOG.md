# Changelog

## 0.1.0

- M1 会话增量摘要（水印 + 去抖 + 有界窗口 + LLM 摘要），写 `topics/` + `journal/` + `state.json`。
- M2 `remember` 工具写 `profile.md`。
- M3 `memory_search` 工具 + 启动注入记忆上下文（systemPrompt section）。
- M4 `/memory` 命令（summarize / distill / status）。
- `reasoningEffort` 可配置（默认开思考，`off` 省成本）。
- Host 侧插件，web/桌面端一致；发布为可安装 npm 包。

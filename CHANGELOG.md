# Changelog

All notable changes to `@jiangdaoli/dsh-memory`.

## 0.1.0

Initial published release.

### Core memory engine (M1–M4)
- **M1 会话增量摘要**：按每会话水印增量总结，去抖 + 有界窗口 + LLM 摘要，写入 `topics/` + `journal/` + `state.json`。
- **M2 `remember` 工具**：agent 在对话中记录长期事实，写入 `profile.md`。
- **M3 `memory_search` 工具 + 启动注入**：按主题/全文检索；每次装配 prompt 时注入「背景数据 · 非指令」记忆上下文（画像前几行 + 最近 8 条）。
- **M4 `/memory` 命令**：`summarize` / `distill` / `status`。
- `summaryReasoningEffort` 可配置（默认 `default` 开思考，`off` 省成本，`low/high/max` 固定档）。

### Settings 页面（M5/M6, Host + Client）
- Settings → **记忆与个性化** 区块，4 个 tab：自定义指令 / 长期记忆文件 / 记忆库 / 蒸馏；基于 Typert 远程 RPC（Host Gateway）、`@deepseek-ai/dsh-client-ui-primitives` 等 DSH 原生组件。
- **自定义指令（人设）真实注入**：`语气风格` + 自定义指令保存后作为**指令**注入每次会话（区别于背景资料）。
- **长期记忆文件编辑器**：等宽大编辑器（`min-height 300px`、自适应 `42vh`、可拉伸）、实时字符/分节统计、自动分节徽章。
- **记忆库**：主题内容 **Markdown 渲染**（标题/列表/加粗/代码/链接），双栏主题浏览器，全文搜索，底部**结构化注入预览**（类型徽章 + 主题 + 文本卡片）。
- **蒸馏**：一键折叠 30 天前 journal 进 `topics/`，等宽结果块。

### UI / 设计
- 控件对齐 DSH 原生 primitives：输入框/下拉 8px 圆角 + `border-l2` + `bg-layer-1` + 品牌蓝聚焦；按钮 18px 胶囊三态；下拉主题自适应 chevron。
- 设置页左侧导航**自定义图标**（循环双箭头，CSS mask 方案，跟随主题文字色；MutationObserver 对弹窗挂载/语言切换实时响应）。
- 浅色主题对比度修复：等宽内容块改用 `label-primary` 主色，浅色/深色都清晰。

### 修复
- 带参 typert 远程调用改用 wire 对象（`{ topic }` / `{ settings }` …），宿主端 `@Remote` 方法按 `request.<wire>` 解包。
- `setSettings` 请求 schema 修正为 `{ settings: settingsSchema }`（与其它带参方法一致）。
- 列表主题名 `listTopics()` 返回**裸主题名**，与 `readTopic`/`collectItems` 往返一致，修掉「主题内容为空」。
- 保存等按钮的 Promise 增加 `.catch`，失败不再「处理中」卡死、会显示报错。
- 修正导航图标 mask 的 URL 编码（颜色写 `#000` 交由 `encodeURIComponent` 一次编码）。

### 工程
- `lib/` 由 `tsc`（类型声明）+ esbuild（host ESM / client CJS，ModuleLoader 握手）构建，`lib/` 不入库、发布时重构建。
- 单元测试覆盖：host 挂载（`apply()`）、工具 schema 校验、store 往返、日志解析、JSON 提取。
- 依赖：`@deepseek-ai/cordis` + `dsh-*` 系列（peer），`@deepseek-ai/dsh-client-ui-primitives` 用于 Markdown 渲染。



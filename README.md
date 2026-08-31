# @jiangdaoli/dsh-memory

DeepSeek Harness（DSH）长期记忆插件：从每次会话里**自动沉淀**有长期价值的事实/决策/做法，会话中**实时记住**用户画像，新会话**自动注入与按需检索**相关记忆，并**维护记忆库**不膨胀。**Host + Client**，web 与桌面端一致运行，Settings 里提供配置页。

## 功能

| 里程碑 | 能力 | 触发 |
|---|---|---|
| M1 | 会话增量摘要 → `topics/` + `journal/` | 每轮 `turn/end`（去抖）+ 会话结束兜底 |
| M2 | `remember(fact, category)` 写用户画像 `profile.md` | agent 在对话中主动调用 |
| M3 | `memory_search(keywords)` + 启动注入画像/相关记忆 | 会话中按需 / 每步 prompt 组装 |
| M4 | `/memory distill` 蒸馏过期日志 | 手动命令 |
| M5/M6 | **前端设置页**（Settings → 记忆与个性化）：人设注入 + Markdown 渲染 + 结构化注入预览 + 自定义导航图标 | 用户打开设置 |

## 前端设置页（M5/M6）

Settings 左侧新增「记忆与个性化」区块（带**循环双箭头**图标），4 个 tab：

- **自定义指令**：语气风格、自定义指令、**摘要推理强度（default/off/low/high/max）**。已接通真实注入 —— 保存后 `语气风格` 和自定义指令**作为指令注入每次会话**（区别于"背景资料"），即 agent 的人设设置处。
- **长期记忆文件**：可视化编辑 `profile.md`（分节增删改、过期项标 `[archived]`），作为"背景资料 · 非指令"每次注入。等宽大编辑器 + 实时字符/分节统计 + 自动分节徽章。
- **记忆库**：浏览 `topics/`，主题内容 **Markdown 渲染**（标题/列表/加粗/代码），全文搜索，底部**注入预览**为结构化卡片（类型徽章 + 主题 + 文本）。
- **蒸馏**：一键蒸馏 30 天前的 journal 进 `topics/`，结果表格化。

## 安装

通过 cordis 挂载（`~/.dsh/profiles/web/cordis.yml` 或对应 profile）：

```yaml
- insert:
    - id: dsh-memory
      name: '@jiangdaoli/dsh-memory'
```

或作为 npm 包依赖并接入 bundle。安装后重启 DSH。web 与桌面端共用同一 Host + 同一 `~/.dsh/memory/`。

## 记忆库结构（`~/.dsh/memory/`）

```
~/.dsh/memory/
├── profile.md           # 用户画像（L4）
├── journal/YYYY-MM-DD.md # 每日日志（追加式）
├── topics/<topic>.md     # 语义记忆（按主题分文件）
└── state.json            # 水印（每会话 lastSummarizedSeq）
```

## 配置（cordis.patch.yml `config`）

| 键 | 默认 | 说明 |
|---|---|---|
| `minTurnsBetweenSummary` | `3` | 每 N 轮触发一次增量总结 |
| `stabilizeMs` | `3000` | turn 结束后去抖窗口 |
| `maxSpanBytes` | `65536` | 单次总结原始窗口上限 |
| `summarizationMaxTokens` | `4096` | 输出上限（须足够大，避免 thinking 占满） |
| `summaryReasoningEffort` | `default` | `default`=开思考；`off`=关（省快、深度略浅）；`low/high/max` 固定档 |
| `summaryProvider` / `summaryModel` | 空 | 单独指定摘要模型（空=跟随会话） |
| `maxMessagesPerSummary` | `10` | 单次总结读取的 user/assistant 消息数 |

## 使用

- **自动摘要**：聊天即可，插件按水印增量补记到 `topics/` + `journal/`。
- **手动摘要**：`/memory summarize`
- **蒸馏**：`/memory distill`
- **状态**：`/memory status`
- **agent 侧**：agent 会在对话中用 `remember(...)` 记录长期事实、用 `memory_search(...)` 按需回忆。

## 开发

```bash
pnpm install
pnpm build      # tsc 类型声明 + esbuild 打包 lib/index.js
pnpm test       # public helpers 单元测试
```

## 许可

MIT

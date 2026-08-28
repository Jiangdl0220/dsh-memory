# @jiangdaoli/dsh-memory

DeepSeek Harness (DSH) long-term memory plugin: automatically distils durable facts / decisions / how-tos out of each session, remembers live user facts, injects and recalls relevant memory in new sessions, and maintains the store over time. **Host-side**, so it runs identically on web and desktop.

## Features

| Milestone | Capability | Trigger |
|---|---|---|
| M1 | Incremental session summary → `topics/` + `journal/` | per-`turn/end` (debounced) + session-dispose catch-up |
| M2 | `remember(fact, category)` writes to `profile.md` | agent calls it during the conversation |
| M3 | `memory_search(keywords)` + startup injection of profile/relevant memory | on demand / per-prompt assembly |
| M4 | `/memory distill` folds stale journals into topics | manual command |

## Install

Mount via cordis (`~/.dsh/profiles/web/cordis.yml` or the relevant profile):

```yaml
- insert:
    - id: dsh-memory
      name: '@jiangdaoli/dsh-memory'
```

or add it as an npm dependency and wire it into the bundle. Restart DSH after install.

## Store layout (`~/.dsh/memory/`)

```
~/.dsh/memory/
├── profile.md           # user profile (L4)
├── journal/YYYY-MM-DD.md # daily log (append-only)
├── topics/<topic>.md     # semantic memory (one file per topic)
└── state.json            # watermark (per-session lastSummarizedSeq)
```

## Configuration (`cordis.patch.yml` `config`)

| Key | Default | Notes |
|---|---|---|
| `minTurnsBetweenSummary` | `3` | incremental summary every N turns |
| `stabilizeMs` | `3000` | debounce window after a turn |
| `maxSpanBytes` | `65536` | raw span bound per summary |
| `summarizationMaxTokens` | `4096` | output cap (large enough that reasoning does not starve text) |
| `summaryReasoningEffort` | `default` | `default`=thinking on; `off`=cheap/fast but shallower; `low/high/max` fixed |
| `summaryProvider` / `summaryModel` | empty | optional summary model override (empty = follow session) |
| `maxMessagesPerSummary` | `10` | user/assistant messages read per summary |

## Usage

- **Automatic**: just chat; the plugin incrementally distils into `topics/` + `journal/` via a per-session watermark.
- **Manual summary**: `/memory summarize`
- **Distill**: `/memory distill`
- **Status**: `/memory status`
- **Agent-side**: the agent uses `remember(...)` for live facts and `memory_search(...)` for on-demand recall.

## Development

```bash
pnpm install
pnpm build      # tsc declarations + esbuild bundle to lib/index.js
pnpm test       # unit tests for pure helpers
```

## License

MIT

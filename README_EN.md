# @jiangdaoli/dsh-memory

DeepSeek Harness (DSH) long-term memory plugin: automatically distils durable facts / decisions / how-tos out of each session, remembers live user facts, injects and recalls relevant memory in new sessions, and maintains the store over time. **Host + Client**, so it runs identically on web and desktop, with a Settings page.

## Features

| Milestone | Capability | Trigger |
|---|---|---|
| M1 | Incremental session summary → `topics/` + `journal/` | per-`turn/end` (debounced) + session-dispose catch-up |
| M2 | `remember(fact, category)` writes to `profile.md` | agent calls it during the conversation |
| M3 | `memory_search(keywords)` + startup injection of profile/relevant memory | on demand / per-prompt assembly |
| M4 | `/memory distill` folds stale journals into topics | manual command |
| M5/M6 | **Settings page** (Settings → Memory & Personalization): persona injection + Markdown rendering + structured injection preview + custom nav icon | user opens Settings |

## Settings page (M5/M6)

A "Memory & Personalization" section in Settings (with a **circular double-arrow** nav icon), 4 tabs:

- **Custom Instructions**: tone style, custom prompt, **summary reasoning effort (default/off/low/high/max)**. These are now actually injected — the tone line and custom prompt are injected as **instructions** into every session (distinct from the "background data" facts), i.e. where you set your agent's persona.
- **Memory File**: visually edit `profile.md` (add/edit sections, mark expired items `[archived]`), injected as "background data · not instructions". A spacious monospace editor with live char/section counts and auto section chips.
- **Memory Library**: browse `topics/`, topic content rendered as **Markdown** (headings/lists/bold/code), full-text search, and a **structured injection preview** at the bottom (kind badge + topic + text cards).
- **Distill**: fold journals older than 30 days into `topics/` with a tabular result.

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

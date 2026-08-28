import type { Context } from '@deepseek-ai/cordis'
import type { MemoryConfig } from './types.ts'
import { kindLabel, MemoryStore, sanitizeTopic } from './store.ts'
import type { MemorySummaryEngine } from './hook-summary.ts'

interface JournalLine { kind: 'fact' | 'decision' | 'howto'; topic: string; text: string }

/** Parse `- **事实**（topic）：text` lines out of a journal/day file body. */
export function parseJournalLines(body: string): JournalLine[] {
  const out: JournalLine[] = []
  for (const raw of body.split('\n')) {
    const t = raw.trim()
    const m = /^[-*]\s*\*\*(事实|决策|做法)\*\*（([^）]+)）[:：]\s*(.+)$/.exec(t)
    if (m) {
      out.push({
        kind: m[1] === '决策' ? 'decision' : m[1] === '做法' ? 'howto' : 'fact',
        topic: sanitizeTopic(m[2]),
        text: m[3].trim(),
      })
    }
  }
  return out
}

const DISTILL_MARK = '> 已蒸馏进 topics/（保留原始归档）'
const DISTILL_DAYS = 30

/**
 * M4: `distillOldJournals` folds >30-day-old journal files into the topic store,
 * then marks them distilled (kept as raw archive; deletion deferred to avoid a
 * shell dependency). Returns how many items were folded and how many files touched.
 */
export async function distillOldJournals(
  ctx: Context,
  _cfg: MemoryConfig,
  store: MemoryStore,
): Promise<{ moved: number; files: string[] }> {
  const cutoff = Date.now() - DISTILL_DAYS * 24 * 3600 * 1000
  const journals = await store.listJournal()
  let moved = 0
  const files: string[] = []
  for (const j of journals) {
    if (j.date && j.mtimeMs >= cutoff) continue
    const body = await store.readText(`journal/${j.date}.md`)
    if (body.includes(DISTILL_MARK)) continue
    const lines = parseJournalLines(body)
    for (const ln of lines) {
      await store.appendTopic(ln.topic, `- ${kindLabel(ln.kind)}：${ln.text}\n`)
      moved++
    }
    files.push(j.date)
    // Retain the raw source but stamp it distilled so re-runs skip it.
    await store.writeText(`journal/${j.date}.md`, `# ${j.date}\n${DISTILL_MARK}\n`)
  }
  return { moved, files }
}

/**
 * M4 (and M1 command surface): register the `/memory` command with
 * `summarize`, `distill`, and `status` subcommands.
 */
export function registerMemoryCommand(
  ctx: Context,
  cfg: MemoryConfig,
  store: MemoryStore,
  engine: MemorySummaryEngine,
): void {
  const commands = ctx.get('commands') as any
  ctx.effect(() => commands.register({
    name: 'memory',
    description: '维护本地记忆库：summarize 立即摘要当前会话；distill 蒸馏过期日志；status 查看记忆库状态。',
    input: { hint: 'summarize | distill | status' },
    recordInput: false,
    handler: async (invocation: any) => {
      const sessionId = invocation?.agent?.session?.id as string | undefined
      const sub = (invocation?.rawInput ?? '').trim() || 'summarize'
      try {
        if (sub === 'summarize') {
          if (!sessionId) return { kind: 'error', text: '找不到当前会话。' }
          const r = await engine.summarizeSpan(sessionId, true)
          return { kind: 'success', text: r.error ? `摘要失败：${r.error}` : `已摘要当前会话（新增/更新 ${r.items} 条）。` }
        }
        if (sub === 'distill') {
          const r = await distillOldJournals(ctx, cfg, store)
          return { kind: 'success', text: `蒸馏完成：折叠 ${r.moved} 条 → topics/，处理 ${r.files.length} 个日志文件。` }
        }
        if (sub === 'status') {
          const [wm, topics, journal] = await Promise.all([
            store.readWatermarks(), store.listTopics(), store.listJournal(),
          ])
          const t = topics.length ? topics.join(', ') : '（无）'
          return {
            kind: 'success',
            text: `记忆库：${String(Object.keys(wm).length)} 个会话有水印；topics: ${t}；journal: ${journal.length} 天。`,
          }
        }
        return { kind: 'error', text: `/memory 用法：summarize | distill | status` }
      } catch (err) {
        return { kind: 'error', text: `/memory 执行失败：${String((err && (err as Error).stack) || err)}` }
      }
    },
  }))
}

import type { Context } from '@deepseek-ai/cordis'
import type { MemoryConfig, MemoryItem, SummaryResult } from './types.ts'
import { kindLabel, MemoryStore, sanitizeTopic } from './store.ts'

/** Minimal host-service shapes. */
interface SessionEventLike { type: string; seq: number; data?: any }
interface SessionLogLike { header?: { id?: string }; events?: SessionEventLike[] }
interface SessionQueryLike {
  readSession(id: string): Promise<SessionLogLike>
  listSessions(): Promise<Array<{ header?: { id?: string } }>>
}
interface LlmLike {
  stream(options: any): AsyncIterable<any>
}
interface AgentDefaultModelLike { currentSelection(): { provider?: string; model?: string } }
interface TimerLike { timeout(cb: () => void, ms: number): () => void }

const SUMMARY_PROMPT = [
  'You are a memory extractor for a personal AI assistant.',
  'From the conversation text below, extract only long-term valuable information',
  'and output JSON: {"facts":[],"decisions":[],"howtos":[]}, each item {text, topic}.',
  'topic from fitness|dsh-dev|travel|general|health|style|family|goal|other.',
  'Keep only durable facts/decisions/how-tos; drop small talk, transient info, and tool errors.',
  'Output only one valid JSON object - no code fence, no prose, no trailing text.',
].join(' ')

export function extractContentText(content: any): string {
  if (!Array.isArray(content)) return ''
  return content
    .filter((b) => b && b.type === 'text')
    .map((b) => String(b.text ?? '').trim())
    .filter((t) => t.length)
    .join(' ')
}

/** Nested-safe brace matching: take the first complete JSON object from a model reply. */
export function extractJson(text: string): SummaryResult | null {
  const t = (text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  const s = t.indexOf('{')
  if (s >= 0) {
    let depth = 0, inStr = false, esc = false, end = -1
    for (let i = s; i < t.length; i++) {
      const c = t[i]
      if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue }
      if (c === '"') inStr = true
      else if (c === '{') depth++
      else if (c === '}') { depth--; if (depth === 0) { end = i; break } }
    }
    if (end > s) {
      try { return normalizeSummary(JSON.parse(t.slice(s, end + 1))) } catch { /* fall through */ }
    }
  }
  try { return normalizeSummary(JSON.parse(t)) } catch { return null }
}

function normalizeSummary(raw: any): SummaryResult | null {
  if (!raw || typeof raw !== 'object') return null
  const pick = (arr: any, kind: MemoryItem['kind']): MemoryItem[] =>
    Array.isArray(arr)
      ? arr.filter((x) => x && typeof x.text === 'string' && x.text.length).map((x) => ({
          kind, topic: sanitizeTopic(String(x.topic ?? 'general')), text: String(x.text).trim(), at: '',
        }))
      : []
  return { facts: pick(raw.facts, 'fact'), decisions: pick(raw.decisions, 'decision'), howtos: pick(raw.howtos, 'howto') }
}

function today(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * M1 engine: incremental, watermark-gated memory distillation for one session.
 * Triggers on turn/end (debounced), session dispose (force), or an explicit call.
 */
export class MemorySummaryEngine {
  private readonly store: MemoryStore
  private readonly inflight = new Map<string, Promise<any>>()
  private readonly pending = new Map<string, () => void>()

  constructor(
    private readonly ctx: Context,
    private readonly cfg: MemoryConfig,
    store?: MemoryStore,
  ) {
    this.store = store ?? new MemoryStore(ctx, cfg)
  }

  /** Register the event triggers (turn/end debounced + dispose catch-up). */
  start(): void {
    const on = (this.ctx as any).on.bind(this.ctx)
    on('session/event', (session: any, event: SessionEventLike) => {
      if (event.type !== 'turn/end') return
      const prev = this.pending.get(session.id)
      if (prev) prev()
      const timer = this.ctx.get('timer') as TimerLike | undefined
      const dispose = timer?.timeout(() => {
        this.pending.delete(session.id)
        void this.summarizeSpan(session.id, false)
      }, this.cfg.stabilizeMs)
      this.pending.set(session.id, dispose ?? (() => this.pending.delete(session.id)))
    })
    on('session/disposed', (session: any) => {
      void this.summarizeSpan(session.id, true)
    })
  }

  /** Summarize the new tail of a session since its watermark. */
  async summarizeSpan(sessionId: string, force: boolean): Promise<{ skipped: boolean; items: number; error?: string }> {
    const running = this.inflight.get(sessionId)
    if (running) { await running.catch(() => {}); return { skipped: true, items: 0, error: 'already-running' } }

    const run = this.doSummarize(sessionId, force).catch(async (err) => {
      return { skipped: false, items: 0, error: String((err && err.stack) || err) }
    })
    this.inflight.set(sessionId, run)
    try { return await run } finally { this.inflight.delete(sessionId) }
  }

  private async doSummarize(sessionId: string, force: boolean) {
    const query = this.ctx.get('sessionQuery') as SessionQueryLike | undefined
    if (!query) throw new Error('dsh-memory: sessionQuery service unavailable')

    const wm = (await this.store.readWatermarks())[sessionId] ?? 0
    const log = await query.readSession(sessionId)
    const events = log?.events ?? []

    const msgs: Array<{ seq: number; role: string; text: string }> = []
    for (const e of events) {
      if (e.type === 'user/message') msgs.push({ seq: e.seq, role: 'user', text: extractContentText(e.data?.content) })
      else if (e.type === 'assistant/message') msgs.push({ seq: e.seq, role: 'assistant', text: extractContentText(e.data?.message?.content) })
    }
    const newMsgs = msgs.filter((m) => m.seq > wm)
    const used = newMsgs.slice(-this.cfg.maxMessagesPerSummary)
    if (!used.length && !force) return { skipped: true, items: 0 }

    const dialogue = used.map((m) => `${m.role}: ${m.text}`).join('\n')
    const model = this.resolveModel()
    const options = {
      provider: model.provider, model: model.model,
      messages: [
        { role: 'user', content: [{ type: 'text', text: `${SUMMARY_PROMPT}\n\n===== CONVERSATION =====\n${dialogue}` }], source: { kind: 'plugin', plugin: 'dsh-memory' } },
      ],
      maxTokens: this.cfg.summarizationMaxTokens,
      sessionId, purpose: 'memory-summary',
    } as Record<string, unknown>
    if (this.cfg.summaryReasoningEffort !== 'default') options.reasoningEffort = this.cfg.summaryReasoningEffort

    const text = await this.streamText(options, sessionId)

    const parsed = extractJson(text)
    const items: MemoryItem[] = parsed
      ? [...parsed.facts, ...parsed.decisions, ...parsed.howtos]
      : []

    const date = today()
    let section = `\n## 会话摘要 ${new Date().toISOString().slice(0, 19)}\n`
    if (items.length) {
      for (const it of items) section += `- **${kindLabel(it.kind)}**（${it.topic}）：${it.text}\n`
    } else {
      section += '- （本次无可留存的长期信息）\n'
    }
    await this.store.appendJournal(date, section)
    for (const it of items) {
      await this.store.appendTopic(it.topic, `- ${kindLabel(it.kind)}：${it.text}\n`)
    }

    // advance watermark to the last message seq we read
    const lastSeq = newMsgs.length ? newMsgs[newMsgs.length - 1].seq : 0
    if (lastSeq > wm) {
      const state = await this.store.readWatermarks()
      state[sessionId] = lastSeq
      await this.store.writeWatermarks(state)
    }
    return { skipped: false, items: items.length }
  }

  private resolveModel(): { provider: string; model: string } {
    if (this.cfg.summaryProvider && this.cfg.summaryModel) {
      return { provider: this.cfg.summaryProvider, model: this.cfg.summaryModel }
    }
    const adm = this.ctx.get('agentDefaultModel') as AgentDefaultModelLike | undefined
    const sel = adm?.currentSelection()
    if (sel?.provider && sel?.model) return { provider: sel.provider, model: sel.model }
    throw new Error('dsh-memory: no provider/model available for summary')
  }

  private async streamText(options: Record<string, unknown>, _sessionId: string): Promise<string> {
    const llm = this.ctx.get('llm') as LlmLike | undefined
    if (!llm) throw new Error('dsh-memory: llm service unavailable')
    let text = ''; let finish: any
    for await (const c of llm.stream(options)) {
      if (c.type === 'text-delta') text += c.text
      else if (c.type === 'block-end' && c.block && c.block.type === 'text') text += c.block.text
      else if (c.type === 'finish') finish = c.reason
    }
    if (finish && (finish.kind === 'error' || finish.kind === 'aborted')) throw new Error(`llm finished: ${finish.kind}`)
    return text
  }
}

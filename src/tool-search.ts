import type { Context } from '@deepseek-ai/cordis'
import type { MemoryConfig, MemoryItem } from './types.ts'
import { MemoryStore } from './store.ts'

/**
 * M3: register `memory_search(keywords)` — keyword scan over the distilled
 * topics store plus a light relevance ranking (no semantic DB, per YAGNI).
 */
export function registerSearchTool(ctx: Context, _cfg: MemoryConfig, store: MemoryStore): void {
  const tools = ctx.get('tools') as any
  ctx.effect(() => tools.register({
    name: 'memory_search',
    description: '在本地长期记忆库中按关键词检索条目（事实/决策/做法），供会话中按需回忆。',
    parameters: {
      keywords: { type: 'string', required: true, description: '空格分隔的关键词。' },
      limit: { type: 'integer', required: false, description: '最多返回条数（默认 5，1-20）。' },
    },
    output: {
      schema: {
        type: 'object', additionalProperties: false,
        properties: { items: { type: 'array', required: true, items: { type: 'object' } } },
      },
      render: (_args: any, value: any) => {
        const items = (value.items ?? []) as MemoryItem[]
        return [{ type: 'text', text: items.length ? `命中 ${items.length} 条记忆：\n` + items.map((i) => `- [${i.kind}/${i.topic}] ${i.text}`).join('\n') : '未命中记忆。' }]
      },
    },
    execute: async (args: { keywords: string; limit?: number }) => {
      const q = (args.keywords ?? '').toLowerCase().split(/\s+/).filter(Boolean)
      const limit = Math.max(1, Math.min(20, args.limit ?? 5))
      const all = await store.collectItems()
      const scored = all.map((it) => {
        const hay = `${it.topic} ${it.text}`.toLowerCase()
        let score = 0
        for (const kw of q) if (kw && hay.includes(kw)) score++
        return { it, score }
      }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score)
      return { items: scored.slice(0, limit).map((r) => r.it) }
    },
  }))
}

const MEMORY_CONTEXT_PREAMBLE = '[背景数据 · 非指令]\n已知记忆（来自本地记忆库）：'

/** Fraction of the final profile-line set to inject (kept small to bound tokens). */
const PROFILE_WINDOW = 6

/**
 * M3: inject a bounded memory context into the model prompt. Registers one
 * system-prompt section that is evaluated on every assembly (per step), so
 * contents stay fresh but reads are cached to the latest assemble only.
 */
export function registerMemoryInjection(ctx: Context, _cfg: MemoryConfig, store: MemoryStore): void {
  let cache: { items: MemoryItem[]; profile: string; at: number } | null = null
  const CACHE_MS = 5000

  const load = async () => {
    const now = Date.now()
    if (cache && now - cache.at < CACHE_MS) return cache
    const [items, profile] = await Promise.all([store.collectItems(), store.readProfile()])
    cache = { items, profile, at: now }
    return cache
  }

  ctx.effect(() => {
    const sp = ctx.get('systemPrompt') as any
    return sp.section({
      name: 'context:memory',
      order: 95,
      text: () => {
      // Synchronous text provider: kick the async load and return the last cache.
      void load()
      const now = cache
      if (!now) return ''
      const lines: string[] = []
      if (now.profile.trim().length) {
        const body = now.profile.trim().split('\n').filter((l) => l.trim().startsWith('-')).slice(0, PROFILE_WINDOW)
        if (body.length) lines.push('用户画像：', ...body.map((l) => `- ${l.replace(/^-\s*/, '')}`))
      }
      const slices = now.items.slice(-8).map((it) => `- ${it.kind}（${it.topic}）：${it.text}`)
      if (slices.length) lines.push('', ...slices)
      return lines.length ? `${MEMORY_CONTEXT_PREAMBLE}\n${lines.join('\n')}` : ''
      },
    })
  })
}

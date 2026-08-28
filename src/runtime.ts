import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { MemoryConfig, MemoryItem, MemorySettings } from './types.ts'
import { MemoryStore } from './store.ts'
import { distillOldJournals } from './distill.ts'

/** Rank distilled items by keyword overlap, newest relevance first. */
function searchItems(items: MemoryItem[], keywords: string, limit = 20): MemoryItem[] {
  const q = (keywords ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  return items
    .map((it) => {
      const hay = `${it.topic} ${it.text}`.toLowerCase()
      let score = 0
      for (const kw of q) if (kw && hay.includes(kw)) score++
      return { it, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.it)
}

/**
 * Host Remote service (`ctx.memory`, wire namespace `memory`). Backs the
 * dsh-memory settings page: settings, profile editing, topic browsing, search,
 * and the injection preview. All reads/writes go through the local MemoryStore.
 */
export class MemoryRuntime extends TypertRemoteService {
  private readonly store: MemoryStore

  constructor(
    ctx: Context,
    private readonly cfg: MemoryConfig,
    store?: MemoryStore,
  ) {
    super(ctx, 'memory')
    this.store = store ?? new MemoryStore(ctx, cfg)
  }

  @Remote
  async getSettings(): Promise<{ settings: MemorySettings }> {
    const s = await this.store.readSettings()
    return {
      settings: {
        toneStyle: s.toneStyle ?? '',
        customPrompt: s.customPrompt ?? '',
        summaryReasoningEffort: s.summaryReasoningEffort ?? 'default',
      },
    }
  }

  @Remote
  async setSettings(settings: MemorySettings): Promise<{ ok: true }> {
    await this.store.writeSettings(settings)
    return { ok: true }
  }

  @Remote
  async readProfile(): Promise<{ content: string }> {
    return { content: await this.store.readProfile() }
  }

  @Remote
  async writeProfile(content: string): Promise<{ ok: true }> {
    await this.store.writeProfile(content)
    return { ok: true }
  }

  @Remote
  async writeProfileFact(section: string, fact: string): Promise<{ ok: true }> {
    await this.store.writeProfileFact(section || '偏好', fact)
    return { ok: true }
  }

  @Remote
  async listTopics(): Promise<{ topics: string[] }> {
    return { topics: await this.store.listTopics() }
  }

  @Remote
  async readTopic(topic: string): Promise<{ content: string }> {
    return { content: await this.store.readTopic(topic) }
  }

  @Remote
  async search(keywords: string): Promise<{ items: MemoryItem[] }> {
    return { items: searchItems(await this.store.collectItems(), keywords) }
  }

  @Remote
  async getInjectionPreview(): Promise<{ profile: string; items: MemoryItem[] }> {
    const [items, profile] = await Promise.all([this.store.collectItems(), this.store.readProfile()])
    return { profile, items: items.slice(-8) }
  }

  @Remote
  async distill(): Promise<{ moved: number; files: string[] }> {
    return distillOldJournals(this.ctx, this.cfg, this.store)
  }
}

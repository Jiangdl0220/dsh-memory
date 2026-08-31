import type { Context } from '@deepseek-ai/cordis'
import type { MemoryConfig } from './types.ts'
import { MemoryStore } from './store.ts'

/** How long (ms) a loaded settings snapshot stays before the next assembly re-reads it. */
const SETTINGS_CACHE_MS = 1500

/**
 * P6: inject the user's persona — the「自定义指令」tone + custom prompt — as a
 * system-prompt instruction section, so whatever the Settings page saves
 * actually reaches every session. Reads settings.json (cached briefly) and
 * emits a section only when at least one field is set. Kept separate from the
 * memory "background data" section: this is an instruction, not a fact dump.
 */
export function registerPersonaInjection(ctx: Context, _cfg: MemoryConfig, store: MemoryStore): void {
  let cache: { text: string; at: number } | null = null
  const load = async (): Promise<string> => {
    const now = Date.now()
    if (cache && now - cache.at < SETTINGS_CACHE_MS) return cache.text
    const s = await store.readSettings()
    const lines: string[] = []
    const tone = s.toneStyle?.trim()
    const custom = s.customPrompt?.trim()
    if (tone) lines.push(`语气风格：${tone}`)
    if (custom) lines.push(custom)
    const text = lines.join('\n')
    cache = { text, at: now }
    return text
  }
  ctx.effect(() => {
    const sp = ctx.get('systemPrompt') as any
    return sp.section({
      name: 'context:user-rules',
      order: 90,
      text: () => {
        void load()
        return cache?.text ?? ''
      },
    })
  })
}

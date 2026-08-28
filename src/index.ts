import type { Context } from '@deepseek-ai/cordis'
import type { MemoryConfig } from './types.ts'
import { resolveConfig } from './config.ts'
import { MemoryStore } from './store.ts'
import { MemorySummaryEngine } from './hook-summary.ts'
import { registerRememberTool } from './tool-remember.ts'
import { registerSearchTool, registerMemoryInjection } from './tool-search.ts'
import { registerMemoryCommand } from './distill.ts'
import { MEMORY_MANIFEST } from './typert.ts'
import { MemoryRuntime } from './runtime.ts'

// Re-export pure helpers so tests (and consumers) can import them from the bundle.
export { resolveConfig, dshHome } from './config.ts'
export { MemoryStore, sanitizeTopic, kindLabel } from './store.ts'
export { extractJson, extractContentText, MemorySummaryEngine } from './hook-summary.ts'
export { parseJournalLines, distillOldJournals } from './distill.ts'

/** Cordis plugin name (the Loader entry and client bundle id). */
export const name = '@jiangdaoli/dsh-memory'

/** Services required before load. */
export const inject: string[] = [
  'tools',
  'commands',
  'systemPrompt',
  'fs',
  'sessionQuery',
  'llm',
  'agentDefaultModel',
  'timer',
  'typert',
]

/**
 * dsh-memory host plugin: distils durable user knowledge out of each session
 * (M1), records live long-term facts (M2 remember), injects relevant memory
 * into the prompt and offers recall (M3 memory_search), and maintains the
 * store over time (M4 `/memory` distill). Host-only, so it runs identically on
 * web and desktop.
 */
export function apply(ctx: Context, config: Partial<MemoryConfig> = {}): void {
  const cfg = resolveConfig(config)
  const store = new MemoryStore(ctx, cfg)
  const engine = new MemorySummaryEngine(ctx, cfg, store)
  engine.start()
  registerRememberTool(ctx, cfg, store)
  registerSearchTool(ctx, cfg, store)
  registerMemoryInjection(ctx, cfg, store)
  registerMemoryCommand(ctx, cfg, store, engine)
  // Host Remote for the settings page (strict Typert manifest).
  new MemoryRuntime(ctx, cfg, store)
  ctx.effect(() => {
    const typert = ctx.get('typert') as { register(m: unknown): () => Promise<void> } | undefined
    const dispose = typert?.register(MEMORY_MANIFEST)
    return () => { void dispose?.() }
  }, 'dsh-memory: typert manifest')
}

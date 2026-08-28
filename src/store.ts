import type { Context } from '@deepseek-ai/cordis'
import type { MemoryConfig, MemoryItem } from './types.ts'

/** Minimal shapes of the host services this store touches (avoid extra DSH type deps). */
export interface FsTarget {
  targetKey?: string
}
export interface FsDirEntry {
  name: string
  target: FsTarget
}
export interface FsLike {
  resolve(path: string, opts?: { cwd?: string }): Promise<FsTarget>
  readText(target: FsTarget): Promise<string>
  writeText(target: FsTarget, content: string): Promise<unknown>
  readBytes(target: FsTarget, signal: AbortSignal | undefined, maxBytes: number): Promise<Uint8Array>
  listDir(target: FsTarget): Promise<FsDirEntry[]>
  stat(target: FsTarget): Promise<{ mtimeMs?: number } | undefined>
}

export function sanitizeTopic(topic: string): string {
  const t = topic.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return t || 'general'
}

/** Human-readable label for a memory kind (journal/topic body). */
export function kindLabel(kind: MemoryItem['kind']): string {
  return { fact: '事实', decision: '决策', howto: '做法' }[kind] ?? '备注'
}

export interface WatermarkState {
  /** sessionId -> last summarized raw-log seq. */
  [sessionId: string]: number
}

/**
 * File-backed memory store under `~/.dsh/memory/`. Reads are whole-file; writes
 * are atomic through ctx.fs. Kept deliberately plain so it is easy to test and
 * to swap the watermark backend later (storageDomain) without touching callers.
 */
export class MemoryStore {
  constructor(
    private readonly ctx: Context,
    private readonly cfg: MemoryConfig,
  ) {}

  private fs(): FsLike {
    const fs = this.ctx.get('fs') as FsLike | undefined
    if (fs === undefined) throw new Error('dsh-memory: fs service unavailable')
    return fs
  }

  private target(rel: string): Promise<FsTarget> {
    return this.fs().resolve(`${this.cfg.memoryHome}/${rel}`)
  }

  async readText(rel: string): Promise<string> {
    try {
      return await this.fs().readText(await this.target(rel))
    } catch {
      return ''
    }
  }

  async writeText(rel: string, content: string): Promise<void> {
    await this.fs().writeText(await this.target(rel), content)
  }

  async appendText(rel: string, content: string): Promise<void> {
    await this.writeText(rel, (await this.readText(rel)) + content)
  }

  // ---- watermark (state.json) ----
  async readWatermarks(): Promise<WatermarkState> {
    try {
      const raw = await this.readText('state.json')
      return raw ? JSON.parse(raw) as WatermarkState : {}
    } catch {
      return {}
    }
  }

  async writeWatermarks(state: WatermarkState): Promise<void> {
    await this.writeText('state.json', JSON.stringify(state, null, 2))
  }

  // ---- journal / topics ----
  async appendJournal(date: string, section: string): Promise<void> {
    await this.appendText(`journal/${date}.md`, section)
  }

  async appendTopic(topic: string, line: string): Promise<void> {
    await this.appendText(`topics/${sanitizeTopic(topic)}.md`, line)
  }

  /** List daily journal files (from filenames) with their mtime. */
  async listJournal(): Promise<Array<{ date: string; mtimeMs: number }>> {
    try {
      const dir = await this.fs().listDir(await this.target('journal'))
      const out: Array<{ date: string; mtimeMs: number }> = []
      for (const e of dir) {
        const m = /^(\d{4}-\d{2}-\d{2})\.md$/.exec(e.name)
        if (!m) continue
        const st = await this.fs().stat(e.target)
        out.push({ date: m[1], mtimeMs: st?.mtimeMs ?? Date.now() })
      }
      return out.sort((a, b) => a.date.localeCompare(b.date))
    } catch {
      return []
    }
  }

  async listTopics(): Promise<string[]> {
    try {
      const dir = await this.fs().listDir(await this.target('topics'))
      return dir.map((e) => e.name).filter((n) => n.endsWith('.md')).sort()
    } catch {
      return []
    }
  }

  // ---- profile (L4) ----
  async readProfile(): Promise<string> {
    return this.readText('profile.md')
  }

  /** Append one fact line under a `## <section>` heading, creating it if needed. */
  async writeProfileFact(section: string, fact: string): Promise<void> {
    const sectionName = section || '偏好'
    const heading = `## ${sectionName}`
    const line = `- ${fact.trim()}\n`
    const existing = await this.readProfile()
    const idx = existing.indexOf(heading)
    if (idx < 0) {
      const base = existing.trimEnd()
      await this.writeText('profile.md', `${base}${base.length ? '\n\n' : ''}${heading}\n${line}`)
      return
    }
    const after = existing.indexOf('\n', idx)
    const before = after < 0 ? existing : existing.slice(0, after + 1)
    const rest = after < 0 ? '' : existing.slice(after + 1)
    await this.writeText('profile.md', before + line + rest)
  }

  // ---- reading all distilled items for injection / search ----
  /** Collect items from every topic file in insertion order, newest topic first. */
  async collectItems(): Promise<MemoryItem[]> {
    const topics = await this.listTopics()
    const items: MemoryItem[] = []
    for (const name of topics.reverse()) {
      const text = await this.readText(`topics/${name}`)
      for (const line of text.split('\n')) {
        const m = /^[-*]\s*(事实|决策|做法|备注)[:：]\s*(.+)$/.exec(line.trim())
        if (m) {
          const kind: MemoryItem['kind'] = m[1] === '决策' ? 'decision' : m[1] === '做法' ? 'howto' : 'fact'
          items.push({ kind, topic: name.replace(/\.md$/, ''), text: m[2].trim(), at: '' })
        }
      }
    }
    return items
  }
}

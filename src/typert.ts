import type { TypertContribution } from '@deepseek-ai/dsh-typert-registry/types'
import { MEMORY_INVOCATIONS } from './contract.ts'

/**
 * Host Typert manifest for the dsh-memory Remote namespace. Registered via
 * `ctx.typert.register` in the plugin body so the Host Gateway resolves
 * `memory/*` endpoints without consulting the `@Remote` marker table.
 */
export const MEMORY_MANIFEST: TypertContribution = {
  package: 'dsh-memory',
  face: 'host',
  schemas: [],
  model: {
    services: [
      {
        key: 'memory',
        exportName: 'MemoryRuntime',
        description: 'Read/write the local memory store and settings for the dsh-memory settings page.',
        tags: [],
        members: [
          { kind: 'method', name: 'getSettings', signature: 'getSettings(): Promise<{ settings: MemorySettings }>' },
          { kind: 'method', name: 'setSettings', signature: 'setSettings(settings: MemorySettings): Promise<{ ok: boolean }>' },
          { kind: 'method', name: 'readProfile', signature: 'readProfile(): Promise<{ content: string }>' },
          { kind: 'method', name: 'writeProfile', signature: 'writeProfile(content: string): Promise<{ ok: boolean }>' },
          { kind: 'method', name: 'writeProfileFact', signature: 'writeProfileFact(section: string, fact: string): Promise<{ ok: boolean }>' },
          { kind: 'method', name: 'listTopics', signature: 'listTopics(): Promise<{ topics: string[] }>' },
          { kind: 'method', name: 'readTopic', signature: 'readTopic(topic: string): Promise<{ content: string }>' },
          { kind: 'method', name: 'search', signature: 'search(keywords: string): Promise<{ items: MemoryItem[] }>' },
          { kind: 'method', name: 'getInjectionPreview', signature: 'getInjectionPreview(): Promise<{ profile: string; items: MemoryItem[] }>' },
          { kind: 'method', name: 'distill', signature: 'distill(): Promise<{ moved: number; files: string[] }>' },
        ],
        types: [],
      },
    ],
    events: [],
    objects: [],
  },
  invocations: MEMORY_INVOCATIONS,
}

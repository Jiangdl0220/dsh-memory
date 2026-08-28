import type { TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { MEMORY_INVOCATIONS } from '../contract.ts'
import type { MemoryItem, MemorySettings, RemoteResult } from '../contract.ts'

/** The memory Remote namespace's client contribution. */
export const MEMORY_REMOTE: TypertRemoteContribution = {
  package: 'dsh-memory',
  descriptors: MEMORY_INVOCATIONS,
}

/** The callable face of the mounted `remote.memory` namespace. */
export interface MemoryNamespaceFace {
  getSettings(): Promise<RemoteResult<{ settings: MemorySettings }>>
  setSettings(settings: MemorySettings): Promise<RemoteResult<{ ok: boolean }>>
  readProfile(): Promise<RemoteResult<{ content: string }>>
  writeProfile(content: string): Promise<RemoteResult<{ ok: boolean }>>
  writeProfileFact(section: string, fact: string): Promise<RemoteResult<{ ok: boolean }>>
  listTopics(): Promise<RemoteResult<{ topics: string[] }>>
  readTopic(topic: string): Promise<RemoteResult<{ content: string }>>
  search(keywords: string): Promise<RemoteResult<{ items: MemoryItem[] }>>
  getInjectionPreview(): Promise<RemoteResult<{ profile: string; items: MemoryItem[] }>>
  distill(): Promise<RemoteResult<{ moved: number; files: string[] }>>
}
export type { MemoryItem, MemorySettings }

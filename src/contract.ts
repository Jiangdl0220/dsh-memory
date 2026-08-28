import { z } from 'zod'
import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol'
import type { MemoryItem, MemorySettings } from './types.ts'

export type { MemoryItem, MemorySettings }

export const memoryItemSchema = z.object({
  kind: z.enum(['fact', 'decision', 'howto']),
  topic: z.string(),
  text: z.string(),
  at: z.string(),
}).readonly()

export const settingsSchema = z.object({
  toneStyle: z.string(),
  customPrompt: z.string(),
  summaryReasoningEffort: z.enum(['default', 'off', 'low', 'high', 'max']),
}).readonly()

export const getSettingsResultSchema = z.object({ settings: settingsSchema }).readonly()
export const setSettingsRequestSchema = z.object({ settings: settingsSchema }).readonly()
export const profileResultSchema = z.object({ content: z.string() }).readonly()
export const writeProfileRequestSchema = z.object({ content: z.string() }).readonly()
export const writeProfileFactRequestSchema = z.object({ section: z.string(), fact: z.string() }).readonly()
export const okResultSchema = z.object({ ok: z.boolean() }).readonly()
export const topicsResultSchema = z.object({ topics: z.array(z.string()) }).readonly()
export const readTopicRequestSchema = z.object({ topic: z.string() }).readonly()
export const searchRequestSchema = z.object({ keywords: z.string() }).readonly()
export const searchResultSchema = z.object({ items: z.array(memoryItemSchema) }).readonly()
export const injectionPreviewSchema = z.object({ profile: z.string(), items: z.array(memoryItemSchema) }).readonly()
export const distillResultSchema = z.object({ moved: z.number(), files: z.array(z.string()) }).readonly()

function method(id: string, method: string, parameters: InvocationDescriptor['parameters'], resultType: string, schema: z.ZodType): InvocationDescriptor {
  return {
    id: `dsh-memory#memory/${method}`,
    service: 'memory',
    namespace: 'memory',
    method,
    invocation: { kind: 'direct' },
    parameters,
    result: { mode: 'strict', typeSymbol: `dsh-memory#${resultType}`, schema },
  }
}

export const MEMORY_INVOCATIONS: readonly InvocationDescriptor[] = [
  method('get-settings', 'getSettings', [], 'GetSettingsResult', getSettingsResultSchema),
  method('set-settings', 'setSettings', [{ name: 'settings', wire: 'settings', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-memory#MemorySettings', schema: settingsSchema } }], 'Ok', okResultSchema),
  method('read-profile', 'readProfile', [], 'Profile', profileResultSchema),
  method('write-profile', 'writeProfile', [{ name: 'content', wire: 'content', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-memory#WriteProfileRequest', schema: writeProfileRequestSchema } }], 'Ok', okResultSchema),
  method('write-profile-fact', 'writeProfileFact', [{ name: 'section', wire: 'section', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-memory#WriteProfileFactRequest', schema: writeProfileFactRequestSchema } }], 'Ok', okResultSchema),
  method('list-topics', 'listTopics', [], 'Topics', topicsResultSchema),
  method('read-topic', 'readTopic', [{ name: 'topic', wire: 'topic', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-memory#ReadTopicRequest', schema: readTopicRequestSchema } }], 'Profile', profileResultSchema),
  method('search', 'search', [{ name: 'keywords', wire: 'keywords', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-memory#SearchRequest', schema: searchRequestSchema } }], 'SearchResult', searchResultSchema),
  method('injection-preview', 'getInjectionPreview', [], 'InjectionPreview', injectionPreviewSchema),
  method('distill', 'distill', [], 'DistillResult', distillResultSchema),
]

export type RemoteResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string; details: object } }

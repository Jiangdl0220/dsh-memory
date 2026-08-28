/** Memory item kind, aligned with the DSH memory schema (fact/decision/howto). */
export type MemoryItemKind = 'fact' | 'decision' | 'howto'

/** One distilled memory entry. */
export interface MemoryItem {
  kind: MemoryItemKind
  topic: string
  text: string
  at: string
}

/** The structured summary the LLM returns for one session span. */
export interface SummaryResult {
  facts: MemoryItem[]
  decisions: MemoryItem[]
  howtos: MemoryItem[]
}

/** Plugin configuration (from cordis.patch.yml `config`; defaults applied in config.ts). */
export interface MemoryConfig {
  /** Root of the human-readable memory store. */
  memoryHome: string
  /** Min turns between two incremental summaries (debounce by count). */
  minTurnsBetweenSummary: number
  /** Debounce window (ms) after a turn before summarizing. */
  stabilizeMs: number
  /** Upper bound (bytes) of the raw span read for one summary. */
  maxSpanBytes: number
  /** Output token cap; must be large enough that reasoning does not starve text. */
  summarizationMaxTokens: number
  /** Reasoning effort for the summary call: keep thinking for quality, off for cost. */
  summaryReasoningEffort: 'default' | 'off' | 'low' | 'high' | 'max'
  /** Optional provider override for the summary model (empty = follow session). */
  summaryProvider: string
  /** Optional model override for the summary model (empty = follow session). */
  summaryModel: string
  /** Max user/assistant messages read into one summary window. */
  maxMessagesPerSummary: number
}

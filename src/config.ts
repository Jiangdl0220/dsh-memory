import type { MemoryConfig } from './types.ts'

/** Resolve the DSH home directory (matches the deployment default). */
export function dshHome(env: NodeJS.ProcessEnv = process.env): string {
  return env.DSH_HOME ?? `${env.HOME ?? ''}/.dsh`
}

/** Expand a leading `~` to the home directory (ctx.fs.resolve does not). */
function expandHome(path: string, env: NodeJS.ProcessEnv): string {
  if (path === '~') return env.HOME ?? path
  if (path.startsWith('~/')) return `${env.HOME ?? ''}${path.slice(1)}`
  return path
}

/** Plugin defaults; merge over any user-provided config from cordis.patch.yml. */
export function resolveConfig(
  input: Partial<MemoryConfig> = {},
  env: NodeJS.ProcessEnv = process.env,
): MemoryConfig {
  return {
    memoryHome: expandHome(input.memoryHome ?? `${dshHome(env)}/memory`, env),
    minTurnsBetweenSummary: input.minTurnsBetweenSummary ?? 3,
    stabilizeMs: input.stabilizeMs ?? 3000,
    maxSpanBytes: input.maxSpanBytes ?? 65536,
    summarizationMaxTokens: input.summarizationMaxTokens ?? 4096,
    summaryReasoningEffort: input.summaryReasoningEffort ?? 'default',
    summaryProvider: input.summaryProvider ?? '',
    summaryModel: input.summaryModel ?? '',
    maxMessagesPerSummary: input.maxMessagesPerSummary ?? 10,
  }
}

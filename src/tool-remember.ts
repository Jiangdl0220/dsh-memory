import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { MemoryConfig } from './types.ts'
import { MemoryStore } from './store.ts'

const SECTION_BY_CATEGORY: Record<string, string> = {
  health: '身体数据',
  style: '偏好',
  family: '家庭',
  goal: '进行中',
  other: '偏好',
}

/**
 * M2: register the `remember(fact, category)` tool so the agent can write a
 * long-term user fact straight into profile.md during the conversation.
 * Wrapped in defineTool so the bare `parameters` spec becomes an object-rooted
 * JSON Schema for the model-facing function schema.
 */
export function registerRememberTool(ctx: Context, _cfg: MemoryConfig, store: MemoryStore): void {
  const tools = ctx.get('tools') as any
  ctx.effect(() => tools.register(defineTool({
    name: 'remember',
    description: '把一句长期事实写入用户画像（仅当确为长期事实时调用；一次性事件不要记录）。',
    parameters: {
      fact: { type: 'string', required: true, description: '长期事实的一句话，例如"身高 182cm，减脂中，目标 83kg"。' },
      category: {
        type: 'string', required: true,
        enum: ['health', 'style', 'family', 'goal', 'other'],
        description: '事实归属类别。',
      },
    },
    output: {
      schema: {
        type: 'object', additionalProperties: false,
        properties: { ok: { type: 'boolean' } },
      },
      render: (_args: any, value: any) => [{ type: 'text', text: `已记忆：${value.ok ? '已写入 profile.md' : '未写入'}` }],
    },
    execute: async (args: { fact: string; category: string }) => {
      const section = SECTION_BY_CATEGORY[args.category] ?? '偏好'
      await store.writeProfileFact(section, args.fact)
      return { ok: true }
    },
  })))
}

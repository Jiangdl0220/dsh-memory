/**
 * dsh-memory client plugin: the browser half. Mounts the `memory` Remote
 * namespace and registers the 「记忆与个性化」 settings section — four tabs for
 * custom instructions/profile/library. Desktop and web share this bundle.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { NS, en, fmt, zh, type Translate } from './locales.ts'
import { MEMORY_REMOTE, type MemoryNamespaceFace } from './remote.ts'
import { SettingsSection } from './SettingsSection.tsx'
import { adoptStyles } from './styles.ts'
import { clearState, getTranslate, mountState } from './state.ts'

/** Cordis plugin name (the Loader entry and client bundle id). */
export const name = '@jiangdaoli/dsh-memory'

/** Required services: Remote gateway, slot system, and locale. */
export const inject = ['remote', 'slots', 'locale']

/**
 * Compose the memory surface.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  adoptStyles()
  ctx.effect(() => ctx.locale.register(NS, 'zh', zh), 'dsh-memory: zh dictionary')
  ctx.effect(() => ctx.locale.register(NS, 'en', en), 'dsh-memory: en dictionary')
  const bound = ctx.locale.bind(NS)
  const t: Translate = (key, params) => fmt(bound(key), params)

  ctx.effect(async () => {
    const dispose = await ctx.remote.$mount(MEMORY_REMOTE)
    const face = (ctx.reflect as unknown as { get(name: string): unknown }).get('remote.memory') as MemoryNamespaceFace | undefined
    if (face === undefined) {
      void dispose()
      throw new Error('dsh-memory: the memory Remote namespace did not mount')
    }
    mountState(face, t)
    return () => {
      clearState()
      void dispose()
    }
  }, 'dsh-memory: remote')

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'memory',
    order: 30,
    label: () => t('nav'),
  }, SettingsSection))
}

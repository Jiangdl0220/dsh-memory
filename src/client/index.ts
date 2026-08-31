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
 * Custom glyph for the memory section in the settings nav.
 *
 * The stock `settings.section` registration carries only `id`/`order`/`label` —
 * a section id that is not one of the shell's hardcoded cases always falls back
 * to the default gear. Third-party settings surfaces achieve a custom icon by
 * marking the rendered nav button and painting their own glyph over the gear
 * (see the CSS mask in styles.ts). This keeps a MutationObserver on the
 * document and tags the settings-dialog nav button whose text matches the
 * section label, so the mask takes over.
 * @param label - a getter for the current localized section label.
 * @returns a disposer that stops the observer and unmarks the button.
 */
function adoptSettingsNavGlyph(label: () => string): () => void {
  let disposed = false
  const sync = (): void => {
    if (disposed) return
    const current = label().trim()
    const buttons = document.querySelectorAll<HTMLButtonElement>('[role="dialog"] nav button')
    buttons.forEach((button) => {
      if (current !== '' && button.textContent?.trim() === current) button.setAttribute('data-dsh-mem-nav-icon', '')
      else button.removeAttribute('data-dsh-mem-nav-icon')
    })
  }
  sync()
  const observer = new MutationObserver(sync)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  return () => {
    disposed = true
    observer.disconnect()
    document.querySelectorAll('[data-dsh-mem-nav-icon]').forEach((element) => element.removeAttribute('data-dsh-mem-nav-icon'))
  }
}

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

  // Custom settings-nav glyph (the section registration cannot carry an icon):
  // tag the nav button matching our label so the CSS mask paints our icon over
  // the default gear. Reactive to the dialog mounting and to locale changes.
  ctx.effect(() => adoptSettingsNavGlyph(() => getTranslate()?.('nav') ?? '记忆与个性化'), 'dsh-memory: settings nav glyph')
}

import { useEffect, useMemo, useState, type ReactElement } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { MemoryItem, MemorySettings } from '../contract.ts'
import { getRemote, getTranslate, subscribe } from './state.ts'
import type { Translate } from './locales.ts'

type Tab = 'rules' | 'memory' | 'browse' | 'distill'

type Loader<T> = { value: T | null; error: string | null; loading: boolean }

const empty = <T,>(): Loader<T> => ({ value: null, error: null, loading: false })

function useRemoteTick(): number {
  const [, set] = useState(0)
  useEffect(() => subscribe(() => set((n) => n + 1)), [])
  return 0
}

/** Human label for an item kind (fact/decision/howto). */
function kindLabel(kind: MemoryItem['kind'], t: Translate): string {
  return t(`kind.${kind}`)
}

function TabRules({ t }: { t: Translate }): ReactElement {
  const remote = getRemote()
  const [settings, setSettings] = useState<MemorySettings>({ toneStyle: '', customPrompt: '', summaryReasoningEffort: 'default' })
  const [state, setState] = useState<Loader<{ saved: boolean }>>(empty())
  useRemoteTick()
  useEffect(() => { remote?.getSettings().then((r) => { if (r.ok) setSettings(r.value.settings) }) }, [remote])
  const save = (): void => {
    setState({ value: null, error: null, loading: true })
    remote?.setSettings(settings).then((r) => {
      if (r.ok) setState({ value: { saved: true }, error: null, loading: false })
      else setState({ value: null, error: r.error.message, loading: false })
    })
  }
  return (
    <div className="dsh_mem_pane">
      <p className="dsh_mem_intro">{t('rules.intro')}</p>
      <div className="dsh_mem_card">
        <div className="dsh_mem_field">
          <label className="dsh_mem_label">{t('rules.tone')}</label>
          <input className="dsh_mem_input" value={settings.toneStyle} placeholder={t('rules.toneHint')}
            onChange={(e) => setSettings({ ...settings, toneStyle: e.target.value })} />
          <span className="dsh_mem_hint">{t('rules.toneHint')}</span>
        </div>
        <div className="dsh_mem_field">
          <label className="dsh_mem_label">{t('rules.reasoning')}</label>
          <div className="dsh_mem_select_wrap">
            <select className="dsh_mem_select" value={settings.summaryReasoningEffort}
              onChange={(e) => setSettings({ ...settings, summaryReasoningEffort: e.target.value as MemorySettings['summaryReasoningEffort'] })}>
              <option value="default">{t('rules.reasoningDefault')}</option>
              <option value="off">{t('rules.reasoningOff')}</option>
              <option value="low">{t('rules.reasoningLow')}</option>
              <option value="high">{t('rules.reasoningHigh')}</option>
              <option value="max">{t('rules.reasoningMax')}</option>
            </select>
          </div>
        </div>
        <div className="dsh_mem_field">
          <label className="dsh_mem_label">{t('rules.customPrompt')}</label>
          <textarea className="dsh_mem_textarea" rows={6} value={settings.customPrompt} placeholder={t('rules.customPromptHint')}
            onChange={(e) => setSettings({ ...settings, customPrompt: e.target.value })} />
        </div>
        <div className="dsh_mem_footer">
          <button className="dsh_mem_btn dsh_mem_btn_primary" disabled={state.loading} onClick={save}>
            {state.loading ? t('busy') : state.value ? '✓ ' + t('rules.saved') : t('rules.save')}
          </button>
          {state.error && <span className="dsh_mem_error">{t('error', { msg: state.error })}</span>}
        </div>
      </div>
    </div>
  )
}

function TabMemory({ t }: { t: Translate }): ReactElement {
  const remote = getRemote()
  const [content, setContent] = useState('')
  const [state, setState] = useState<Loader<{ saved: boolean }>>(empty())
  useRemoteTick()
  useEffect(() => { remote?.readProfile().then((r) => { if (r.ok) setContent(r.value.content) }) }, [remote])
  const sections = useMemo(
    () => content.split('\n').filter((l) => l.startsWith('## ')).map((l) => l.replace(/^##\s*/, '').trim()).filter(Boolean),
    [content],
  )
  const save = (): void => {
    setState({ value: null, error: null, loading: true })
    remote?.writeProfile(content).then((r) => {
      if (r.ok) setState({ value: { saved: true }, error: null, loading: false })
      else setState({ value: null, error: r.error.message, loading: false })
    })
  }
  return (
    <div className="dsh_mem_pane">
      <p className="dsh_mem_intro">{t('memory.intro')}</p>
      <div className="dsh_mem_editor">
        <div className="dsh_mem_editor_head">
          <span className="dsh_mem_file">profile.md</span>
          <span className="dsh_mem_meta">{t('memory.meta', { chars: String(content.length), sections: String(sections.length) })}</span>
        </div>
        <div className="dsh_mem_chips">
          {sections.length === 0
            ? <span className="dsh_mem_chip_empty"># (no sections yet)</span>
            : sections.map((s) => <span key={s} className="dsh_mem_chip"># {s}</span>)}
        </div>
        <textarea className="dsh_mem_editor_area" value={content} onChange={(e) => setContent(e.target.value)}
          spellCheck={false} autoCapitalize="off" autoCorrect="off" />
        <div className="dsh_mem_footer">
          <button className="dsh_mem_btn dsh_mem_btn_primary" disabled={state.loading} onClick={save}>
            {state.loading ? t('busy') : t('memory.save')}
          </button>
          {state.value && !state.error && <span className="dsh_mem_saved">✓ {t('memory.saved')}</span>}
          {state.error && <span className="dsh_mem_error">{t('error', { msg: state.error })}</span>}
        </div>
      </div>
    </div>
  )
}

function TabBrowse({ t }: { t: Translate }): ReactElement {
  const remote = getRemote()
  const [topics, setTopics] = useState<string[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [body, setBody] = useState('')
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<MemoryItem[]>([])
  const [preview, setPreview] = useState<{ profile: string; items: MemoryItem[] } | null>(null)
  useRemoteTick()

  const refresh = (): void => {
    remote?.listTopics().then((r) => { if (r.ok) setTopics(r.value.topics) })
    remote?.getInjectionPreview().then((r) => { if (r.ok) setPreview(r.value) })
  }
  useEffect(() => { refresh() }, [remote])

  const open = (topic: string): void => {
    setActive(topic)
    remote?.readTopic(topic).then((r) => { if (r.ok) setBody(r.value.content) })
  }
  const doSearch = (): void => {
    remote?.search(query).then((r) => { if (r.ok) setHits(r.value.items); else setHits([]) })
  }

  return (
    <div className="dsh_mem_pane">
      <p className="dsh_mem_intro">{t('browse.intro')}</p>
      <div className="dsh_mem_search">
        <input className="dsh_mem_input" value={query} placeholder={t('browse.search')}
          onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') doSearch() }} />
        <button className="dsh_mem_btn dsh_mem_btn_outline dsh_mem_btn_sm" onClick={doSearch}>{t('browse.refresh')}</button>
      </div>

      {hits.length > 0 && (
        <div className="dsh_mem_results">
          <div className="dsh_mem_results_head">{t('browse.results')} · {hits.length}</div>
          <div className="dsh_mem_list">
            {hits.map((it, i) => (
              <div key={i} className="dsh_mem_item">
                <span className={`dsh_mem_badge dsh_mem_badge_${it.kind}`}>{kindLabel(it.kind, t)}</span>
                <div className="dsh_mem_item_body">
                  <div className="dsh_mem_item_topic">{it.topic}</div>
                  <div className="dsh_mem_item_text">{it.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dsh_mem_split">
        <div className="dsh_mem_split_left">
          <div className="dsh_mem_split_head">{t('browse.topics')}</div>
          {topics.length === 0 && <p className="dsh_mem_muted">{t('browse.empty')}</p>}
          <div className="dsh_mem_topics">
            {topics.map((topic) => (
              <button key={topic} className="dsh_mem_topic" data-active={active === topic} onClick={() => open(topic)}>{topic}</button>
            ))}
          </div>
        </div>
        <div className="dsh_mem_split_right">
          <div className="dsh_mem_split_head">{active ? active : t('browse.topic')}</div>
          <pre className="dsh_mem_preview_surface">{active ? body : ''}</pre>
        </div>
      </div>

      {preview && (
        <div className="dsh_mem_preview_card">
          <div className="dsh_mem_preview_head">{t('browse.preview')}</div>
          <div className="dsh_mem_preview_body">
            {preview.profile ? preview.profile + '\n' : ''}
            {preview.items.length === 0 && preview.profile === ''
              ? t('browse.empty')
              : preview.items.map((it) => `- ${kindLabel(it.kind, t)}（${it.topic}）：${it.text}`).join('\n')}
          </div>
        </div>
      )}
    </div>
  )
}

function TabDistill({ t }: { t: Translate }): ReactElement {
  const remote = getRemote()
  const [result, setResult] = useState<{ moved: number; files: string[] } | null>(null)
  const [busy, setBusy] = useState(false)
  useRemoteTick()
  const run = (): void => {
    setBusy(true)
    remote?.distill().then((r) => { setBusy(false); if (r.ok) setResult(r.value) })
  }
  const summary = result
    ? result.moved === 0
      ? t('distill.none')
      : t('distill.moved', { moved: String(result.moved), files: String(result.files.length) })
    : ''
  return (
    <div className="dsh_mem_pane">
      <p className="dsh_mem_intro">{t('distill.intro')}</p>
      <div className="dsh_mem_card dsh_mem_card_center">
        <button className="dsh_mem_btn dsh_mem_btn_primary" disabled={busy} onClick={run}>
          {busy ? t('busy') : t('distill.run')}
        </button>
        {result && <pre className="dsh_mem_distill_result">{summary}</pre>}
      </div>
    </div>
  )
}

/** The memory settings section: 4 tabs across rules / profile / library / distill. */
export function SettingsSection(_props: PropsRuntime<'settings.section'>): ReactElement {
  const [tab, setTab] = useState<Tab>('rules')
  useRemoteTick()
  const t: Translate = getTranslate() ?? ((key: any) => String(key))
  const tabs: Array<[Tab, string]> = [
    ['rules', t('tab.rules')],
    ['memory', t('tab.memory')],
    ['browse', t('tab.browse')],
    ['distill', t('tab.distill')],
  ]
  return (
    <div className="dsh_mem_root">
      <div className="dsh_mem_tabs">
        {tabs.map(([id, label]) => (
          <button key={id} className="dsh_mem_tab" data-active={tab === id} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === 'rules' && <TabRules t={t} />}
      {tab === 'memory' && <TabMemory t={t} />}
      {tab === 'browse' && <TabBrowse t={t} />}
      {tab === 'distill' && <TabDistill t={t} />}
    </div>
  )
}

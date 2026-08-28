/** Stable `<style>` element id (idempotent across HMR re-runs). */
export const STYLE_ID = 'dsh-memory-style'

/** The injected stylesheet text (colors from the `--dsw-alias-*` tokens). */
export const cssText = `
.dsh_mem_root { font-family: inherit; color: var(--dsw-alias-label-primary); }
.dsh_mem_intro { font-size: 12px; color: var(--dsw-alias-label-tertiary); line-height: 1.7; margin-bottom: 14px; max-width: 640px; }
.dsh_mem_tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.dsh_mem_tab { padding: 6px 12px; border: 1px solid var(--dsw-alias-border); border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; font-size: 13px; }
.dsh_mem_tab[data-active="true"] { background: var(--dsw-alias-accent, rgba(0,0,0,.06)); color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-accent); }
.dsh_mem_field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; max-width: 640px; }
.dsh_mem_label { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.dsh_mem_input, .dsh_mem_textarea, .dsh_mem_select { font: inherit; padding: 8px 10px; border: 1px solid var(--dsw-alias-border); border-radius: 8px; background: var(--dsw-alias-fill-secondary, transparent); color: var(--dsw-alias-label-primary); }
.dsh_mem_textarea { min-height: 120px; resize: vertical; }
.dsh_mem_btn { font-size: 13px; padding: 7px 14px; border: 1px solid var(--dsw-alias-border); border-radius: 8px; background: var(--dsw-alias-fill-secondary, transparent); color: var(--dsw-alias-label-primary); cursor: pointer; }
.dsh_mem_btn[data-primary="true"] { background: var(--dsw-alias-accent, #111); color: var(--dsw-alias-label-on-accent, #fff); border-color: transparent; }
.dsh_mem_btn:disabled { opacity: .5; cursor: default; }
.dsh_mem_row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.dsh_mem_muted { font-size: 12px; color: var(--dsw-alias-label-tertiary); }
.dsh_mem_list { max-width: 720px; }
.dsh_mem_item { padding: 8px 0; border-bottom: 1px dashed var(--dsw-alias-border); font-size: 13px; }
.dsh_mem_item b { font-weight: 600; }
.dsh_mem_preview { background: var(--dsw-alias-fill-secondary, rgba(0,0,0,.04)); border-radius: 8px; padding: 12px; font-size: 13px; white-space: pre-wrap; max-width: 720px; }
.dsh_mem_error { color: var(--dsw-alias-danger, #c0392b); font-size: 12px; }
`

/** Inject the stylesheet once (idempotent). */
export function adoptStyles(): void {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = cssText
  document.head.appendChild(style)
}

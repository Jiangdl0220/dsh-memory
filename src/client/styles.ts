/**
 * dsh-memory settings stylesheet. Real DSH theme tokens only (no non-existent
 * `--dsw-alias-border`): visible input borders, a proper focus ring, brand
 * primary for the active tab + primary button, and a coherent light/dark look.
 */
export const STYLE_ID = 'dsh-memory-style'

const cssText = `
.dsh_mem_root {
  --mem-border: var(--dsw-alias-border-l3);
  --mem-border-soft: var(--dsw-alias-border-l2);
  --mem-fill: var(--dsw-alias-interactive-bg-hover);
  --mem-accent: var(--dsw-alias-brand-primary);
  --mem-radius: 10px;
  font-family: inherit;
  color: var(--dsw-alias-label-primary);
}

.dsh_mem_head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}
.dsh_mem_title {
  font-size: 14px;
  font-weight: 650;
  letter-spacing: .01em;
  color: var(--dsw-alias-label-primary);
}
.dsh_mem_hint { font-size: 11px; color: var(--dsw-alias-label-tertiary); }

.dsh_mem_intro {
  font-size: 12px;
  color: var(--dsw-alias-label-secondary);
  line-height: 1.7;
  margin: 6px 0 14px;
  max-width: 640px;
}

.dsh_mem_tabs {
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  margin-bottom: 16px;
  background: var(--mem-fill);
  border: 1px solid var(--mem-border-soft);
  border-radius: 12px;
}
.dsh_mem_tab {
  padding: 6px 14px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 550;
  transition: background .15s ease, color .15s ease;
}
.dsh_mem_tab:hover { color: var(--dsw-alias-label-primary); }
.dsh_mem_tab[data-active="true"] {
  background: var(--dsw-alias-button-elevated-fill);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 1px 2px rgba(0,0,0,.12);
}

.dsh_mem_field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; max-width: 640px; }
.dsh_mem_label { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); }

.dsh_mem_input,
.dsh_mem_textarea,
.dsh_mem_select {
  font: inherit;
  font-size: 13px;
  padding: 8px 11px;
  border: 1px solid var(--mem-border);
  border-radius: var(--mem-radius);
  background: var(--mem-fill);
  color: var(--dsw-alias-label-primary);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.dsh_mem_input:hover,
.dsh_mem_textarea:hover,
.dsh_mem_select:hover { border-color: var(--mem-border); }
.dsh_mem_input:focus,
.dsh_mem_textarea:focus,
.dsh_mem_select:focus {
  outline: none;
  border-color: var(--mem-accent);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--mem-accent) 25%, transparent);
}
.dsh_mem_textarea { min-height: 120px; resize: vertical; }

.dsh_mem_btn {
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 16px;
  border: 1px solid var(--mem-border);
  border-radius: var(--mem-radius);
  background: var(--mem-fill);
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease;
}
.dsh_mem_btn:hover { background: var(--dsw-alias-interactive-bg-active); }
.dsh_mem_btn[data-primary="true"] {
  background: var(--mem-accent);
  color: var(--dsw-alias-label-primary-inverted);
  border-color: transparent;
}
.dsh_mem_btn[data-primary="true"]:hover { background: var(--dsw-alias-button-primary-hover); }
.dsh_mem_btn:disabled { opacity: .5; cursor: default; }

.dsh_mem_row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.dsh_mem_muted { font-size: 12px; color: var(--dsw-alias-label-tertiary); }

.dsh_mem_list { max-width: 720px; display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.dsh_mem_item {
  padding: 9px 12px;
  border: 1px solid var(--mem-border-soft);
  border-radius: var(--mem-radius);
  background: var(--mem-fill);
  font-size: 13px;
}
.dsh_mem_item b { font-weight: 650; margin-right: 4px; }

.dsh_mem_preview {
  background: var(--mem-fill);
  border: 1px solid var(--mem-border-soft);
  border-radius: var(--mem-radius);
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  max-width: 720px;
  color: var(--dsw-alias-label-secondary);
}
.dsh_mem_error { color: var(--dsw-alias-state-error-primary); font-size: 12px; }
`

/** Inject the stylesheet once (idempotent). */
export function adoptStyles(): void {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = cssText
  document.head.appendChild(style)
}

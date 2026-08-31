/**
 * dsh-memory settings stylesheet.
 *
 * Ground truth: DSH's own primitives. Controls mirror the real design language
 * (input = 1px var(--dsw-alias-border-l2) on bg-layer-1, brand focus; buttons =
 * 18px capsule, primary fill). The memory "file" is presented as a spacious
 * monospace document editor with a header bar + live section chips, and the
 * library is a real two-pane browser. Only tokens that exist in DSH are used
 * (no `--dsw-alias-button-elevated-fill`, no bare `--dsw-alias-border`).
 */

export const STYLE_ID = 'dsh-memory-style'

const cssText = `
.dsh_mem_root {
  --mem-accent: var(--dsw-alias-button-info-fill, var(--dsw-static-deepseek-500, #4176e6));
  --mem-surface: var(--dsw-alias-bg-layer-1);
  --mem-surface-raise: var(--dsw-alias-bg-layer-2);
  --mem-border: var(--dsw-alias-border-l2);
  --mem-border-strong: var(--dsw-alias-border-l3);
  --mem-mono: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  --mem-radius: 10px;
  font-family: inherit;
  color: var(--dsw-alias-label-primary);
  box-sizing: border-box;
}
.dsh_mem_root *, .dsh_mem_root *::before, .dsh_mem_root *::after { box-sizing: border-box; }

/* ---------- Top-level ---------- */
.dsh_mem_root { max-width: 780px; }
.dsh_mem_pane { display: flex; flex-direction: column; gap: 14px; }

.dsh_mem_intro {
  font-size: 13px;
  color: var(--dsw-alias-label-secondary);
  line-height: 1.65;
  margin: 0;
  max-width: 640px;
}

/* ---------- Toggle tabs (segmented) ---------- */
.dsh_mem_tabs {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  margin-bottom: 2px;
  background: var(--dsw-alias-bg-base);
  border: 1px solid var(--mem-border);
  border-radius: 12px;
}
.dsh_mem_tab {
  padding: 7px 16px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 560;
  line-height: 20px;
  outline: none;
  transition: background .16s ease, color .16s ease, box-shadow .16s ease;
}
.dsh_mem_tab:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.dsh_mem_tab:focus-visible {
  outline: 2px solid var(--mem-accent);
  outline-offset: 2px;
}
.dsh_mem_tab[data-active="true"] {
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font-weight: 620;
  box-shadow: inset 0 -2px 0 var(--mem-accent), 0 1px 2px rgba(0,0,0,.22);
}
/* Kill the native focus outline on any interaction (mouse click) but keep a
   ring for keyboard users via :focus-visible. */
.dsh_mem_root .dsh_mem_tab:focus,
.dsh_mem_root .dsh_mem_btn:focus,
.dsh_mem_root .dsh_mem_topic:focus { outline: none; }

/* ---------- Card ---------- */
.dsh_mem_card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  background: var(--mem-surface);
  border: 1px solid var(--mem-border);
  border-radius: 14px;
}
.dsh_mem_card_center { align-items: flex-start; }

/* ---------- Field ---------- */
.dsh_mem_field { display: flex; flex-direction: column; gap: 6px; }
.dsh_mem_label { font-size: 12.5px; font-weight: 620; color: var(--dsw-alias-label-primary); letter-spacing: .01em; }
.dsh_mem_hint { font-size: 11.5px; color: var(--dsw-alias-label-tertiary); line-height: 1.5; }

/* ---------- Controls (mirror DSH Input/Button) ---------- */
.dsh_mem_input,
.dsh_mem_textarea,
.dsh_mem_select {
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  padding: 6px 10px;
  border: 1px solid var(--mem-border);
  border-radius: 8px;
  background: var(--mem-surface-raise);
  color: var(--dsw-alias-label-primary);
  transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
  width: 100%;
}
.dsh_mem_input, .dsh_mem_select { height: 34px; }
.dsh_mem_input::placeholder, .dsh_mem_textarea::placeholder { color: var(--dsw-alias-label-dimmed); }
.dsh_mem_input:hover, .dsh_mem_textarea:hover, .dsh_mem_select:hover { border-color: var(--mem-border-strong); }
.dsh_mem_input:focus, .dsh_mem_textarea:focus, .dsh_mem_select:focus {
  outline: none;
  border-color: var(--mem-accent);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--mem-accent) 18%, transparent);
}
.dsh_mem_textarea { min-height: 128px; resize: vertical; }

.dsh_mem_select_wrap { position: relative; width: 100%; }
.dsh_mem_select_wrap .dsh_mem_select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 34px;
  cursor: pointer;
}
.dsh_mem_select_wrap::after {
  content: "";
  position: absolute;
  right: 13px;
  top: 50%;
  width: 8px;
  height: 8px;
  margin-top: -6px;
  transform: rotate(45deg);
  border-right: 1.5px solid var(--dsw-alias-label-tertiary);
  border-bottom: 1.5px solid var(--dsw-alias-label-tertiary);
  pointer-events: none;
}
.dsh_mem_select_wrap:focus-within::after { border-color: var(--mem-accent); }

/* ---------- Buttons (DSH capsule) ---------- */
.dsh_mem_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  color: var(--dsw-alias-label-primary);
  background: transparent;
  cursor: pointer;
  padding: 0 14px;
  height: 36px;
  border-radius: 18px;
  white-space: nowrap;
  outline: none;
  transition: background .15s ease, border-color .15s ease, opacity .15s ease;
}
.dsh_mem_btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.dsh_mem_btn:active:not(:disabled) { background: var(--dsw-alias-interactive-bg-active); }
.dsh_mem_btn:focus-visible {
  outline: 2px solid var(--mem-accent);
  outline-offset: 2px;
}
.dsh_mem_btn:disabled { cursor: not-allowed; opacity: .45; }
.dsh_mem_btn_primary {
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground);
  font-weight: 570;
}
.dsh_mem_btn_primary:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.dsh_mem_btn_primary:active:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.dsh_mem_btn_outline { border: 1px solid var(--mem-border); }
.dsh_mem_btn_sm { height: 32px; padding: 0 12px; font-size: 13px; border-radius: 16px; }

/* ---------- Menu bar (editor header) ---------- */
.dsh_mem_editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: var(--mem-surface);
  border: 1px solid var(--mem-border);
  border-radius: 14px;
}
.dsh_mem_editor_head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dsh_mem_file {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--mem-mono);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
  letter-spacing: .02em;
}
.dsh_mem_file::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dsw-alias-state-success-primary);
}
.dsh_mem_meta { font-size: 11.5px; color: var(--dsw-alias-label-tertiary); margin-left: auto; }
.dsh_mem_chips { display: flex; flex-wrap: wrap; gap: 6px; }
.dsh_mem_chip {
  font-family: var(--mem-mono);
  font-size: 11px;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-interactive-bg-hover);
  border: 1px solid var(--mem-border);
  border-radius: 999px;
  padding: 2px 9px;
}
.dsh_mem_chip_empty { font-family: var(--mem-mono); font-size: 11px; color: var(--dsw-alias-label-tertiary); }

.dsh_mem_editor_area {
  min-height: 300px;
  height: clamp(320px, 42vh, 540px);
  font-family: var(--mem-mono);
  font-size: 13px;
  line-height: 1.7;
  tab-size: 2;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  overflow-x: auto;
  background: var(--dsw-alias-markdown-code-block);
  border: 1px solid var(--mem-border-strong);
  border-radius: 10px;
  padding: 14px 16px;
}
.dsh_mem_editor_area:focus { border-color: var(--mem-accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--mem-accent) 18%, transparent); }

/* ---------- Helpers ---------- */
.dsh_mem_footer { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.dsh_mem_row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dsh_mem_muted { font-size: 12px; color: var(--dsw-alias-label-tertiary); line-height: 1.5; }
.dsh_mem_error { font-size: 12.5px; color: var(--dsw-alias-state-error-primary); }
.dsh_mem_saved {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: var(--dsw-alias-state-success-primary);
  font-weight: 560;
}

/* ---------- Search ---------- */
.dsh_mem_search { display: flex; gap: 8px; align-items: center; }
.dsh_mem_search .dsh_mem_input { flex: 1; }

/* ---------- Results ---------- */
.dsh_mem_results { display: flex; flex-direction: column; gap: 8px; }
.dsh_mem_results_head { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); }
.dsh_mem_list { display: flex; flex-direction: column; gap: 8px; }
.dsh_mem_item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  background: var(--mem-surface);
  border: 1px solid var(--mem-border);
  border-radius: var(--mem-radius);
}
.dsh_mem_item_body { flex: 1; min-width: 0; }
.dsh_mem_item_topic { font-size: 12px; font-weight: 630; color: var(--dsw-alias-label-secondary); margin-bottom: 2px; }
.dsh_mem_item_text { font-size: 13px; line-height: 1.55; color: var(--dsw-alias-label-primary); word-break: break-word; }

.dsh_mem_badge {
  flex: none;
  font-size: 10.5px;
  font-weight: 620;
  letter-spacing: .04em;
  text-transform: uppercase;
  padding: 2.5px 8px;
  border-radius: 999px;
  border: 1px solid currentColor;
}
.dsh_mem_badge_fact { color: var(--dsw-alias-state-success-primary); background: color-mix(in oklab, var(--dsw-alias-state-success-primary) 12%, transparent); }
.dsh_mem_badge_decision { color: var(--dsw-alias-brand-primary); background: color-mix(in oklab, var(--dsw-alias-brand-primary) 12%, transparent); }
.dsh_mem_badge_howto { color: var(--dsw-alias-state-warn-primary); background: color-mix(in oklab, var(--dsw-alias-state-warn-primary) 12%, transparent); }

/* ---------- Split pane (library) ---------- */
.dsh_mem_split {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 12px;
  align-items: stretch;
}
.dsh_mem_split_left, .dsh_mem_split_right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--mem-surface);
  border: 1px solid var(--mem-border);
  border-radius: var(--mem-radius);
  padding: 12px;
  min-width: 0;
}
.dsh_mem_split_head { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); }
.dsh_mem_topics { display: flex; flex-direction: column; gap: 4px; max-height: 260px; overflow: auto; }
.dsh_mem_topic {
  text-align: left;
  font-family: var(--mem-mono);
  font-size: 12px;
  color: var(--dsw-alias-label-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  outline: none;
  transition: background .14s ease, color .14s ease, border-color .14s ease;
}
.dsh_mem_topic:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dsh_mem_topic:focus-visible {
  outline: 2px solid var(--mem-accent);
  outline-offset: 2px;
}
.dsh_mem_topic[data-active="true"] {
  background: var(--dsw-alias-interactive-bg-active);
  color: var(--dsw-alias-label-primary);
  border-color: var(--mem-border-strong);
  font-weight: 600;
}
.dsh_mem_preview_surface {
  flex: 1;
  min-height: 240px;
  max-height: 320px;
  overflow: auto;
  margin: 0;
  font-family: var(--mem-mono);
  font-size: 12.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-markdown-code-block);
  border: 1px solid var(--mem-border-strong);
  border-radius: 8px;
  padding: 12px 14px;
}

/* ---------- Injection preview ---------- */
.dsh_mem_preview_card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: var(--mem-surface);
  border: 1px solid var(--mem-border);
  border-left: 3px solid var(--dsw-alias-state-warn-primary);
  border-radius: var(--mem-radius);
}
.dsh_mem_preview_head { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); }
.dsh_mem_preview_body {
  font-family: var(--mem-mono);
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--dsw-alias-label-dimmed);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 220px;
  overflow: auto;
}

/* ---------- Distill ---------- */
.dsh_mem_distill_result {
  font-family: var(--mem-mono);
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-markdown-code-block);
  border: 1px solid var(--mem-border);
  border-radius: 8px;
  padding: 10px 12px;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 100%;
}

/* ---------- Responsive ---------- */
@media (max-width: 640px) {
  .dsh_mem_split { grid-template-columns: 1fr; }
  .dsh_mem_meta { margin-left: 0; width: 100%; }
}
`

/** Inject the stylesheet once (idempotent). */
export function adoptStyles(): void {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = cssText
  document.head.appendChild(style)
}

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

/** The settings-nav glyph: DSH's own `IconPersonalizationOutline16` path (three
 *  personalization sliders), painted over the default gear via a CSS mask. */
const NAV_PATH = 'M10.3232 9.18164C11.2868 9.18164 12.0985 9.82833 12.3506 10.7109L13.415 10.7109L13.415 11.8711L12.3496 11.8711C12.0971 12.7532 11.2864 13.3994 10.3232 13.3994C9.36031 13.3992 8.55012 12.7531 8.29785 11.8711L0 11.8711L0 10.7109L8.29688 10.7109C8.54876 9.82845 9.35988 9.18186 10.3232 9.18164ZM10.3232 10.3418C9.7999 10.3421 9.37534 10.7667 9.375 11.29C9.375 11.8137 9.79969 12.239 10.3232 12.2393C10.847 12.2393 11.2725 11.8138 11.2725 11.29C11.2721 10.7666 10.8468 10.3418 10.3232 10.3418ZM12.4326 11.291C12.4326 11.3549 12.4284 11.418 12.4229 11.4805C12.4287 11.4181 12.4326 11.355 12.4326 11.291ZM8.21484 11.2832C8.21484 11.2856 8.21484 11.2886 8.21484 11.291L8.21484 11.29C8.21484 11.2878 8.21484 11.2855 8.21484 11.2832ZM3.08301 4.59082C4.04605 4.59095 4.85696 5.23717 5.10938 6.11914L13.415 6.11914L13.415 7.2793L5.11035 7.2793C4.85833 8.16202 4.04648 8.80846 3.08301 8.80859C2.11972 8.80843 1.30963 8.16179 1.05762 7.2793L0 7.2793L0 6.11914L1.05762 6.11914C1.30994 5.23728 2.12006 4.59098 3.08301 4.59082ZM3.08301 5.75098C2.55962 5.75117 2.13512 6.17587 2.13477 6.69922C2.13477 7.22287 2.5594 7.64824 3.08301 7.64844C3.60665 7.64828 4.03223 7.2229 4.03223 6.69922C4.03187 6.17585 3.60643 5.75113 3.08301 5.75098ZM5.19238 6.69922C5.19238 6.763 5.18816 6.82633 5.18262 6.88867C5.18846 6.82629 5.19238 6.76313 5.19238 6.69922C5.19236 6.63495 5.18853 6.57152 5.18262 6.50879C5.18826 6.57154 5.19236 6.635 5.19238 6.69922ZM0.982422 6.52344C0.977382 6.58136 0.97463 6.63999 0.974609 6.69922C0.974609 6.75775 0.977496 6.81579 0.982422 6.87305C0.977758 6.81579 0.974609 6.75767 0.974609 6.69922C0.974628 6.64 0.977618 6.58142 0.982422 6.52344ZM10.3232 0C11.2869 0 12.0986 0.646596 12.3506 1.5293L13.415 1.5293L13.415 2.68945L12.3496 2.68945C12.363 2.64266 12.3754 2.59488 12.3857 2.54688C12.1838 3.50118 11.3376 4.21777 10.3232 4.21777C9.36037 4.21756 8.55018 3.57139 8.29785 2.68945L0 2.68945L0 1.5293L8.29688 1.5293C8.5487 0.646717 9.35981 0.00021854 10.3232 0ZM10.3232 1.16016C9.79984 1.16042 9.37524 1.58499 9.375 2.1084C9.375 2.63201 9.79969 3.05735 10.3232 3.05762C10.847 3.05762 11.2725 2.63217 11.2725 2.1084C11.2722 1.58483 10.8469 1.16016 10.3232 1.16016ZM12.4229 2.29883C12.4287 2.23641 12.4326 2.17331 12.4326 2.10938C12.4326 2.17327 12.4284 2.23638 12.4229 2.29883ZM8.21484 2.10938L8.21484 2.1084L8.21484 2.10938ZM8.22266 1.93359C8.21785 1.98897 8.21506 2.04499 8.21484 2.10156C8.21503 2.04501 8.2181 1.98902 8.22266 1.93359ZM8.22266 11.1162C8.2179 11.1713 8.21507 11.227 8.21484 11.2832C8.21504 11.227 8.21814 11.1713 8.22266 11.1162Z'

const NAV_MASK = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path transform='translate(1.292 1.3)' d='${NAV_PATH}'/></svg>`)

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
.dsh_mem_content {
  flex: 1;
  min-width: 0;
  min-height: 240px;
  max-height: 320px;
  overflow: auto;
  background: var(--mem-surface);
  border: 1px solid var(--mem-border-strong);
  border-radius: 8px;
  padding: 14px 16px;
}

/* ---------- Injection preview ---------- */
.dsh_mem_preview_card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  background: var(--mem-surface);
  border: 1px solid var(--mem-border);
  border-left: 3px solid var(--dsw-alias-state-warn-primary);
  border-radius: var(--mem-radius);
}
.dsh_mem_preview_head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary);
}
.dsh_mem_preview_hint { font-size: 11px; font-weight: 400; color: var(--dsw-alias-label-tertiary); }
.dsh_mem_preview_profile {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: var(--dsw-alias-interactive-bg-hover);
  border: 1px solid var(--mem-border);
  border-radius: 8px;
}
.dsh_mem_preview_label {
  font-family: var(--mem-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .02em;
  color: var(--dsw-alias-label-tertiary);
}
.dsh_mem_preview_profile_body { max-height: 150px; overflow: auto; }
.dsh_mem_preview_items { max-height: 260px; overflow: auto; }

/* ---------- Distill ---------- */
.dsh_mem_distill_result {
  font-family: var(--mem-mono);
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--dsw-alias-label-primary);
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

/* ---------- Settings-nav glyph (memory/personalization) ---------- */
/* The stock settings.section registration carries no icon field, so — the same
   approach third-party surfaces use — the plugin tags the settings-dialog nav
   button whose text matches the section label and paints its own glyph over the
   default gear via a CSS mask. See adoptSettingsNavGlyph() in index.ts. */
button[data-dsh-mem-nav-icon] > svg:first-child { display: none; }
button[data-dsh-mem-nav-icon]::before {
  content: '';
  flex: none;
  width: 16px;
  height: 16px;
  background: currentColor;
  -webkit-mask: url("${NAV_MASK}") no-repeat center / contain;
  mask: url("${NAV_MASK}") no-repeat center / contain;
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

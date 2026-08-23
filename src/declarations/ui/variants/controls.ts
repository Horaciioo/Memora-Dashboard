/**
 * Button styles
 * @type {Record<string, string>}
 */

export const BUTTON_STYLES = {
  base: 'inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm font-medium transition-[background-color,border-color,color,opacity] disabled:pointer-events-none disabled:opacity-50',
  primary:
    'bg-[var(--color-brand-600)] px-4 py-2 text-[var(--color-on-brand)] hover:bg-[var(--color-brand-700)]',
  secondary:
    'border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]',
  ghost:
    'px-3 py-2 text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]',
  danger:
    'border border-[var(--color-danger)] px-3 py-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]',
  icon: 'h-9 w-9 rounded-[var(--radius-md)] p-0 text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]',
} as const

export type ButtonVariant = keyof Omit<typeof BUTTON_STYLES, 'base'>

/**
 * Segmented styles
 * @type {Record<string, string>}
 */

export const SEGMENTED_STYLES = {
  group:
    'flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1',
  option: 'rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium transition-colors',
  selected: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  idle: 'text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]',
} as const

/**
 * Field styles shared by every input
 * @type {Record<string, string>}
 */

export const FIELD_STYLES = {
  wrapper: 'flex min-w-0 flex-col gap-1.5',
  label: 'text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  control:
    'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm text-[var(--color-ink)] transition-colors placeholder:text-[var(--color-ink-subtle)]/70 hover:border-[var(--color-border-strong)] disabled:opacity-60',
  invalid: 'border-[var(--color-danger)]',
  hint: 'text-xs text-[var(--color-ink-subtle)]',
  error: 'flex items-center gap-1 text-xs text-[var(--color-danger)]',
  required: 'text-[var(--color-brand-600)]',
  textarea: 'min-h-28 resize-y leading-relaxed',
} as const

/**
 * Checkbox and switch styles
 * @type {Record<string, string>}
 */

export const TOGGLE_STYLES = {
  row: 'flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm',
  track:
    'relative h-5 w-9 shrink-0 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] transition-colors',
  trackOn: 'border-[var(--color-brand-600)] bg-[var(--color-brand-600)]',
  knob: 'absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-[var(--color-ink-subtle)] transition-transform',
  knobOn: 'translate-x-4 bg-[var(--color-on-brand)]',
  checkbox:
    'flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] transition-colors',
  checkboxOn:
    'border-[var(--color-brand-600)] bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
} as const

/**
 * Tag input styles
 * @type {Record<string, string>}
 */

export const TAGS_STYLES = {
  field:
    'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1.5',
  tag: 'inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-brand-soft)] px-2 py-0.5 text-xs text-[var(--color-brand-600)]',
  input: 'min-w-24 flex-1 bg-transparent px-1 text-sm outline-none',
  remove: 'opacity-70 transition-opacity hover:opacity-100',
} as const

/**
 * Markdown editor styles
 * @type {Record<string, string>}
 */

export const EDITOR_STYLES = {
  frame:
    'flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
  toolbar:
    'flex flex-wrap items-center gap-0.5 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5',
  tool: 'flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)]',
  divider: 'mx-1 h-4 w-px bg-[var(--color-border)]',
  textarea:
    'min-h-56 w-full resize-y bg-transparent px-4 py-3 font-[family-name:var(--font-mono)] text-sm leading-relaxed outline-none',
  preview: 'markdown-body min-h-56 px-4 py-3 text-sm',
  footer:
    'flex items-center justify-between border-t border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Picture field styles
 * @type {Record<string, string>}
 */

export const FILE_INPUT_STYLES = {
  frame:
    'flex flex-wrap items-center gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3',
  invalid: 'border-[var(--color-danger)]',
  preview:
    'h-16 w-16 shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border)] object-cover',
  placeholder:
    'h-16 w-16 shrink-0 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)]',
  actions: 'flex flex-wrap items-center gap-2',
} as const

/**
 * Option mark styles, one glyph shape per mark kind
 * @type {Record<string, string>}
 */

export const OPTION_MARK_STYLES = {
  dot: 'h-2 w-2 shrink-0 rounded-full',
  priority: 'shrink-0 text-sm leading-none font-extrabold tracking-tighter',
} as const

/**
 * Select menu styles, the dropdown standing in for the native select
 * @type {Record<string, string>}
 */

export const SELECT_MENU_STYLES = {
  trigger:
    'flex min-w-0 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-left text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-border-strong)] disabled:pointer-events-none disabled:opacity-60',
  triggerBlock: 'w-full',
  triggerCompact: 'w-auto min-w-0 max-w-44 px-2.5 py-1.5 text-xs',
  invalid: 'border-[var(--color-danger)]',
  value: 'flex min-w-0 flex-1 items-center gap-2 truncate',
  placeholder: 'truncate text-[var(--color-ink-subtle)]',
  chevron: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform',
  chevronOpen: 'rotate-180',
  panel:
    'popover-enter fixed z-[70] flex max-h-72 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
  search:
    'w-full border-b border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[var(--color-ink-subtle)]',
  list: 'flex-1 overflow-y-auto py-1',
  option:
    'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-[var(--color-surface)]',
  optionActive: 'bg-[var(--color-surface)]',
  optionSelected: 'text-[var(--color-brand-600)]',
  optionLabel: 'min-w-0 flex-1 truncate',
  optionHint: 'truncate text-xs text-[var(--color-ink-subtle)]',
  check: 'h-3.5 w-3.5 shrink-0 text-[var(--color-brand-600)]',
  empty: 'px-3 py-4 text-center text-xs text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Date picker styles, the drawn calendar standing in for the native date input
 * @type {Record<string, string>}
 */

export const DATE_PICKER_STYLES = {
  panel:
    'popover-enter fixed z-[70] w-72 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
  head: 'flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-2 py-2',
  month: 'flex-1 text-center text-sm font-bold first-letter:uppercase',
  step: 'flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]',
  weekdays:
    'grid grid-cols-7 px-2 pt-2 text-center text-[10px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  grid: 'grid grid-cols-7 gap-0.5 p-2',
  day: 'flex h-8 items-center justify-center rounded-[var(--radius-sm)] text-sm tabular-nums transition-colors hover:bg-[var(--color-surface)]',
  dayOutside: 'text-[var(--color-ink-subtle)]/60',
  dayToday: 'font-bold text-[var(--color-brand-600)]',
  daySelected:
    'bg-[var(--color-brand-600)] text-[var(--color-on-brand)] hover:bg-[var(--color-brand-700)]',
  footer: 'flex items-center gap-2 border-t border-[var(--color-border)] px-2 py-2',
  time: 'w-24 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm tabular-nums outline-none',
} as const

/**
 * Form category trail styles, one crumb per group of fields
 * @type {Record<string, string>}
 */

export const FORM_STEPS_STYLES = {
  trail: 'flex flex-wrap items-center gap-1',
  crumb: 'rounded-[var(--radius-sm)] text-xs italic transition-colors',
  idle: 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]',
  current: 'font-semibold text-[var(--color-brand-600)]',
  flagged: 'text-[var(--color-danger)]',
  separator: 'h-2.5 w-2.5 shrink-0 text-[var(--color-ink-subtle)]/60',
} as const

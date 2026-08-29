/**
 * Button styles
 * @type {Record<string, string>}
 */

export const BUTTON_STYLES = {
  base: 'inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm font-medium transition-[background-color,border-color,color,opacity] disabled:pointer-events-none disabled:opacity-50',
  primary: 'bg-[var(--color-brand-600)] px-4 py-2 text-[var(--color-on-brand)] hover:opacity-90',
  secondary:
    'border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-3 py-2 hover:bg-[var(--color-surface-sunken)]',
  ghost:
    'px-3 py-2 text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]',
  danger: 'bg-[var(--color-danger)] px-4 py-2 text-[var(--color-on-brand)] hover:opacity-90',
  icon: 'h-9 w-9 rounded-[var(--radius-md)] p-0 text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]',
  link: 'p-0 text-[var(--color-brand-600)] underline-offset-2 hover:underline',
  // Square footprint for a label-less button, overriding a variant's padding
  square: 'h-9 w-9 shrink-0 p-0',
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
  // Control sharing its line with the glyph picker
  row: 'flex min-w-0 items-center gap-2',
  rowControl: 'min-w-0 flex-1',
  // Label and messages sit above the input, past the glyph
  glyphField: '[&>label]:pl-11 [&>p]:pl-11',
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
  tag: 'inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-brand-600)] px-2 py-0.5 text-xs text-[var(--color-on-brand)]',
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
  // Chevron trails the text, not the edge
  value: 'flex min-w-0 items-center gap-2 truncate',
  placeholder: 'truncate text-[var(--color-ink-subtle)]',
  chevron: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform',
  chevronOpen: 'rotate-180',
  panel:
    'popover-enter fixed z-[70] flex max-h-72 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
  search:
    'w-full border-b border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[var(--color-ink-subtle)]',
  list: 'flex-1 overflow-y-auto py-1',
  option:
    'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm opacity-60 transition-[background-color,opacity] hover:bg-[var(--color-surface)] hover:opacity-100',
  optionActive: 'bg-[var(--color-surface)] opacity-100',
  optionSelected:
    'bg-[var(--color-brand-soft)] font-medium text-[var(--color-brand-600)] opacity-100',
  optionLabel: 'min-w-0 flex-1 truncate',
  optionHint: 'truncate text-xs text-[var(--color-ink-subtle)]',
  check: 'h-3.5 w-3.5 shrink-0 text-[var(--color-brand-600)]',
  empty: 'px-3 py-4 text-center text-xs text-[var(--color-ink-subtle)] italic',
  // Inset rule between the clearing entry and the real options
  divider: 'mx-2 my-1 h-px bg-[var(--color-border)]',
  // Selected entries on the trigger
  tags: 'flex min-w-0 flex-wrap items-center gap-1',
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
  grid: 'grid grid-cols-7 gap-y-0.5 p-2',
  day: 'flex h-8 items-center justify-center rounded-[var(--radius-sm)] text-sm tabular-nums transition-colors hover:bg-[var(--color-surface)]',
  dayOutside: 'text-[var(--color-ink-subtle)]/60',
  dayToday: 'font-bold text-[var(--color-brand-600)]',
  daySelected: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)] hover:opacity-90',
  // Days between the two range edges
  dayInRange: 'rounded-none bg-[var(--color-brand-soft)] text-[var(--color-brand-600)]',
  dayRangeStart: 'rounded-r-none',
  dayRangeEnd: 'rounded-l-none',
  footer: 'flex items-center gap-2 border-t border-[var(--color-border)] px-2 py-2',
  time: 'w-24 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm tabular-nums outline-none',
} as const

/**
 * Emoji picker styles — a bare glyph opening the catalogue, never a framed box
 * @type {Record<string, string>}
 */

export const EMOJI_PICKER_STYLES = {
  trigger:
    'flex h-9 w-9 shrink-0 items-center justify-center bg-transparent transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-50',
  glyph: 'text-2xl leading-none',
  icon: 'h-5 w-5 text-[var(--color-ink-subtle)]',
  invalid: 'text-[var(--color-danger)]',
} as const

/**
 * Emoji catalogue styles — bare glyphs on the surface, the search pinned below them
 * @type {Record<string, string>}
 */

export const EMOJI_DIALOG_STYLES = {
  body: 'flex flex-col gap-5',
  family: 'flex flex-col gap-2',
  familyName: 'text-[11px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  grid: 'grid grid-cols-8 gap-1 sm:grid-cols-10 lg:grid-cols-12',
  cell: 'flex h-9 w-full items-center justify-center rounded-[var(--radius-sm)] bg-transparent text-xl leading-none transition-transform hover:scale-125',
  cellSelected: 'scale-110 text-[var(--color-brand-600)]',
  tally: 'text-xs text-[var(--color-ink-subtle)] tabular-nums',
  empty: 'py-8 text-center text-sm text-[var(--color-ink-subtle)] italic',
  footer: 'flex w-full min-w-0 items-center gap-2',
  search: 'min-w-0 flex-1',
} as const

/**
 * Collapsed colour field
 * @type {Record<string, string>}
 */

export const COLOUR_FIELD_STYLES = {
  trigger:
    'flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-left text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-border-strong)] disabled:pointer-events-none disabled:opacity-60',
  swatch:
    'h-5 w-5 shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)]',
  code: 'font-mono uppercase',
  placeholder: 'text-[var(--color-ink-subtle)]',
  dialog: 'flex flex-col gap-3',
} as const

/**
 * Colour wheel styles — a hue circle, a brightness slider, then the typed code
 * @type {Record<string, string>}
 */

export const COLOUR_WHEEL_STYLES = {
  wrapper:
    'flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3',
  board: 'flex flex-wrap items-center gap-4',
  wheel:
    'relative h-32 w-32 shrink-0 cursor-crosshair touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-600)]',
  veil: 'pointer-events-none absolute inset-0 rounded-full',
  shade: 'pointer-events-none absolute inset-0 rounded-full bg-black',
  thumb:
    'pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[var(--shadow-md)]',
  controls: 'flex min-w-0 flex-1 flex-col gap-3',
  row: 'flex items-center gap-2',
  preview: 'h-9 w-9 shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border-strong)]',
  code: 'w-32 font-mono uppercase',
  slider: 'h-2 w-full cursor-pointer appearance-none rounded-full',
  swatches: 'flex flex-wrap gap-1.5',
  swatch:
    'h-6 w-6 rounded-[var(--radius-sm)] border border-[var(--color-border)] transition-transform hover:scale-110',
  swatchSelected:
    'ring-2 ring-[var(--color-brand-600)] ring-offset-1 ring-offset-[var(--color-surface-raised)]',
  disabled: 'pointer-events-none opacity-60',
} as const

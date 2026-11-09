import type { Tone } from '@/declarations/ui/theme'

/**
 * Property title
 * @type {string}
 */

export const PROPERTY_LABEL = 'text-xs font-bold tracking-wide text-[var(--color-ink)] uppercase'

/**
 * Property content
 * @type {string}
 */

export const PROPERTY_VALUE = 'text-[var(--color-ink)]'

/**
 * Spacing between and within properties
 * @type {Record<string, string>}
 */

export const PROPERTY_SPACING = {
  // Between two properties
  rows: 'gap-y-5 sm:gap-y-7',
  columns: 'gap-x-4 sm:gap-x-10',
  // Between a title and its value
  within: 'gap-2',
  // Settings rows
  rowPadding: 'py-4',
} as const

/**
 * Empty content
 * @type {string}
 */

export const EMPTY_VALUE = 'text-[var(--color-ink-subtle)] italic'

/**
 * Mark of a value being edited, drawn outside its box so nothing moves
 * @type {string}
 */

export const EDITING_MARK = 'bg-[var(--color-surface)] ring-2 ring-[var(--color-pick)]'

/**
 * Field styles shared by every input
 * @type {Record<string, string>}
 */

export const FIELD_STYLES = {
  wrapper: `field-box flex min-w-0 flex-col ${PROPERTY_SPACING.within}`,
  label: PROPERTY_LABEL,
  labelRow: 'flex flex-wrap items-center gap-1.5',
  control:
    'min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3.5 py-2 text-sm text-[var(--color-on-field)] transition-colors placeholder:text-[var(--color-on-field-subtle)] hover:border-[var(--color-field-border-strong)] disabled:opacity-60',
  invalid: 'border-[var(--color-danger)]',
  hint: 'text-xs text-[var(--color-ink-subtle)]',
  error: 'flex items-center gap-1 text-xs text-[var(--color-danger)]',
  notice: 'flex items-center gap-1 text-xs font-medium text-[var(--color-caution)]',
  required: 'text-[var(--color-ink-accent)]',
  textarea: 'min-h-28 resize-y leading-relaxed',
  // Control sharing its line with the glyph picker
  row: 'flex min-w-0 items-center gap-2',
  rowControl: 'min-w-0 flex-1',
  // Glyph picker sits inside the box, at its far end
  glyphInside: 'relative [&_input]:pr-12',
  glyphSeat:
    'absolute top-1/2 right-1.5 -translate-y-1/2 [&_button]:h-8 [&_button]:w-8 [&_button]:border-0 [&_button]:bg-transparent [&_button]:shadow-none',
  // Static prefix welded to the left of a control
  prefixRow:
    'flex min-w-0 items-stretch rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] transition-colors focus-within:border-[var(--color-field-border-strong)]',
  prefixRowInvalid: 'border-[var(--color-danger)]',
  // Locked link start
  prefix:
    'flex shrink-0 items-center rounded-l-[calc(var(--radius-md)-1px)] border-r border-[var(--color-field-border)] bg-[var(--color-surface-sunken)] px-3 font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)] select-none',
  prefixControl:
    'min-w-0 flex-1 rounded-none rounded-r-[var(--radius-md)] border-0 bg-transparent pl-3 text-[var(--color-on-field)]',
} as const

/**
 * Tag input styles
 * @type {Record<string, string>}
 */

export const TAGS_STYLES = {
  field:
    'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-2 py-1.5',
  tag: 'inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-600)] px-2.5 py-0.5 text-xs text-[var(--color-on-brand)]',
  input:
    'min-w-24 flex-1 bg-transparent px-1 text-sm text-[var(--color-on-field)] outline-none placeholder:text-[var(--color-on-field-subtle)]',
  remove: 'opacity-70 transition-opacity hover:opacity-100',
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
 * Option mark styles
 * @type {Record<string, string>}
 */

export const OPTION_MARK_STYLES = {
  priority: 'inline-flex shrink-0 items-center leading-none',
  emoji: 'shrink-0 text-base leading-none',
  glyph: 'h-4 w-4 shrink-0',
} as const

/**
 * Rating scale styles
 * @type {Record<string, string>}
 */

export const SCALE_INPUT = {
  wrap: 'flex flex-col gap-1.5',
  track: 'flex w-full items-center justify-between gap-1',
  step: 'size-7 shrink-0 rounded-full border transition-all duration-[var(--motion-duration-base)] disabled:cursor-not-allowed disabled:opacity-60',
  stepIdle: 'border-[var(--color-field-border)] bg-[var(--color-field)]',
  stepFilled: 'border-[var(--color-brand-300)] bg-[var(--color-brand-soft)]',
  stepActive:
    'scale-110 border-[var(--color-brand-600)] bg-[var(--color-brand-600)] shadow-[var(--shadow-sm)]',
  endpoints: 'flex items-center justify-between text-xs text-[var(--color-ink-subtle)]',
  endpoint: 'truncate',
  // Bare figures
  numerals: 'flex w-full items-end justify-between px-1',
  numeral:
    'text-4xl leading-none font-bold tabular-nums transition-[opacity,transform] duration-[var(--motion-duration-fast)] disabled:cursor-not-allowed',
  numeralIdle: 'opacity-35 hover:opacity-70',
  numeralActive: 'scale-125 opacity-100',
} as const

/**
 * Figure tones of a scale
 * @type {Record<'low' | 'middle' | 'high', Tone>}
 */

export const SCALE_NUMERAL_TONES = {
  low: 'danger',
  middle: 'warning',
  high: 'success',
} as const satisfies Record<string, Tone>

/**
 * Account lookup line
 * @type {Record<string, string>}
 */

export const HANDLE_LOOKUP_STYLES = {
  line: 'flex items-center gap-1.5 text-xs font-medium',
  icon: 'h-3.5 w-3.5 shrink-0',
  found: 'text-[var(--color-success)]',
  missing: 'text-[var(--color-danger)]',
  unknown: 'text-[var(--color-ink-subtle)]',
  // Accounts to pick from
  list: 'flex flex-col gap-1',
  match:
    'flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-left transition-colors hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)] focus-visible:outline-none',
  matchBody: 'flex min-w-0 flex-col',
  matchName: 'truncate text-sm font-semibold',
  matchHandle:
    'truncate font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Field grid of a form
 * @type {Record<string, string>}
 */

export const FORM_GRID = {
  split: `grid grid-cols-1 sm:grid-cols-2 ${PROPERTY_SPACING.rows} ${PROPERTY_SPACING.columns}`,
  single: `grid grid-cols-1 ${PROPERTY_SPACING.rows}`,
  // Column whose last field takes the height left
  fill: `flex flex-1 flex-col ${PROPERTY_SPACING.rows}`,
} as const

/**
 * Settings rows styles
 * @type {Record<string, string>}
 */

export const FORM_ROWS = {
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  line: `flex items-center justify-between gap-4 ${PROPERTY_SPACING.rowPadding}`,
  block: `flex flex-col ${PROPERTY_SPACING.within} ${PROPERTY_SPACING.rowPadding}`,
  label: `min-w-0 flex-1 ${PROPERTY_LABEL}`,
  control: 'w-1/2 max-w-xs shrink-0',
  error: 'pb-2 text-xs text-[var(--color-danger)]',
} as const

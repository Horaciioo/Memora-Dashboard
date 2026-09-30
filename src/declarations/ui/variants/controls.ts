import type { Tone } from '@/declarations/ui/theme'
import type { AvatarSize } from '@/declarations/ui/variants/surfaces'

/**
 * Button styles
 * @type {Record<string, string>}
 */

export const BUTTON_STYLES = {
  base: 'inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm font-medium transition-[background-color,border-color,color,opacity,filter] disabled:pointer-events-none disabled:opacity-50',
  primary:
    'bg-[var(--color-brand-600)] px-4 py-2 text-[var(--color-on-brand)] hover:bg-[var(--color-brand-700)]',
  secondary:
    'border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-3 py-2 hover:bg-[var(--color-hover)]',
  ghost:
    'px-3 py-2 text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  // Hover deepens, never fades
  success: 'bg-[var(--color-success)] px-4 py-2 text-[var(--color-on-brand)] hover:brightness-90',
  danger: 'bg-[var(--color-danger)] px-4 py-2 text-[var(--color-on-brand)] hover:brightness-90',
  // 44px hit area on touch, back to 36px from md
  icon: 'h-9 w-9 min-h-11 min-w-11 rounded-[var(--radius-md)] p-0 text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] md:min-h-0 md:min-w-0',
  link: 'p-0 text-[var(--color-brand-600)] underline-offset-2 hover:underline',
  // Square footprint for a label-less button, overriding a variant's padding
  square: 'h-9 w-9 min-h-11 min-w-11 shrink-0 p-0 md:min-h-0 md:min-w-0',
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
  idle: 'text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
} as const

/**
 * Property title, the one casing every label shares
 * @type {string}
 */

export const PROPERTY_LABEL = 'text-xs font-black tracking-wide text-[var(--color-ink)] uppercase'

/**
 * Property content, lighter and quieter than its title
 * @type {string}
 */

export const PROPERTY_VALUE = 'font-light text-[var(--color-ink)]/80 italic'

/**
 * Spacing between and within properties, the same on every page and form
 * @type {Record<string, string>}
 */

export const PROPERTY_SPACING = {
  // Between two properties
  rows: 'gap-y-7',
  columns: 'gap-x-10',
  // Between a title and its value
  within: 'gap-2',
  // Settings rows
  rowPadding: 'py-4',
} as const

/**
 * Empty content, never mistaken for a value
 * @type {string}
 */

export const EMPTY_VALUE = 'text-[var(--color-ink-subtle)] italic'

/**
 * Field styles shared by every input
 * @type {Record<string, string>}
 */

export const FIELD_STYLES = {
  wrapper: `flex min-w-0 flex-col ${PROPERTY_SPACING.within}`,
  label: PROPERTY_LABEL,
  labelRow: 'flex flex-wrap items-center gap-1.5',
  control:
    'w-full rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3 py-2 text-sm text-[var(--color-on-field)] transition-colors placeholder:text-[var(--color-on-field-subtle)] hover:border-[var(--color-field-border-strong)] disabled:opacity-60',
  invalid: 'border-[var(--color-danger)]',
  hint: 'text-xs text-[var(--color-ink-subtle)]',
  error: 'flex items-center gap-1 text-xs text-[var(--color-danger)]',
  notice: 'flex items-center gap-1 text-xs font-medium text-[var(--color-caution)]',
  required: 'text-[var(--color-brand-600)]',
  textarea: 'min-h-28 resize-y leading-relaxed',
  // Control sharing its line with the glyph picker
  row: 'flex min-w-0 items-center gap-2',
  rowControl: 'min-w-0 flex-1',
  // Label and messages sit above the input, past the glyph
  glyphField: '[&>label]:pl-11 [&>p]:pl-11',
  // Static prefix welded to the left of a control, the handle alone being typed
  prefixRow:
    'flex min-w-0 items-stretch rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] transition-colors focus-within:border-[var(--color-field-border-strong)]',
  prefixRowInvalid: 'border-[var(--color-danger)]',
  // Locked link start, dimmed so the handle leads
  prefix:
    'flex shrink-0 items-center rounded-l-[var(--radius-md)] pl-3 font-[family-name:var(--font-mono)] text-xs text-[var(--color-on-field-subtle)] opacity-70 select-none',
  prefixControl:
    'min-w-0 flex-1 rounded-none rounded-r-[var(--radius-md)] border-0 bg-transparent pl-0.5 text-[var(--color-on-field)]',
} as const

/**
 * Checkbox and switch styles
 * @type {Record<string, string>}
 */

export const TOGGLE_STYLES = {
  row: 'flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm',
  // Exclusive states, cn never merges
  track:
    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-[var(--motion-duration-panel)]',
  trackOff: 'bg-[var(--color-border-strong)]',
  trackOn: 'bg-[var(--color-brand-600)]',
  trackSuccess: 'bg-[var(--color-success)]',
  trackDanger: 'bg-[var(--color-danger)]',
  knob: 'inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--color-knob)] shadow-[var(--shadow-sm)] transition-transform duration-[var(--motion-duration-panel)] motion-reduce:transition-none',
  knobOff: 'translate-x-1',
  knobOn: 'translate-x-6',
  knobGlyph: 'h-2.5 w-2.5',
  checkbox:
    'flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
  checkboxOff: 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]',
  checkboxOn:
    'border-[var(--color-brand-600)] bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
} as const

/**
 * Tri-state switch styles — one track holding a denied, an inherited and an allowed slot
 * @type {Record<string, string>}
 */

export const TRI_TOGGLE_STYLES = {
  group:
    'inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5',
  slot: 'flex h-6 w-7 items-center justify-center rounded-full text-[var(--color-ink-subtle)] transition-colors',
  slotIdle: 'hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  glyph: 'h-3.5 w-3.5',
  denied: 'bg-[var(--color-danger)] text-[var(--color-on-brand)]',
  inherited: 'bg-[var(--color-neutral)] text-[var(--color-on-brand)]',
  allowed: 'bg-[var(--color-success)] text-[var(--color-on-brand)]',
  disabled: 'pointer-events-none opacity-50',
} as const

/**
 * Tag input styles
 * @type {Record<string, string>}
 */

export const TAGS_STYLES = {
  field:
    'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-2 py-1.5',
  tag: 'inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-brand-600)] px-2 py-0.5 text-xs text-[var(--color-on-brand)]',
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
 * Option mark styles, one glyph shape per mark kind
 * @type {Record<string, string>}
 */

export const OPTION_MARK_STYLES = {
  dot: 'h-2 w-2 shrink-0 rounded-full',
  priority: 'shrink-0 text-sm leading-none font-extrabold tracking-tighter',
  emoji: 'shrink-0 text-base leading-none',
  glyph: 'h-4 w-4 shrink-0',
} as const

/**
 * Select menu styles, the dropdown standing in for the native select
 * @type {Record<string, string>}
 */

export const SELECT_MENU_STYLES = {
  trigger:
    'flex min-w-0 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3 py-2 text-left text-sm text-[var(--color-on-field)] transition-colors hover:border-[var(--color-field-border-strong)] disabled:pointer-events-none disabled:opacity-60',
  invalid: 'border-[var(--color-danger)]',
  // Chevron trails the text, not the edge
  value: 'flex min-w-0 items-center gap-2 truncate',
  placeholder: `truncate ${EMPTY_VALUE}`,
  // Category heading inside the list
  group:
    'px-3 pt-2.5 pb-1 text-[10px] font-extrabold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  chevron: 'h-4 w-4 shrink-0 text-[var(--color-on-field-subtle)] transition-transform',
  chevronOpen: 'rotate-180',
  panel:
    'popover-enter fixed z-[70] flex max-h-72 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
  search:
    'w-full border-b border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[var(--color-ink-subtle)]',
  list: 'flex-1 overflow-y-auto py-1',
  option:
    'flex w-full items-center gap-2 px-3 text-left opacity-60 transition-[background-color,opacity] hover:bg-[var(--color-surface)] hover:opacity-100',
  optionActive: 'bg-[var(--color-surface)] opacity-100',
  optionDisabled: 'cursor-not-allowed opacity-50',
  scrim: 'fixed inset-0 z-[65]',
  // Chosen entry, a wash fading rightwards behind the green check
  optionSelected:
    'bg-linear-to-r from-[var(--color-picker-wash-strong)] via-[var(--color-picker-wash)] to-transparent font-semibold text-[var(--color-ink)] opacity-100',
  optionLabel: 'min-w-0 flex-1 truncate',
  optionHint: 'truncate text-xs text-[var(--color-ink-subtle)]',
  check: 'h-4 w-4 shrink-0',
  // Keeps labels aligned beside a check
  checkSlot: 'h-4 w-4 shrink-0',
  empty: 'px-3 py-4 text-center text-xs text-[var(--color-ink-subtle)]',
  // Inset rule between the clearing entry and the real options
  divider: 'mx-2 my-1 h-px shrink-0 bg-[var(--color-border)]',
  // Pinned link above the options
  action:
    'flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-hover)]',
  actionIcon: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  // Selected entries on the trigger, never tags
  tags: 'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1',
  entry: 'inline-flex min-w-0 items-center gap-1.5',
} as const

/**
 * Trigger and option classes per select size
 * @type {Record<SelectMenuSize, { trigger: string, option: string }>}
 */

export const SELECT_MENU_SIZES = {
  compact: { trigger: 'w-auto min-w-0 max-w-44 px-2.5 py-1.5 text-xs', option: 'py-1.5 text-sm' },
  block: { trigger: 'w-full', option: 'py-1.5 text-sm' },
  large: { trigger: 'w-full px-3 py-2.5 text-base', option: 'py-2.5 text-sm' },
} as const

/**
 * Select size token
 * @type {keyof typeof SELECT_MENU_SIZES}
 */

export type SelectMenuSize = keyof typeof SELECT_MENU_SIZES

/**
 * Portrait size drawn beside an option, per select size
 * @type {Record<SelectMenuSize, AvatarSize>}
 */

export const SELECT_MENU_MARK_SIZES = {
  compact: 'xs',
  block: 'xs',
  large: 'sm',
} as const satisfies Record<SelectMenuSize, AvatarSize>

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
  daySelected:
    'bg-[var(--color-brand-600)] text-[var(--color-on-brand)] hover:bg-[var(--color-brand-700)]',
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
  empty: 'py-8 text-center text-sm text-[var(--color-ink-subtle)]',
  footer: 'flex w-full min-w-0 items-center gap-2',
  search: 'min-w-0 flex-1',
} as const

/**
 * Collapsed colour field
 * @type {Record<string, string>}
 */

export const COLOUR_FIELD_STYLES = {
  trigger:
    'flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3 py-2 text-left text-sm text-[var(--color-on-field)] transition-colors hover:border-[var(--color-field-border-strong)] disabled:pointer-events-none disabled:opacity-60',
  swatch:
    'h-5 w-5 shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-field-border-strong)] bg-[var(--color-surface-sunken)]',
  code: 'font-mono uppercase',
  placeholder: `normal-case font-sans ${EMPTY_VALUE}`,
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

/**
 * Rating scale styles
 * @type {Record<string, string>}
 */

export const SCALE_INPUT = {
  wrap: 'flex flex-col gap-1.5',
  track: 'flex w-full gap-1',
  step: 'h-8 flex-1 rounded-[var(--radius-md)] border transition-all disabled:cursor-not-allowed disabled:opacity-60',
  stepIdle: 'border-[var(--color-field-border)] bg-[var(--color-field)]',
  stepFilled: 'border-[var(--color-brand-300)] bg-[var(--color-brand-soft)]',
  stepActive: 'flex-[2] border-[var(--color-brand-600)] bg-[var(--color-brand-600)]',
  endpoints: 'flex items-center justify-between text-xs text-[var(--color-ink-subtle)]',
  endpoint: 'truncate',
  // Bare figures, the picked one grows
  numerals: 'flex w-full items-end justify-between px-1',
  numeral:
    'text-4xl leading-none font-black tabular-nums transition-[opacity,transform] duration-150 disabled:cursor-not-allowed',
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
} as const

/**
 * Field grid of a form
 * @type {Record<string, string>}
 */

export const FORM_GRID = {
  split: `grid grid-cols-1 sm:grid-cols-2 ${PROPERTY_SPACING.rows} ${PROPERTY_SPACING.columns}`,
  single: `grid grid-cols-1 ${PROPERTY_SPACING.rows}`,
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

/**
 * Block editor styles
 * @type {Object}
 */

export const BLOCK_EDITOR = {
  frame:
    'relative flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-field-border)] bg-[var(--color-field)] transition-colors focus-within:border-[var(--color-field-border-strong)]',
  frameInvalid: 'border-[var(--color-danger)]',
  page: 'flex min-h-40 flex-col gap-1 px-4 py-3 text-sm text-[var(--color-on-field)]',
  row: 'flex items-start gap-2',
  // Placeholder on the focused empty line
  line: 'min-w-0 flex-1 leading-relaxed outline-none empty:before:pointer-events-none empty:before:text-[var(--color-on-field-subtle)] focus:empty:before:content-[attr(data-placeholder)] [&_a]:text-[var(--color-brand-600)] [&_a]:underline [&_code]:rounded-[var(--radius-sm)] [&_code]:bg-[var(--color-surface-sunken)] [&_code]:px-1 [&_code]:font-[family-name:var(--font-mono)] [&_code]:text-[0.9em]',
  kinds: {
    paragraph: '',
    heading1: 'pt-3',
    heading2: 'pt-2',
    heading3: 'pt-1',
    bullet: '',
    numbered: '',
    quote: 'border-l-[3px] border-[var(--color-brand-400)] pl-3',
    code: 'rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-3 py-2',
    rule: '',
  },
  lineKinds: {
    paragraph: '',
    heading1: 'text-xl font-black tracking-tight',
    heading2: 'text-lg font-bold tracking-tight',
    heading3: 'text-base font-bold',
    bullet: '',
    numbered: '',
    quote: 'text-[var(--color-ink-subtle)] italic',
    code: 'font-[family-name:var(--font-mono)] text-xs whitespace-pre-wrap',
    rule: '',
  },
  bullet: 'mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-on-field)]',
  number: 'min-w-5 shrink-0 text-right tabular-nums text-[var(--color-on-field-subtle)]',
  rule: 'w-full py-2 outline-none focus-visible:rounded-[var(--radius-sm)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-400)]',
  ruleLine: 'border-[var(--color-border-strong)]',
  footer:
    'flex justify-end border-t border-[var(--color-field-border)] px-3 py-1.5 text-xs text-[var(--color-on-field-subtle)] tabular-nums',
  footerOver: 'text-[var(--color-danger)]',
  // Pixel gaps of the floating panels
  menuGapPx: 8,
  formatBarHeightPx: 48,
  slashPanel:
    'fixed z-[80] flex max-h-80 w-72 flex-col gap-0.5 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1.5 shadow-[var(--shadow-lg)]',
  slashEmpty: 'px-3 py-2 text-sm text-[var(--color-ink-subtle)]',
  slashItem: 'flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-1.5 text-left',
  slashItemIdle: 'hover:bg-[var(--color-hover)]',
  slashItemActive: 'bg-[var(--color-hover)]',
  slashTile:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]',
  slashGlyph: 'h-4 w-4',
  slashBody: 'flex min-w-0 flex-col',
  slashLabelText: 'text-sm font-medium',
  slashHint: 'truncate text-xs text-[var(--color-ink-subtle)]',
  formatBar:
    'fixed z-[80] flex -translate-x-1/2 items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1 shadow-[var(--shadow-md)]',
  formatButton:
    'flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  formatGlyph: 'h-4 w-4',
} as const

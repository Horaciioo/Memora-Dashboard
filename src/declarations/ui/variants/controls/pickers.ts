import type { AvatarSize } from '@/declarations/ui/variants/surfaces'
import { EMPTY_VALUE } from '@/declarations/ui/variants/controls/fields'

/**
 * Select menu styles
 * @type {Record<string, string>}
 */

export const SELECT_MENU_STYLES = {
  trigger:
    'flex min-w-0 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3 py-2 text-left text-sm text-[var(--color-on-field)] transition-colors hover:border-[var(--color-field-border-strong)] disabled:pointer-events-none disabled:opacity-60',
  // No field box, a hover wash only
  triggerBare:
    'flex min-w-0 items-center gap-2 rounded-[var(--radius-lg)] px-2 py-1.5 text-left text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-hover)] disabled:pointer-events-none disabled:opacity-60',
  // Arcade field: chip fill like the other play inputs
  triggerPlay:
    'flex min-h-11 w-full min-w-0 items-center gap-2 rounded-xl bg-[var(--play-chip)] px-3 text-left text-sm font-semibold text-[var(--play-ink)] transition-colors hover:bg-[var(--play-panel-strong)] focus-visible:outline-3 focus-visible:outline-[var(--play-key)] disabled:pointer-events-none disabled:opacity-60',
  chevronPlay: 'text-[var(--play-ink-faint)]',
  invalid: 'border-[var(--color-danger)]',
  // Chevron trails the text
  value: 'flex min-w-0 items-center gap-2 truncate',
  placeholder: `truncate ${EMPTY_VALUE}`,
  // Category heading inside the list
  group:
    'px-2.5 pt-5 pb-1.5 text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  chevron: 'h-4 w-4 shrink-0 text-[var(--color-on-field-subtle)] transition-transform',
  chevronOpen: 'rotate-180',
  panel:
    'popover-enter fixed z-[70] flex max-h-72 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] glass-panel shadow-[var(--shadow-lg)]',
  search:
    'w-full border-b border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[var(--color-ink-subtle)]',
  // Rows breathe
  list: 'flex flex-1 flex-col gap-0.5 overflow-y-auto p-1.5',
  option:
    'flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-2.5 text-left opacity-60 transition-[background-color,opacity] hover:bg-[var(--color-surface)] hover:opacity-100',
  optionActive: 'bg-[var(--color-surface)] opacity-100',
  optionDisabled: 'cursor-not-allowed opacity-50',
  scrim: 'fixed inset-0 z-[65] bg-transparent',
  // Chosen entry
  optionSelected:
    'bg-linear-to-r from-[var(--color-picker-wash-strong)] via-[var(--color-picker-wash)] to-transparent font-semibold text-[var(--color-ink)] opacity-100',
  optionLabel: 'min-w-0 flex-1 truncate',
  check: 'h-4 w-4 shrink-0 text-[var(--color-success)]',
  // Cell holding the check or the mark
  lead: 'flex shrink-0 items-center justify-center',
  leadGlyph: 'h-4 w-4',
  // Game logo cell
  leadLogo: 'size-6',
  leadPortrait: 'h-6 w-6',
  leadPortraitLarge: 'h-8 w-8',
  empty: 'px-3 py-4 text-center text-xs text-[var(--color-ink-subtle)]',
  // Inset rule between the clearing entry and the real options
  divider: 'mx-1 my-1 h-px shrink-0 bg-[var(--color-border)]',
  // Pinned link above the options
  action:
    'flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-hover)]',
  actionIcon: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  // Selected entries on the trigger
  tags: 'flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5',
  entry: 'inline-flex min-w-0 items-center gap-2',
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
 * Portrait size drawn beside an option
 * @type {Record<SelectMenuSize, AvatarSize>}
 */

export const SELECT_MENU_MARK_SIZES = {
  compact: 'xs',
  block: 'xs',
  large: 'sm',
} as const satisfies Record<SelectMenuSize, AvatarSize>

/**
 * Date picker styles
 * @type {Record<string, string>}
 */

export const DATE_PICKER_STYLES = {
  panel:
    'popover-enter fixed z-[70] w-72 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] glass-panel shadow-[var(--shadow-lg)]',
  head: 'flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-2 py-2',
  month: 'flex-1 text-center text-sm font-bold first-letter:uppercase',
  monthPick:
    'flex-1 rounded-[var(--radius-sm)] py-1 text-center text-sm font-bold transition-colors first-letter:uppercase hover:bg-[var(--color-surface)]',
  step: 'flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]',
  stepIcon: 'h-4 w-4',
  hint: 'text-xs text-[var(--color-ink-subtle)]',
  action:
    'flex h-7 w-auto items-center justify-center rounded-[var(--radius-sm)] px-2 text-xs text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]',
  actionOn: 'bg-[var(--color-surface)] font-semibold text-[var(--color-ink)]',
  weekdays:
    'grid grid-cols-7 px-2 pt-2 text-center text-micro font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  grid: 'grid grid-cols-7 gap-y-0.5 p-2',
  day: 'flex h-8 items-center justify-center rounded-full text-sm tabular-nums transition-colors hover:bg-[var(--color-surface)]',
  dayOutside: 'text-[var(--color-ink-subtle)]/60',
  // Before the earliest day accepted
  dayBarred: 'pointer-events-none opacity-30',
  dayToday: 'font-bold text-[var(--color-ink-accent)]',
  daySelected:
    'bg-[var(--color-brand-600)] text-[var(--color-on-brand)] hover:bg-[var(--color-brand-700)]',
  // Days between the two range edges
  dayInRange: 'rounded-none bg-[var(--color-brand-soft)] text-[var(--color-ink-accent)]',
  dayRangeStart: 'rounded-r-none',
  dayRangeEnd: 'rounded-l-none',
  footer: 'flex items-center gap-2 border-t border-[var(--color-border)] px-2 py-2',
  time: 'w-24 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm tabular-nums outline-none',
} as const

/**
 * Date wheel styles, five rows with the centre one selected
 * @type {Record<string, string | number>}
 */

export const DATE_WHEEL = {
  // Years offered before today
  yearsBack: 100,
  // Years offered after today
  yearsAhead: 10,
  // Scroll rest before a row is read
  settleMs: 120,
  frame: 'relative grid grid-cols-[1fr_1.6fr_1fr] gap-1 px-3 py-2',
  framePeriod: 'relative grid grid-cols-[1.6fr_1fr] gap-1 px-3 py-2',
  band: 'pointer-events-none absolute inset-x-3 top-1/2 h-10 -translate-y-1/2 rounded-[var(--radius-md)] bg-[var(--color-picker-wash-strong)]',
  column:
    'h-50 snap-y snap-mandatory overflow-y-scroll [scrollbar-width:none] [mask-image:linear-gradient(transparent,black_30%,black_70%,transparent)]',
  // Two empty rows centre the first and last entries
  spacer: 'block h-20',
  item: 'flex h-10 snap-center items-center justify-center text-body tabular-nums',
  itemOn: 'font-semibold text-[var(--color-ink)]',
  itemOff: 'text-[var(--color-ink-subtle)]',
} as const

/**
 * Emoji picker styles — a bare glyph opening the catalogue
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
 * Emoji catalogue styles — bare glyphs on the surface
 * @type {Record<string, string>}
 */

export const EMOJI_DIALOG_STYLES = {
  body: 'flex flex-col gap-5',
  family: 'flex flex-col gap-2',
  familyName: 'text-micro font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  grid: 'grid grid-cols-8 gap-1 sm:grid-cols-10 lg:grid-cols-12',
  cell: 'flex h-9 w-full items-center justify-center rounded-[var(--radius-sm)] bg-transparent text-xl leading-none transition-transform hover:scale-125',
  cellSelected: 'scale-110',
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
 * Free colour wheel styles
 * @type {Record<string, string>}
 */

export const COLOUR_WHEEL_STYLES = {
  root: 'flex flex-col items-center gap-4',
  wheel:
    'relative size-52 cursor-crosshair touch-none rounded-full bg-[radial-gradient(circle,white,transparent_70%),conic-gradient(red,yellow,lime,cyan,blue,magenta,red)] shadow-[var(--shadow-sm)]',
  knob: 'pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[var(--shadow-md)]',
  slider: 'h-3 w-52 cursor-pointer appearance-none rounded-full',
} as const

/**
 * Colour swatches styles
 * @type {Record<string, string>}
 */

export const COLOUR_SWATCH_STYLES = {
  wrapper: 'flex flex-col items-start gap-3',
  grid: 'grid grid-cols-6 gap-2',
  swatch:
    'size-9 rounded-full border border-[var(--color-border)] transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-60',
  selected:
    'ring-2 ring-[var(--color-pick)] ring-offset-2 ring-offset-[var(--color-surface-raised)]',
} as const

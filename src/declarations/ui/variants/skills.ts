/**
 * Percentage field typed in place
 * @type {Record<string, string>}
 */

export const PERCENT_INPUT = {
  root: 'inline-flex shrink-0 items-baseline',
  control:
    '!min-h-0 !w-[3ch] !border-0 !bg-transparent !p-0 !shadow-none text-right text-lg font-bold focus-visible:underline focus-visible:outline-0 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  unit: 'text-sm font-bold text-[var(--color-ink-subtle)]',
  high: '!text-[var(--color-success)]',
  low: '!text-[var(--color-danger)]',
} as const

/**
 * Slider with a notch over a red to green track
 * @type {Record<string, string>}
 */

export const PERCENT_SLIDER = {
  root: 'flex w-full items-center gap-3',
  track: 'relative h-2 min-w-0 flex-1',
  base: 'absolute inset-0 rounded-full bg-[linear-gradient(to_right,var(--color-danger),var(--color-caution),var(--color-success))] opacity-25',
  fill: 'absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(to_right,var(--color-danger),var(--color-caution),var(--color-success))]',
  range:
    'absolute -inset-y-2 h-6 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-default [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-1.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--color-ink)] [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-ink)] [&::-webkit-slider-thumb]:shadow-[var(--shadow-sm)]',
} as const

/**
 * Competencies laid in boxes by category
 * @type {Record<string, string>}
 */

export const SKILL_GRID = {
  root: 'flex flex-col gap-4',
  box: 'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface',
  head: 'flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3',
  title: 'flex-1 text-sm font-bold tracking-tight',
  average: 'text-xs text-[var(--color-ink-subtle)] tabular-nums',
  row: 'mx-4 flex flex-col border-b border-[var(--color-border)] last:border-b-0',
  line: 'flex flex-wrap items-center gap-x-3 gap-y-2 py-2',
  toggle:
    'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-muted)]',
  toggleSpacer: 'size-6 shrink-0',
  toggleGlyph: 'size-4 transition-transform',
  toggleOpen: 'rotate-180',
  name: 'min-w-32 flex-1 truncate text-sm font-medium',
  bar: 'w-full sm:w-56 sm:shrink-0',
  stamp: 'hidden text-xs whitespace-nowrap text-[var(--color-ink-subtle)] md:block',
  description: 'pb-3 pl-9 text-xs leading-relaxed text-[var(--color-ink-subtle)]',
} as const

/**
 * Objectives listed in the corner of a file
 * @type {Record<string, string>}
 */

export const OBJECTIVES_CARD = {
  list: 'flex flex-col gap-3',
  item: 'flex flex-col items-start gap-1',
  title: 'text-sm font-semibold',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
  manage: 'mt-3 self-start',
} as const

/**
 * Work waiting for the viewer, beside the information box of a promotion
 * @type {Record<string, string>}
 */

export const SESSION_DESK = {
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
  count: 'mb-2 block text-xs font-semibold text-[var(--color-ink-subtle)]',
  list: 'flex flex-col gap-2',
  item: 'flex items-center gap-2',
  body: 'flex min-w-0 flex-col',
  name: 'truncate text-sm font-semibold',
  phase: 'truncate text-xs text-[var(--color-ink-subtle)]',
  start: 'mt-3 self-start',
} as const

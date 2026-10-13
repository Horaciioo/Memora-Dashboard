/**
 * Programme cards of the academy and the recruitments
 * @type {Record<string, string>}
 */

export const PROGRAM_CARD = {
  grid: 'grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3',
  card: 'group relative flex min-h-24 cursor-pointer items-stretch overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface text-left shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-[var(--motion-duration-moderate)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  // Tinted side holding the function glyph
  spine: 'accent-tint accent-text flex w-18 shrink-0 items-center justify-center sm:w-24',
  glyph: 'size-9 sm:size-11',
  body: 'flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3',
  title: 'text-base leading-snug font-bold tracking-tight text-balance',
  meta: 'text-sm text-[var(--color-ink-subtle)]',
  side: 'flex shrink-0 items-center pr-4',
  arrow:
    'hidden size-5 shrink-0 -translate-x-1 text-[var(--color-ink-subtle)] opacity-0 transition-[opacity,transform] group-hover:translate-x-0 group-hover:opacity-100 md:block',
} as const

/**
 * Compact rows of the finished programmes
 * @type {Record<string, string>}
 */

export const PROGRAM_ROW = {
  list: 'flex flex-col divide-y divide-[var(--color-border)] rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface',
  row: 'group flex min-h-14 cursor-pointer items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-[var(--color-hover)] first:rounded-t-[var(--radius-xl)] last:rounded-b-[var(--radius-xl)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  glyph: 'accent-text size-6 shrink-0',
  title: 'min-w-0 flex-1 truncate text-sm font-semibold',
  meta: 'shrink-0 text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Phase track of a campaign
 * @type {Record<string, string>}
 */

export const PHASE_TRACK = {
  root: 'flex flex-col gap-1.5',
  segments: 'flex gap-1',
  segment: 'h-1.5 flex-1 rounded-full bg-[var(--color-surface-sunken)]',
  segmentLit: 'accent-solid',
  label: 'accent-text text-xs font-semibold',
} as const

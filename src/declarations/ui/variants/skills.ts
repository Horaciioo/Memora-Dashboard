/**
 * Star rating, colour rising with the grade
 * @type {Record<string, string>}
 */

export const STAR_RATING = {
  root: 'inline-flex shrink-0 items-center gap-0.5',
  star: 'flex cursor-pointer items-center justify-center rounded-[var(--radius-sm)] p-0.5 transition-colors disabled:cursor-default',
  idle: 'text-[var(--color-ink-subtle)]/50',
  glyph: 'size-5',
  small: 'size-4',
  // Weakest tier first
  tones: {
    low: 'var(--color-star-low)',
    medium: 'var(--color-star-medium)',
    good: 'var(--color-star-good)',
    full: 'var(--color-star-full)',
  },
  hop: 'star-hop',
  // Delay between two stars
  step: '90ms',
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
  row: 'mx-4 flex flex-col border-b border-[var(--color-border)] last:border-b-0',
  line: 'flex flex-wrap items-center gap-x-3 gap-y-2 py-2',
  toggle:
    'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-muted)]',
  toggleSpacer: 'size-6 shrink-0',
  toggleGlyph: 'size-4 transition-transform',
  toggleOpen: 'rotate-180',
  name: 'min-w-32 flex-1 truncate text-sm font-medium',
  bar: 'shrink-0',
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

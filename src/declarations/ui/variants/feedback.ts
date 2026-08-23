/**
 * Skeleton shapes
 * @type {Record<string, string>}
 */

export const SKELETON_SHAPES = {
  line: 'h-4 w-full',
  row: 'h-11 w-full',
  tile: 'h-24 w-full',
  card: 'h-32 w-full',
  sheet: 'h-48 w-full',
  board: 'h-72 w-full',
} as const

export type SkeletonShape = keyof typeof SKELETON_SHAPES

/** @type {string} */

export const SKELETON_BASE = 'skeleton-shimmer rounded-[var(--radius-md)] bg-[var(--color-surface)]'

/**
 * Empty state styles
 * @type {Record<string, unknown>}
 */

export const EMPTY_STATE_STYLES = {
  frame:
    'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)]/40 px-6 py-12 text-center',
  frameCompact:
    'flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)]/40 px-6 py-8 text-center',
  start: { illustration: 'h-28 w-28' },
  filter: { illustration: 'h-24 w-24' },
  compact: { illustration: 'h-16 w-16' },
} as const

/**
 * Progress bar styles, the fill width being the only inline style allowed
 * @type {Record<string, string>}
 */

export const PROGRESS_STYLES = {
  frame: 'flex flex-col gap-1.5',
  label: 'flex items-center justify-between gap-2 text-xs text-[var(--color-ink-subtle)]',
  value: 'font-semibold tabular-nums',
  track: 'h-2 w-full overflow-hidden rounded-full bg-[var(--color-neutral-soft)]',
  trackCompact: 'h-1',
  fill: 'h-full rounded-full transition-[width] duration-[var(--motion-duration-moderate)]',
} as const

/**
 * Toast styles
 * @type {Record<string, string>}
 */

export const TOAST_STYLES = {
  stack:
    'pointer-events-none fixed top-4 right-4 z-[60] flex w-[min(23rem,calc(100vw-2rem))] flex-col gap-2',
  toast:
    'surface-enter pointer-events-auto flex items-start gap-3 rounded-[var(--radius-lg)] border border-l-4 border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm shadow-[var(--shadow-lg)]',
  badge: 'flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
  glyph: 'h-4 w-4',
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  title: 'font-semibold',
  description: 'text-xs text-[var(--color-ink-subtle)]',
  dismiss:
    'shrink-0 text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
} as const

/**
 * Inline creation row styles
 * @type {Record<string, string>}
 */

export const ADD_ROW_STYLES = {
  base: 'flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-4 py-3 text-sm font-medium text-[var(--color-ink-subtle)] transition-colors hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-600)] disabled:pointer-events-none disabled:opacity-50',
  tile: 'min-h-24 flex-col',
  icon: 'h-4 w-4',
} as const

/**
 * Beta banner styles, flagging a surface that is not finished yet
 * @type {Record<string, string>}
 */

export const BETA_STYLES = {
  frame:
    'flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)]/40 bg-[var(--color-warning-soft)] px-3 py-2 text-xs text-[var(--color-warning)]',
  tag: 'rounded-[var(--radius-sm)] bg-[var(--color-warning)] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[var(--color-warning-soft)] uppercase',
} as const

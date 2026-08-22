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
  start: { illustration: 'h-28 w-28' },
  filter: { illustration: 'h-24 w-24' },
} as const

/**
 * Toast styles
 * @type {Record<string, string>}
 */

export const TOAST_STYLES = {
  stack: 'pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2',
  toast:
    'surface-enter pointer-events-auto flex items-start justify-between gap-3 rounded-[var(--radius-md)] border-l-4 border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm shadow-[var(--shadow-lg)]',
  dismiss: 'shrink-0 text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
} as const

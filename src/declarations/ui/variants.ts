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
} as const

export type SkeletonShape = keyof typeof SKELETON_SHAPES

/** @type {string} */
export const SKELETON_BASE = 'skeleton-shimmer rounded-[var(--radius-md)] bg-[var(--color-surface)]'

/** @type {Record<string, string>} */
export const TABLE_STYLES = {
  wrapper: 'w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]',
  table: 'w-full min-w-full border-collapse text-sm',
  headRow: 'border-b border-[var(--color-border)] text-left text-[var(--color-ink-subtle)]',
  headCell: 'px-4 py-3 font-medium',
  row: 'border-b border-[var(--color-border)] last:border-0',
  cell: 'px-4 py-3',
} as const

/**
 * Button styles
 * @type {Record<string, string>}
 */

export const BUTTON_STYLES = {
  base: 'inline-flex items-center justify-center rounded-[var(--radius-md)] text-sm transition-colors disabled:pointer-events-none disabled:opacity-60',
  primary: 'bg-[var(--color-brand-600)] px-4 py-2 font-medium text-white hover:opacity-90',
  secondary: 'border border-[var(--color-border)] px-3 py-1.5 hover:bg-[var(--color-surface)]',
} as const

export type ButtonVariant = keyof Omit<typeof BUTTON_STYLES, 'base'>

/**
 * Empty state styles
 * @type {Record<string, unknown>}
 */

export const EMPTY_STATE_STYLES = {
  frame:
    'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] px-6 py-10 text-center',
  start: { illustration: 'h-16 w-16' },
  filter: { illustration: 'h-12 w-12' },
} as const

/**
 * Segmented styles
 * @type {Record<string, string>}
 */

export const SEGMENTED_STYLES = {
  group:
    'flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] p-1',
  option: 'rounded-[calc(var(--radius-md)-4px)] px-2 py-1 text-xs transition-colors',
  selected: 'bg-[var(--color-brand-600)] text-white',
  idle: 'text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface)]',
} as const

/**
 * Select styles
 * @type {Record<string, string>}
 */

export const SELECT_STYLES = {
  base: 'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1',
  sm: 'text-sm',
  xs: 'text-xs',
} as const

export type SelectSize = keyof Omit<typeof SELECT_STYLES, 'base'>

/**
 * Table styles
 * @type {Record<string, string>}
 */

export const TABLE_STYLES = {
  wrapper:
    'w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
  table: 'w-full min-w-full border-collapse text-sm',
  headRow:
    'border-b border-[var(--color-border)] text-left text-xs tracking-wide text-[var(--color-ink-subtle)] uppercase',
  headCell: 'px-4 py-3 font-semibold whitespace-nowrap',
  sortable: 'inline-flex items-center gap-1 transition-colors hover:text-[var(--color-ink)]',
  row: 'border-b border-[var(--color-border)] transition-colors last:border-0 hover:bg-[var(--color-surface)]',
  rowActive: 'bg-[var(--color-brand-soft)]',
  cell: 'px-4 py-3 align-middle',
} as const

/**
 * Card list styles
 * @type {Record<string, string>}
 */

export const LIST_STYLES = {
  stack: 'flex flex-col gap-2',
  item: 'flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 transition-colors hover:border-[var(--color-border-strong)]',
  itemClickable: 'cursor-pointer hover:border-[var(--color-brand-400)]',
  card: 'flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition-colors',
  cardClickable: 'cursor-pointer hover:border-[var(--color-brand-400)]',
  grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3',
} as const

/**
 * Kanban board styles
 * @type {Record<string, string>}
 */

export const BOARD_STYLES = {
  scroller: 'flex gap-4 overflow-x-auto pb-2',
  column:
    'flex w-72 shrink-0 flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-2',
  columnArchived: 'opacity-60',
  columnHead: 'flex items-center justify-between gap-2 px-2 py-1.5',
  columnTitle: 'flex items-center gap-2 text-sm font-semibold',
  count:
    'rounded-full bg-[var(--color-surface-raised)] px-2 py-0.5 text-xs text-[var(--color-ink-subtle)]',
  body: 'flex min-h-24 flex-col gap-2 rounded-[var(--radius-md)] p-1',
  card: 'group flex cursor-grab flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] active:cursor-grabbing',
  cardTitle: 'text-sm leading-snug font-medium',
  cardMeta: 'flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Timeline styles
 * @type {Record<string, string>}
 */

export const TIMELINE_STYLES = {
  list: 'flex flex-col',
  item: 'relative flex gap-3 pb-4 pl-6 last:pb-0',
  rail: 'absolute top-1.5 bottom-0 left-[7px] w-px bg-[var(--color-border)]',
  dot: 'absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-surface-raised)]',
  body: 'flex min-w-0 flex-col gap-0.5 text-sm',
  meta: 'text-xs text-[var(--color-ink-subtle)]',
} as const

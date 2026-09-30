import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Home page layout
 * @type {Record<string, string>}
 */

export const HOME_STYLES = {
  // Two columns past lg, the task list always leading
  grid: 'grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]',
  column: 'flex min-w-0 flex-col gap-8',
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex items-center gap-3 px-4 py-3 text-sm',
  rowLink:
    'flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-[var(--color-surface)] focus-visible:bg-[var(--color-surface)] focus-visible:outline-none',
  rowBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  rowTitle: 'truncate font-semibold',
  rowMeta: 'text-xs text-[var(--color-ink-subtle)]',
  // Mono day stamp, left of each row
  stamp:
    'flex w-12 shrink-0 flex-col items-center font-[family-name:var(--font-mono)] leading-none tabular-nums',
  stampDay: 'text-lg font-bold',
  stampMonth: 'text-[0.625rem] tracking-wide text-[var(--color-ink-subtle)] uppercase',
  // Today's row
  rowToday: 'bg-[var(--color-brand-50)]',
  marker: `flex shrink-0 items-center gap-1.5 ${PROPERTY_LABEL}`,
  markerIcon: 'h-3.5 w-3.5',
  empty: 'px-4 py-6 text-sm text-[var(--color-ink-subtle)] italic',
  // Rows without a frame, the list simply breathes
  rows: 'flex flex-col gap-1',
  line: 'flex w-full items-center gap-4 rounded-[var(--radius-lg)] px-3 py-3 text-left transition-colors',
  lineLink:
    'cursor-pointer hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)] focus-visible:outline-none',
  chip: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)]',
  chipIcon: 'h-5 w-5',
  more: 'self-start rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  quiet: 'px-3 text-sm text-[var(--color-ink-subtle)]',
  actions: 'flex shrink-0 items-center gap-1',
} as const

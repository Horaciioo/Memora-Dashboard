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
} as const

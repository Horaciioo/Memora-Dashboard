/**
 * Timeline cut into periods
 * @type {Record<string, string>}
 */

export const PERIOD_TIMELINE = {
  root: 'flex flex-col gap-5',
  card: 'overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface transition-shadow',
  cardCurrent: 'shadow-[var(--shadow-md)]',
  cardDone: 'opacity-80',
  cardUpcoming: 'border-dashed opacity-70',
  head: 'flex w-full items-center gap-3 p-4 text-left',
  headButton: 'cursor-pointer hover:bg-[var(--color-surface-muted)]',
  badgeGlyph: 'size-6 shrink-0',
  title: 'flex min-w-0 flex-1 flex-col gap-0.5',
  name: 'text-section font-bold tracking-tight',
  lead: 'text-caption text-[var(--color-ink-subtle)]',
  dates: 'text-caption font-semibold text-[var(--color-ink-muted)]',
  side: 'flex shrink-0 flex-col items-end gap-1.5',
  count: 'text-micro whitespace-nowrap text-[var(--color-ink-subtle)] tabular-nums',
  chevron: 'size-5 shrink-0 text-[var(--color-ink-subtle)] transition-transform',
  chevronOpen: 'rotate-180',
  body: 'border-t border-[var(--color-border)] p-4 sm:p-5',
} as const

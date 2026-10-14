/**
 * Voice check-in box
 * @type {Record<string, string>}
 */

export const REVIEW_CARD = {
  root: 'flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 sm:p-5',
  head: 'flex flex-wrap items-center gap-x-3 gap-y-2',
  title: 'text-section font-bold tracking-tight',
  meta: 'text-caption text-[var(--color-ink-subtle)]',
  tags: 'flex flex-wrap items-center gap-2',
  actions: 'flex flex-wrap items-center gap-2',
  headActions: 'ml-auto flex flex-wrap items-center gap-2',
  well: 'rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-3',
  decision:
    'flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm',
  decisionTitle: 'font-semibold',
} as const

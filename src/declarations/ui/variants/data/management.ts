/**
 * Management boards: grouped rows under a filter bar
 * @type {Record<string, string>}
 */

export const MANAGEMENT_BOARD = {
  page: 'mx-auto flex w-full max-w-5xl flex-col gap-8',
  groups: 'flex flex-col gap-8',
  heading:
    'flex w-full items-center gap-2 text-left text-micro font-bold tracking-wide text-[var(--color-ink)] uppercase',
  rows: 'flex flex-col',
  row: 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 border-t border-[var(--color-border)] px-1 py-3.5 md:grid-cols-[13rem_minmax(0,1fr)_auto]',
  member:
    'flex min-w-0 items-center gap-2.5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:text-[var(--color-ink-accent)]',
  memberName: 'truncate',
  body: 'col-span-2 flex min-w-0 flex-col gap-0.5 md:col-span-1',
  title: 'text-base font-bold',
  detail: 'text-sm text-[var(--color-ink-subtle)]',
  clamp: 'line-clamp-3 whitespace-pre-line text-sm text-[var(--color-ink)]',
  aside:
    'col-start-2 row-start-1 flex items-center justify-end gap-3 text-sm font-semibold md:col-start-auto md:row-start-auto',
  action:
    'whitespace-nowrap text-sm font-semibold text-[var(--color-ink-subtle)] underline-offset-4 transition-colors hover:text-[var(--color-ink)] hover:underline',
  link: 'inline-flex items-center gap-1.5 font-semibold text-[var(--color-ink)] underline-offset-4 hover:underline',
  dot: 'size-2 shrink-0 rounded-full bg-[var(--accent)]',
} as const

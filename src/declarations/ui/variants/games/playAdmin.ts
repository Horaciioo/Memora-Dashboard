/**
 * Play admin page: totals, search, one row per moderator
 * @type {Record<string, string>}
 */

export const PLAY_ADMIN = {
  page: 'flex w-full flex-col gap-8',
  totals: 'grid grid-cols-2 gap-3 lg:grid-cols-4',
  total: 'flex min-w-0 flex-col gap-1 rounded-2xl bg-[var(--play-chip)] px-4 py-4',
  totalValue: 'truncate text-3xl leading-none font-extrabold tabular-nums',
  totalLabel: 'text-[0.7rem] font-bold tracking-wider text-[var(--play-ink-faint)] uppercase',
  everyone: 'flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between',
  everyoneText: 'flex min-w-0 flex-col gap-0.5',
  everyoneTitle: 'text-lg font-extrabold',
  everyoneNote: 'text-sm text-[var(--play-ink-soft)]',
  list: 'flex flex-col gap-2',
  row: 'flex min-h-14 w-full items-center gap-3 rounded-xl bg-[var(--play-chip)] px-3 py-2 text-left transition-colors hover:bg-[var(--play-panel-strong)] focus-visible:outline-3 focus-visible:outline-[var(--play-key)]',
  rowText: 'flex min-w-0 flex-1 flex-col',
  rowName: 'truncate text-sm font-extrabold',
  rowNote: 'truncate text-xs text-[var(--play-ink-soft)]',
  rowLevel: 'shrink-0 text-xs font-bold tabular-nums text-[var(--play-ink-soft)]',
  rowXp: 'w-24 shrink-0 text-right text-sm font-extrabold tabular-nums',
  rowBanned: 'shrink-0 text-xs font-extrabold text-[var(--play-alert)]',
  rowFile:
    'shrink-0 text-xs font-bold text-[var(--play-ink-soft)] underline-offset-2 hover:underline',
  empty: 'py-6 text-center text-sm text-[var(--play-ink-soft)] italic',
} as const

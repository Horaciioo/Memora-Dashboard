/**
 * Play journal: figures, filters, table of lines opened for their detail, pager
 * @type {Record<string, string>}
 */

export const PLAY_LOGS = {
  page: 'flex w-full flex-col gap-5',
  figures: 'grid grid-cols-3 gap-3',
  figure: 'flex min-w-0 flex-col gap-1 rounded-2xl bg-[var(--play-chip)] px-4 py-3',
  figureValue: 'truncate text-2xl leading-none font-extrabold tabular-nums',
  figureLabel: 'text-[0.7rem] font-bold tracking-wider text-[var(--play-ink-faint)] uppercase',
  filters: 'flex flex-wrap items-center gap-2',
  search: 'flex min-w-0 flex-1 basis-56 items-center gap-2',
  field:
    'min-h-11 w-full min-w-0 rounded-xl bg-[var(--play-chip)] px-3 text-sm text-[var(--play-ink)] outline-none placeholder:text-[var(--play-ink-faint)]',
  select: 'w-full sm:w-52',
  // Table: columns of the head follow the summary of a row
  panel:
    'overflow-hidden rounded-3xl bg-[var(--play-panel)] ring-1 ring-[var(--play-line)] backdrop-blur-xl',
  head: 'hidden grid-cols-[9rem_11rem_10rem_9rem_minmax(0,1fr)] gap-3 border-b border-[var(--play-line)] px-4 py-2.5 text-[0.7rem] font-extrabold tracking-wider text-[var(--play-ink-faint)] uppercase md:grid',
  list: 'flex flex-col divide-y divide-[var(--play-line)]',
  summary:
    'grid cursor-pointer list-none grid-cols-1 gap-1 px-4 py-3 text-sm marker:hidden hover:bg-[var(--play-chip)] md:grid-cols-[9rem_11rem_10rem_9rem_minmax(0,1fr)] md:items-center md:gap-3 [&::-webkit-details-marker]:hidden',
  moment: 'text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
  kind: 'inline-flex w-fit max-w-full items-center truncate rounded-lg bg-[var(--play-panel-strong)] px-2 py-1 text-xs font-extrabold',
  kindAdmin: 'text-[var(--play-gold)]',
  cell: 'min-w-0 truncate font-semibold',
  muted: 'min-w-0 truncate text-[var(--play-ink-soft)]',
  detail: 'grid gap-x-6 gap-y-2 bg-[var(--play-chip)] px-4 py-3 text-sm sm:grid-cols-2',
  factLabel: 'text-xs font-bold text-[var(--play-ink-faint)]',
  factValue: 'break-words font-semibold',
  empty: 'px-4 py-10 text-center text-sm text-[var(--play-ink-soft)] italic',
  skeleton: 'h-12 animate-pulse bg-[var(--play-chip)] motion-reduce:animate-none',
  pager: 'flex items-center justify-between gap-3',
  pagerNote: 'text-sm font-semibold text-[var(--play-ink-soft)] tabular-nums',
} as const

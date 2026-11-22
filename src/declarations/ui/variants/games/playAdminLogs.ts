const CARD = 'rounded-[var(--radius-lg)] bg-play-nest'
const COLUMNS = 'md:grid-cols-[9rem_11rem_10rem_9rem_minmax(0,1fr)]'

/**
 * Play journal: figures, filters, lines opened for their detail, pager
 * @type {Record<string, string>}
 */

export const PLAY_LOGS = {
  page: 'flex w-full flex-col gap-4',
  reset: 'self-end',
  figures: 'grid grid-cols-3 gap-3',
  figure: `${CARD} flex min-w-0 flex-col gap-1 px-4 py-3`,
  figureValue: 'truncate text-2xl leading-none font-bold tabular-nums',
  figureLabel: 'text-micro font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  filters: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
  search: 'min-w-0',
  field:
    'min-h-11 w-full min-w-0 rounded-xl bg-[var(--play-chip)] px-3 text-sm text-[var(--play-ink)] outline-none placeholder:text-[var(--play-ink-faint)]',
  select: 'min-w-0',
  // Head columns follow the summary of a row
  head: `hidden grid-cols-1 gap-3 px-4 text-micro font-bold tracking-wide text-[var(--play-ink-faint)] uppercase md:grid ${COLUMNS}`,
  list: 'flex flex-col gap-2',
  row: `${CARD} overflow-hidden`,
  summary: `grid cursor-pointer list-none grid-cols-1 gap-1 px-4 py-3 text-sm transition-colors marker:hidden hover:bg-play-nest md:items-center md:gap-3 [&::-webkit-details-marker]:hidden ${COLUMNS}`,
  moment: 'text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
  kind: 'min-w-0 truncate text-xs font-bold',
  kindAdmin: 'text-[var(--play-gold-ink)]',
  cell: 'min-w-0 truncate font-semibold',
  muted: 'min-w-0 truncate text-[var(--play-ink-soft)]',
  detail: 'grid gap-x-6 gap-y-2 bg-play-nest px-4 py-3 text-sm sm:grid-cols-2',
  factLabel: 'text-xs font-bold text-[var(--play-ink-faint)]',
  factValue: 'break-words font-semibold',
  skeleton: `${CARD} h-12 animate-pulse motion-reduce:animate-none`,
  pager: 'flex items-center justify-between gap-3',
  pagerNote: 'text-sm font-semibold text-[var(--play-ink-soft)] tabular-nums',
} as const

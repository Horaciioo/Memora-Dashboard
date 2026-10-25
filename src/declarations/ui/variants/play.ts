import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Play blocks of a moderator file
 * @type {Record<string, string>}
 */

export const PLAY_MEMBER = {
  stack: 'flex flex-col gap-6',
  // Global card then one card per game
  cards: 'flex flex-col gap-3 p-4',
  grid: 'grid gap-3 sm:grid-cols-2',
  card: 'flex w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left',
  hero: 'flex w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-5 text-left',
  off: 'opacity-60',
  clickable:
    'transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]',
  head: 'flex items-baseline justify-between gap-3',
  label: PROPERTY_LABEL,
  level: 'text-lg font-bold tabular-nums text-[var(--color-ink)]',
  heroLevel: 'text-3xl font-bold tabular-nums text-[var(--color-ink)]',
  xp: 'text-sm tabular-nums text-[var(--color-ink-subtle)]',
  // Level bar
  track: 'h-2 overflow-hidden rounded-full bg-[var(--color-track-off)]',
  fill: 'h-full rounded-full bg-[var(--color-brand)]',
  caption: 'text-xs tabular-nums text-[var(--color-ink-subtle)]',
  facts: 'flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-ink-subtle)]',
  // Wins, draws, losses
  record: 'flex items-center gap-2 text-sm tabular-nums',
  divider: 'h-4 w-px bg-[var(--color-border)]',
  win: 'font-bold text-[var(--color-success)]',
  draw: 'font-bold text-[var(--color-warning)]',
  loss: 'font-bold text-[var(--color-danger)]',
  unit: 'text-[var(--color-ink-subtle)]',
  empty: 'px-4 py-3 text-sm italic text-[var(--color-ink-subtle)]',
  note: 'px-4 pt-3 text-sm text-[var(--color-ink)]',
} as const

/**
 * Play pages
 * @type {Record<string, string>}
 */

export const PLAY_HUB = {
  stack: 'flex flex-col gap-6',
  games: 'grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4',
  game: 'flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4',
  gameOff: 'opacity-60',
  gameMark: 'h-1.5 w-12 rounded-full',
  gameName: 'text-lg font-bold text-[var(--color-ink)]',
  gameFacts: 'text-xs text-[var(--color-ink-subtle)]',
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex items-center gap-3 px-4 py-3',
  rowText: 'flex min-w-0 flex-1 flex-col',
  rowTitle: 'truncate text-sm font-semibold text-[var(--color-ink)]',
  rowNote: 'text-xs tabular-nums text-[var(--color-ink-subtle)]',
  empty: 'px-4 py-3 text-sm italic text-[var(--color-ink-subtle)]',
  callout:
    'flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-4 py-3 text-sm text-[var(--color-ink)]',
  // Lobby
  seats: 'grid grid-cols-2 gap-3 p-4 sm:grid-cols-3',
  seat: 'flex items-center gap-3 rounded-[var(--radius-lg)] border-2 bg-[var(--color-surface)] px-3 py-2',
  seatOff: 'opacity-50',
  seatName: 'truncate text-sm font-semibold text-[var(--color-ink)]',
  seatNote: 'text-xs text-[var(--color-ink-subtle)]',
  seatText: 'min-w-0',
  actions: 'flex flex-wrap items-center gap-3 px-4 pb-4',
} as const

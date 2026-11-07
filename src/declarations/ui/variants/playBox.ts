import { PLAY_PANEL } from '@/declarations/ui/variants/play'

/**
 * Play box: every block of a page sits in one
 * @type {Record<string, string>}
 */

export const PLAY_BOX = {
  stack: 'mx-auto flex w-full max-w-2xl flex-col gap-4',
  root: `${PLAY_PANEL} flex flex-col gap-4 p-4 shadow-[var(--shadow-sm)] sm:p-5`,
  // Dashed box that opens another one
  add: 'w-full',
  addIcon: 'size-5',
  // Folded group, the whole box is the button
  summary: `${PLAY_PANEL} flex w-full items-center gap-3 p-4 text-left shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--play-panel-strong)] focus-visible:outline-3 focus-visible:outline-[var(--play-key)] sm:p-5`,
  summaryNote: 'text-xs font-semibold text-[var(--play-ink-soft)]',
  summaryText: 'flex min-w-0 flex-1 flex-col',
  summaryName: 'truncate text-xl font-extrabold tracking-tight text-[var(--play-ink)] sm:text-2xl',
  keys: 'flex items-center justify-end gap-2',
  keyIcon: 'size-4',
  divider: 'h-px w-full bg-[var(--play-line)]',
  title: 'min-w-0',
  body: 'flex min-h-40 flex-col gap-3',
  search: 'relative',
  searchIcon:
    'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--play-ink-faint)]',
  searchInput:
    'min-h-11 w-full rounded-xl bg-[var(--play-chip)] pr-3 pl-9 text-sm text-[var(--play-ink)] outline-none placeholder:text-[var(--play-ink-faint)]',
  input:
    'min-h-11 w-full rounded-xl bg-[var(--play-chip)] px-3 text-sm text-[var(--play-ink)] outline-none placeholder:text-[var(--play-ink-faint)]',
  hint: 'text-sm text-[var(--play-ink-soft)] italic',
  chat: 'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto',
  line: 'flex items-start gap-2',
  lineMine: 'flex-row-reverse',
  bubble: 'flex max-w-[80%] flex-col gap-0.5 rounded-2xl bg-[var(--play-chip)] px-3 py-2',
  bubbleMine: 'bg-[var(--play-panel-strong)]',
  lineName: 'text-xs font-extrabold text-[var(--play-ink-soft)]',
  lineText: 'text-sm break-words text-[var(--play-ink)]',
  compose: 'flex items-center gap-2',
  // Group page: chat fills the column
  room: `${PLAY_PANEL} flex h-[calc(100dvh-19rem)] min-h-96 flex-col gap-3 lg:h-[calc(100dvh-16rem)] p-4 shadow-[var(--shadow-sm)] sm:p-5`,
  roomStack: 'mx-auto flex w-full max-w-7xl flex-col gap-4',
  roomGrid: 'grid min-h-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]',
  roomHead: 'flex items-center gap-3',
  roomBack: 'shrink-0',
  // Side column scrolls by itself, its boxes never shrink
  roomSide:
    'flex min-w-0 flex-col gap-5 lg:max-h-[calc(100dvh-16rem)] lg:overflow-y-auto [&>*]:shrink-0',
} as const

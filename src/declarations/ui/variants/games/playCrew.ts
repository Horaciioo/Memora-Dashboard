import { NOTE, SOLID } from '@/declarations/ui/variants/games/play/shared'

/**
 * Group room as a messenger: slim bar, bubbles, floating composer, popovers
 * @type {Record<string, string>}
 */

export const PLAY_CREW = {
  room: 'mx-auto flex w-full max-w-[110rem] flex-col gap-4 lg:h-[calc(100dvh-13rem)]',
  bar: 'relative flex items-center gap-2.5',
  barText: 'flex min-w-0 flex-1 flex-col',
  barNote: `${NOTE} px-1`,
  // Aside of boxes on the left, the conversation beside it
  body: 'relative grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]',
  aside: 'flex min-h-0 flex-col gap-3 lg:overflow-y-auto lg:[scrollbar-width:none]',
  box: 'flex flex-col gap-1 rounded-[var(--radius-lg)] bg-play-nest p-3 shadow-[var(--shadow-sm)]',
  boxTitle:
    'px-2 pt-1 pb-2 text-micro font-extrabold tracking-widest text-[var(--play-ink-faint)] uppercase',
  list: 'flex flex-col divide-y divide-[var(--play-line)]',
  rule: 'my-2 h-px bg-[var(--play-line)]',
  // The chat sits in its own box so it reads as a conversation
  main: 'flex min-h-[28rem] min-w-0 flex-col gap-3 rounded-[var(--radius-lg)] bg-play-nest p-3 shadow-[var(--shadow-sm)] lg:min-h-0',
  mainTitle:
    'px-2 pt-1 text-micro font-extrabold tracking-widest text-[var(--play-ink-faint)] uppercase',
  // Invited people overlap in one row
  stack: 'flex items-center px-2 py-2.5',
  stackItem: '-ml-2.5 first:ml-0',
  stackFace: 'rounded-full ring-2 ring-[var(--play-nest)]',
  stackMore: 'ml-1.5 text-xs font-bold text-[var(--play-ink-faint)]',
  // Tabs under the bar, one subject each
  tabBody: 'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto [scrollbar-width:none]',
  tiles: 'grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5',
  tile: 'flex flex-col gap-1 rounded-[var(--radius-lg)] bg-play-nest p-4 shadow-[var(--shadow-sm)]',
  tileValue: 'truncate text-2xl font-extrabold text-[var(--play-ink)]',
  tileLabel: 'text-micro font-extrabold tracking-widest text-[var(--play-ink-faint)] uppercase',
  scrim: 'fixed inset-0 z-30 cursor-default',
  panel: `${SOLID} z-40 flex max-h-[70dvh] w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 overflow-y-auto p-3`,
  panelBar: 'absolute top-full right-0 mt-2',
  panelTitle:
    'px-1 pt-1 text-micro font-extrabold tracking-widest text-[var(--play-ink-faint)] uppercase',
  row: 'group flex items-center gap-3 px-2 py-2',
  rowName: 'flex min-w-0 flex-1 items-center gap-1.5 text-sm font-bold text-[var(--play-ink)]',
  rowText: 'truncate',
  crown: 'size-3.5 shrink-0 text-[var(--play-gold)]',
  state: 'text-xs font-bold',
  stateOn: 'text-[var(--play-gold-ink)]',
  stateOff: 'text-[var(--play-ink-faint)]',
  stateWait: 'text-[var(--play-ink-faint)] italic',
  kick: 'text-xs font-bold text-[var(--play-ink-faint)] opacity-0 transition hover:text-[var(--play-ink)] focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100',
  menu: 'flex flex-col gap-2',
  // Conversation sits on the page itself, no box around it
  chat: 'flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1 pt-2 pb-2',
  empty: 'm-auto text-sm italic text-[var(--play-ink-faint)]',
  line: 'flex max-w-[85%] items-end gap-2',
  lineMine: 'flex-row-reverse self-end',
  lineGap: 'mt-3',
  slot: 'w-6 shrink-0',
  column: 'flex min-w-0 flex-col gap-0.5',
  columnMine: 'items-end',
  meta: 'flex items-baseline gap-2 px-1',
  author: 'text-xs font-extrabold text-[var(--play-ink-soft)]',
  time: 'text-micro font-semibold tabular-nums text-[var(--play-ink-faint)]',
  bubble: 'rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap',
  bubbleOther: 'rounded-bl-md bg-play-lift text-[var(--play-ink)]',
  bubbleMine: 'rounded-br-md bg-[var(--play-key)] text-[var(--play-key-ink)]',
  // A table call: thumbnail, name, one key
  call: 'flex items-center gap-3 rounded-2xl bg-play-lift p-2 pr-3',
  callArt: 'relative size-14 shrink-0 overflow-hidden rounded-xl',
  callText: 'flex min-w-0 flex-col pr-2',
  callLead: NOTE,
  callName: 'truncate text-sm font-extrabold text-[var(--play-ink)]',
  composer: 'relative shrink-0',
  pill: 'play-glass flex cursor-text items-stretch gap-1 rounded-full p-1.5',
  add: 'grid size-10 shrink-0 cursor-pointer place-items-center self-center rounded-full bg-[var(--play-key)] text-[var(--play-key-ink)] transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-50',
  input:
    'min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--play-ink)] outline-none placeholder:text-[var(--play-ink-faint)]',
  tray: 'play-glass absolute inset-x-0 bottom-full z-40 mb-2 grid grid-cols-2 gap-2 rounded-3xl p-3 sm:grid-cols-3',
  chip: 'group relative block h-20 w-full overflow-hidden rounded-xl text-left transition-transform duration-150 enabled:active:scale-[0.97] disabled:cursor-default',
} as const

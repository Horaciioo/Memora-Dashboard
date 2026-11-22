// Open and close share one slow spring
const EASE = 'duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'

/**
 * Play tab bar on a phone, Clash Royale style
 * @type {Record<string, string>}
 */

export const PLAY_TABS = {
  bar: `fixed inset-x-0 bottom-0 z-50 flex md:hidden items-center gap-1 border-t border-[color-mix(in_srgb,var(--play-key)_60%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--play-key)_32%,transparent),color-mix(in_srgb,var(--play-key-deep)_38%,transparent))] backdrop-blur-xl backdrop-saturate-150 px-1.5 pt-1 pb-[max(0.5rem,calc(env(safe-area-inset-bottom)*0.8))] shadow-[inset_0_1px_0_var(--play-gloss),0_-0.25rem_1.25rem_color-mix(in_srgb,var(--play-key-deep)_35%,transparent)] md:inset-x-auto md:bottom-4 md:left-1/2 md:w-[min(48rem,calc(100%-3rem))] md:-translate-x-1/2 md:rounded-3xl md:border md:pb-0.5`,
  // Open tab keeps its box, only the glyph rises
  tab: `group relative flex min-h-[2.5rem] min-w-0 flex-1 flex-col md:w-24 md:flex-none items-center justify-end pb-1 rounded-2xl after:absolute after:top-1/2 after:right-0 after:h-8 after:w-px after:-translate-y-1/2 after:bg-[color-mix(in_srgb,var(--play-key)_55%,transparent)] last:after:hidden active:scale-95 disabled:opacity-50`,
  tabOn: '',
  lift: `relative z-10 transition-transform ${EASE} group-aria-[current=page]:-translate-y-1 group-aria-expanded:-translate-y-1`,
  icon: `size-10 transition-[scale,filter] ${EASE} group-hover:scale-115 group-active:scale-90`,
  // Open: full colour and glow. Rest: smaller, muted
  iconOn: 'scale-110',
  iconRest: 'scale-90 saturate-[0.6]',
  badge:
    'absolute -top-0.5 -right-0.5 size-3 rounded-full bg-[var(--play-alert)] ring-2 ring-[var(--color-surface-raised)]',
  // Member portrait standing in the middle tab
  portrait: 'relative block shrink-0',
  label: `relative z-10 max-h-4 text-micro leading-none font-bold tracking-wide text-[var(--color-ink)] uppercase transition-[max-height,opacity,translate] ${EASE}`,
  labelRest: `relative z-10 max-h-0 tracking-wide text-[var(--color-ink)] uppercase translate-y-1 overflow-hidden text-micro leading-none font-bold opacity-0 transition-[max-height,opacity,translate] ${EASE}`,
  tabDesktop: 'max-md:hidden',
  // Halves around the portrait, so it sits dead centre
  half: 'flex min-w-0 flex-1 items-center justify-center gap-1',
  // Portrait button in the middle, its frame rising over the bar
  meHost: 'relative z-10 -mt-14 -mb-6 flex shrink-0',
  me: 'relative flex w-28 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95',
  menu: 'absolute bottom-full left-1/2 z-50 mb-3 flex w-60 -translate-x-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
  menuItem:
    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-hover)]',
  menuLeave: 'text-[var(--color-danger)]',
  // Category title above a group
  menuHeading:
    'px-3 pt-1.5 pb-0.5 text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  menuText: 'min-w-0 flex-1 truncate',
  menuCaret: 'size-3.5 shrink-0 text-[var(--color-ink-subtle)]',
  menuIcon: 'size-6 shrink-0',
  // Page swap, slid from the tab side
  slide: 'flex min-h-full w-full flex-col gap-8',
  slideRight: 'max-md:play-slide-right',
  slideLeft: 'max-md:play-slide-left',
  slideUp: 'max-md:play-slide-up',
} as const

/**
 * Game hub strip: three chunky ticket segments, Jouer big in the middle
 * @type {Record<string, string>}
 */

export const PLAY_HUB_BAR = {
  bar: 'mt-auto flex flex-col gap-3 rounded-3xl border border-[var(--play-on-art)]/40 bg-[var(--play-panel-strong)] p-4 shadow-[0_0.5rem_1.5rem_var(--play-drop),inset_0_2px_0_var(--play-gloss)] md:hidden',
  divider: 'h-px w-full border-0 bg-play-shade shadow-[0_1px_0_var(--play-gloss)]',
  strip: 'flex items-stretch gap-2',
  segment: 'play-key group grid min-h-12 min-w-0 flex-1 place-items-center px-0 py-2',
  icon: 'size-7 drop-shadow-[0_2px_0_var(--play-drop)] transition-transform duration-150 group-active:scale-90',
} as const

/**
 * Play home header on a phone
 * @type {Record<string, string>}
 */

export const PLAY_TOP = {
  bar: 'relative z-30 -mt-4 mb-1 flex items-center justify-between gap-2 md:hidden',
  keys: 'flex items-center gap-2',
  // Same key as the red back key, in slate
  key: 'play-key play-key-ghost relative grid size-11 min-h-0 place-items-center rounded-2xl p-0 transition-transform active:scale-95',
  // Red back key, no words
  back: 'play-key play-key-danger grid size-11 min-h-0 place-items-center rounded-2xl p-0 transition-transform active:scale-95',
  backIcon: 'size-5',
  keyIcon: 'size-6',
  dot: 'absolute top-1.5 right-1.5 size-2.5 rounded-full bg-[var(--color-success)] ring-2 ring-[var(--play-panel-strong)]',
  sheetTitle: 'text-lg font-bold',
} as const

/**
 * Leaderboard: key tabs, medal boxes
 * @type {Record<string, string>}
 */

export const PLAY_BOARD = {
  root: 'flex flex-col gap-4',
  rows: 'flex flex-col gap-2',
  row: 'flex min-h-14 items-center gap-3 rounded-2xl bg-play-nest px-3 ring-1 ring-[var(--play-line)] transition-colors hover:bg-play-lift',
  rowMe: 'bg-play-lift ring-2 ring-[var(--play-gold)]',
  rank: 'w-7 text-center text-lg font-bold tabular-nums',
  name: 'min-w-0 flex-1 truncate text-sm font-bold',
  value: 'shrink-0 text-xs font-bold tabular-nums opacity-80',
} as const

/**
 * Ranking podium: the first three rise in turn, the rest slide in below
 * @type {Record<string, string>}
 */

export const PLAY_LEADER_PODIUM = {
  stage: 'flex flex-col gap-6',
  // Free stage under a gold spotlight, no card around it
  scene:
    'relative isolate overflow-hidden rounded-3xl px-2 pt-6 sm:px-8 before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_50%_100%,color-mix(in_srgb,var(--play-gold)_30%,transparent),transparent_70%)]',
  filters: 'flex flex-col items-stretch gap-3 sm:flex-row sm:items-stretch sm:justify-center',
  game: 'w-full sm:w-60',
  // Same height and fill as the measure switch
  gameField: 'h-full min-h-12 bg-play-nest px-4',
  row: 'flex items-end justify-center gap-2 sm:gap-4',
  place: 'play-podium-place flex min-w-0 max-w-48 flex-1 basis-0 flex-col items-center gap-1',
  // Bottom room for the level bubble hanging under the portrait
  face: 'relative flex flex-col items-center pt-8 pb-7',
  faceWinner: 'pb-10',
  crown: 'absolute top-0 size-8 text-[var(--play-gold-ink)]',
  name: 'w-full truncate text-center text-sm font-extrabold sm:text-base',
  value: 'text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
  block:
    'play-podium-block flex w-full items-start justify-center rounded-t-2xl pt-3 shadow-[inset_0_0.25rem_0_rgb(255_255_255/0.35)]',
  me: 'ring-2 ring-[var(--play-gold)]',
  // Rank four and below: lifted rows in one box
  rest: 'flex flex-col gap-2 rounded-3xl bg-play-nest p-3 ring-1 ring-[var(--play-line)]',
  restRow:
    'play-end-rise flex min-h-14 items-center gap-3 rounded-2xl bg-play-lift px-3 transition-colors hover:bg-play-chip',
  restRowMe: 'ring-2 ring-[var(--play-gold)]',
} as const

/**
 * Podium block height by place
 * @type {Record<number, string>}
 */

export const PLAY_LEADER_BLOCKS: Record<number, string> = {
  1: 'h-32 bg-[var(--play-medal-first)] sm:h-40',
  2: 'h-24 bg-[var(--play-medal-second)] sm:h-28',
  3: 'h-16 bg-[var(--play-medal-third)] sm:h-20',
}

/**
 * Online players, settings and history sheets
 * @type {Record<string, string>}
 */

export const PLAY_ONLINE = {
  list: 'flex flex-col gap-2',
  row: 'flex flex-col overflow-hidden rounded-2xl bg-[var(--color-surface)] transition-colors',
  rowOpen: 'bg-[var(--color-surface-sunken)]',
  head: 'flex min-h-14 w-full items-center gap-3 px-3 py-2 text-left active:scale-[0.99]',
  who: 'flex min-w-0 flex-col',
  name: 'truncate text-sm font-bold text-[var(--color-ink)]',
  playing: 'text-xs font-bold text-[var(--color-ink-accent)]',
  idle: 'text-xs text-[var(--color-ink-subtle)]',
  actions: 'play-pop grid gap-2 px-3 pb-3',
  primary: 'play-chunk flex min-h-11 items-center justify-center rounded-xl text-sm font-bold',
  action:
    'play-key play-key-ghost flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] text-sm font-bold text-[var(--color-ink)]',
} as const

/**
 * Stats sections and history rows
 * @type {Record<string, string>}
 */

export const PLAY_HISTORY = {
  list: 'flex flex-col gap-2',
  empty: 'play-glass rounded-2xl p-5 text-sm text-[var(--play-ink-soft)] italic',
  chips: 'flex gap-2 overflow-x-auto pb-1',
  chip: 'play-glass flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-bold text-[var(--play-ink-soft)]',
  chipOn: 'bg-[var(--play-panel-strong)] text-[var(--play-ink)] shadow',
  card: 'play-glass group rounded-2xl',
  row: 'flex min-h-16 cursor-pointer list-none items-center gap-3 px-3 py-2 marker:hidden active:scale-[0.99] [&::-webkit-details-marker]:hidden',
  faces: 'mt-1 flex items-center -space-x-1.5',
  more: 'pl-2.5 text-xs font-bold text-[var(--play-ink-soft)]',
  fact: 'text-xs font-bold text-[var(--play-ink-soft)]',
  chevron: 'size-4 shrink-0 text-[var(--play-ink-soft)] transition-transform group-open:rotate-180',
  detail: 'flex flex-col gap-3 border-t border-[var(--play-ink-soft)]/15 px-3 py-3',
  standing: 'flex flex-col gap-1.5',
  seat: 'flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-[var(--play-ink)]',
  seatMe: 'bg-[var(--play-panel-strong)] font-bold',
  place: 'w-5 text-center text-xs font-bold tabular-nums text-[var(--play-ink-soft)]',
  seatName: 'flex min-w-0 flex-1 items-center gap-2 truncate',
  botTag:
    'rounded-full bg-[var(--play-panel-strong)] px-2 py-0.5 text-micro font-bold text-[var(--play-ink-soft)] uppercase',
  seatScore: 'text-xs font-bold tabular-nums text-[var(--play-ink-soft)]',
  replay:
    'self-start text-sm font-bold text-[var(--play-gold-ink)] underline-offset-2 hover:underline',
  page: 'play-glass flex min-h-11 items-center justify-center rounded-full text-sm font-bold text-[var(--play-ink)]',
  logo: 'size-10',
  body: 'flex min-w-0 flex-1 flex-col',
  game: 'truncate text-sm font-bold text-[var(--play-ink)]',
  meta: 'text-xs text-[var(--play-ink-soft)]',
  side: 'flex flex-col items-end gap-0.5',
  WIN: 'text-sm font-bold text-[var(--color-success)]',
  DRAW: 'text-sm font-bold text-[var(--play-ink-soft)]',
  LOSS: 'text-sm font-bold text-[var(--color-danger)]',
  xp: 'text-xs font-bold tabular-nums text-[var(--play-gold-ink)]',
} as const

/**
 * Game hub on a phone, three tabs
 * @type {Record<string, string>}
 */

export const PLAY_HUB_TABS = {
  root: 'relative z-10 flex min-h-0 flex-1 flex-col gap-4 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:hidden',
  sheet: 'flex flex-col gap-4',
  // Logo then the big button
  play: 'flex flex-1 flex-col items-center justify-center gap-6',
  logo: 'size-56',
  // Same look as the hub strip keys
  playButton: 'play-pop w-full min-h-12 py-2!',
  section: 'play-glass flex flex-col gap-3 rounded-3xl p-4',
  sectionTitle: 'text-xs font-bold tracking-wide text-[var(--play-ink-soft)] uppercase',
  // Desktop hub, hidden on a phone
  desktop: 'contents max-md:hidden',
} as const

/**
 * Game shell on a phone: gear, chat bar, bubbles
 * @type {Record<string, string>}
 */

export const PLAY_GAME_BAR = {
  // Room kept clear of the bar and the gear
  room: 'pb-[calc(3.75rem+env(safe-area-inset-bottom))]',
  roomKeys: 'pt-14',
  // Lobby page keeps its end clear of the bar
  spacer: 'h-16 shrink-0',
  gear: 'play-glass fixed top-[calc(0.75rem+env(safe-area-inset-top))] right-3 z-50 grid size-11 place-items-center rounded-2xl text-[var(--play-ink)] active:scale-90',
  gearIcon: 'size-5',
  bar: 'fixed inset-x-0 bottom-0 z-50 flex items-center gap-2 border-t border-[var(--play-on-art)]/15 bg-[color-mix(in_oklab,var(--play-night)_88%,transparent)] px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-md',
  key: 'grid size-11 shrink-0 place-items-center rounded-full bg-play-lift text-[var(--play-on-art)] active:scale-90',
  keyOff: 'opacity-50',
  keyIcon: 'size-8',
  input:
    'max-h-24 min-h-11 min-w-0 flex-1 resize-none rounded-full bg-play-lift px-4 py-2.5 text-base text-[var(--play-on-art)] outline-none placeholder:text-[var(--play-on-art)]/55 focus:bg-play-press',
  bubbles:
    'pointer-events-none absolute inset-x-3 bottom-full mb-2 flex flex-col items-start gap-1.5',
  bubble:
    'play-pop flex max-w-[85%] items-start gap-2 rounded-2xl bg-play-veil px-3 py-2 text-sm text-[var(--play-on-art)] backdrop-blur-sm',
  bubbleName: 'font-bold',
  sheet: 'flex flex-col gap-4',
  sheetTitle: 'text-lg font-bold',
  menuItem:
    'flex min-h-12 items-center gap-3 rounded-2xl bg-[var(--color-surface)] px-4 text-sm font-bold text-[var(--color-ink)] active:scale-[0.98]',
  menuDanger: 'text-[var(--color-danger)]',
  menuIcon: 'size-5',
} as const

/**
 * Foldable stats section on a phone
 * @type {Record<string, string>}
 */

export const PLAY_FOLD = {
  head: 'flex min-h-11 w-full items-center justify-between gap-3 text-left',
  chevron: 'size-5 shrink-0 -rotate-90 text-[var(--play-ink-soft)] transition-transform',
  chevronOpen: 'rotate-0',
  body: 'play-rise flex flex-col gap-3',
} as const

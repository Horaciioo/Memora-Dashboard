// Silver of the tab bar, shared by the header keys
const SILVER = 'bg-[linear-gradient(180deg,#f4f4f6,#c9cbd1)]'

// Open and close share one slow spring
const EASE = 'duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'

/**
 * Play tab bar on a phone, Clash Royale style
 * @type {Record<string, string>}
 */

export const PLAY_TABS = {
  bar: `fixed inset-x-0 bottom-0 z-50 flex items-stretch gap-1 border-t border-white/70 ${SILVER} px-1.5 pt-1 pb-[max(0.75rem,calc(env(safe-area-inset-bottom)*0.8))] shadow-[0_-0.25rem_1rem_rgb(0_0_0/0.18)] md:inset-x-auto md:bottom-4 md:left-1/2 md:w-[min(48rem,calc(100%-9.5rem))] md:-translate-x-1/2 md:rounded-3xl md:border md:pb-1.5`,
  // Open tab takes more width, the others share the rest, a divider between each
  tab: `group relative flex min-h-[3.75rem] min-w-0 flex-1 flex-col items-center justify-end pb-1 rounded-2xl transition-[flex-grow] ${EASE} before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 before:ease-[cubic-bezier(0.22,1,0.36,1)] before:bg-[linear-gradient(180deg,var(--play-key),color-mix(in_srgb,var(--play-key)_70%,var(--play-night)))] before:shadow-[inset_0_2px_0_rgb(255_255_255/0.35),0_0.2rem_0_rgb(0_0_0/0.4)] after:absolute after:top-3 after:-right-0.5 after:bottom-3 after:w-px after:bg-black/15 last:after:hidden has-[+[aria-current=page]]:after:hidden has-[+[aria-expanded=true]]:after:hidden active:scale-95 disabled:opacity-50`,
  tabOn: 'grow-[1.7] before:opacity-100 after:hidden',
  lift: `relative z-10 -mt-3 transition-transform ${EASE} group-aria-[current=page]:-translate-y-3 group-aria-expanded:-translate-y-3`,
  icon: `size-14 transition-[scale,filter] ${EASE} group-hover:scale-115 group-active:scale-90`,
  // Open: full colour and glow. Rest: smaller, muted
  iconOn: 'scale-110',
  iconRest: 'scale-90 saturate-[0.6] brightness-[0.85]',
  badge:
    'absolute -top-0.5 -right-0.5 size-3 rounded-full bg-[var(--play-alert)] ring-2 ring-white',
  label: `relative z-10 max-h-4 text-[0.65rem] leading-none font-extrabold tracking-wide text-white uppercase transition-[max-height,opacity,translate] ${EASE}`,
  labelRest: `relative z-10 max-h-0 tracking-wide text-white uppercase translate-y-1 overflow-hidden text-[0.65rem] leading-none font-extrabold opacity-0 transition-[max-height,opacity,translate] ${EASE}`,
  tabDesktop: 'max-md:hidden',
  // Profile in the middle, desktop only, raised over the bar
  me: 'relative -mt-7 hidden w-24 shrink-0 items-end justify-center md:flex',
  meButton: 'group relative rounded-full',
  meAvatar:
    'rounded-full ring-4 ring-[#f4f4f6] shadow-[0_0.3rem_0_rgb(0_0_0/0.3)] transition-transform duration-300 group-hover:-translate-y-0.5 group-active:scale-95 group-aria-expanded:ring-[var(--play-key)]',
  meLevel:
    'absolute -right-1 -bottom-1 grid min-w-7 place-items-center rounded-full bg-[var(--play-gold)] px-1.5 py-0.5 text-xs font-extrabold tabular-nums text-[var(--play-night)] ring-2 ring-[#f4f4f6]',
  // Box opened over the avatar
  meMenu:
    'play-glass play-rise absolute bottom-full left-1/2 z-10 mb-4 flex w-64 -translate-x-1/2 flex-col gap-1 rounded-2xl p-2 text-[var(--play-ink)]',
  meItem:
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors hover:bg-[var(--play-chip)]',
  meItemDanger: 'text-[var(--color-danger)]',
  meIcon: 'size-5 shrink-0',
  // Bare red glyph outside the bar, centred on its height, desktop only
  exit: 'group fixed bottom-4 left-[calc(50%+min(24rem,50%-4.75rem)+0.75rem)] z-50 flex h-[4.8rem] w-10 items-center justify-center text-[var(--color-danger)] transition-transform duration-300 hover:scale-110 active:scale-95 max-md:hidden',
  exitIcon: 'size-6 drop-shadow-[0_0.15rem_0_rgb(0_0_0/0.25)]',
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
  bar: 'mt-auto flex flex-col gap-3 rounded-3xl border border-white/40 bg-[linear-gradient(180deg,#5f636b,#a3a7ae_55%,#e8eaee)] p-4 shadow-[0_0.5rem_1.5rem_rgb(0_0_0/0.3),inset_0_2px_0_rgb(255_255_255/0.35)] md:hidden',
  divider: 'h-px w-full border-0 bg-black/25 shadow-[0_1px_0_rgb(255_255_255/0.45)]',
  strip: 'flex items-stretch gap-2',
  segment: 'play-key group grid min-h-12 min-w-0 flex-1 place-items-center px-0 py-2',
  icon: 'size-7 drop-shadow-[0_2px_0_rgb(0_0_0/0.3)] transition-transform duration-150 group-active:scale-90',
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
  sheetTitle: 'text-lg font-extrabold',
} as const

/**
 * Ranking page: game tiles that fit the width
 * @type {Record<string, string>}
 */

export const PLAY_RANKING = {
  page: 'mx-auto flex w-full max-w-2xl flex-col gap-4',
  // One equal tile per game, never scrolls
  games: 'grid auto-cols-fr grid-flow-col gap-2',
  game: 'play-glass grid aspect-square min-w-0 place-items-center rounded-2xl p-2 transition-[transform,background-color] duration-300 active:scale-95',
  gameOn: 'bg-[var(--play-panel-strong)] shadow-[0_0.2rem_0_rgb(0_0_0/0.25)] -translate-y-0.5',
  gameLogo: 'size-full max-h-14 max-w-14',
  gameName: 'text-center text-lg font-extrabold text-[var(--play-ink)]',
} as const

/**
 * Leaderboard: key tabs, medal boxes
 * @type {Record<string, string>}
 */

export const PLAY_BOARD = {
  root: 'flex flex-col gap-4',
  tabs: 'grid grid-cols-3 gap-2',
  tab: 'min-h-12 px-0 py-2',
  tabIcon: 'size-7',
  rows: 'flex flex-col gap-2',
  row: 'flex min-h-14 items-center gap-3 rounded-xl border-2 border-black/25 bg-[var(--play-panel-strong)] px-3 shadow-[0_0.2rem_0_rgb(0_0_0/0.25)]',
  rowMe: 'ring-2 ring-[var(--play-gold)]',
  // Medal boxes by place
  place1:
    'bg-[linear-gradient(180deg,var(--play-medal-gold))] text-[var(--play-night)] shadow-[inset_0_3px_0_rgb(255_255_255/0.5),0_0.2rem_0_rgb(0_0_0/0.35)]',
  place2:
    'bg-[linear-gradient(180deg,var(--play-medal-silver))] text-[var(--play-night)] shadow-[inset_0_3px_0_rgb(255_255_255/0.5),0_0.2rem_0_rgb(0_0_0/0.35)]',
  place3:
    'bg-[linear-gradient(180deg,var(--play-medal-bronze))] text-[var(--play-night)] shadow-[inset_0_3px_0_rgb(255_255_255/0.5),0_0.2rem_0_rgb(0_0_0/0.35)]',
  rank: 'w-7 text-center text-lg font-extrabold tabular-nums',
  name: 'min-w-0 flex-1 truncate text-sm font-extrabold',
  value: 'shrink-0 text-xs font-bold tabular-nums opacity-80',
} as const

/**
 * Online players, settings and history sheets
 * @type {Record<string, string>}
 */

export const PLAY_ONLINE = {
  list: 'flex flex-col gap-2',
  empty: 'py-6 text-center text-sm text-[var(--color-ink-subtle)] italic',
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
  settings: 'flex flex-col gap-5',
  setting: 'flex flex-col gap-2',
  settingTitle: 'text-xs font-extrabold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  hint: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Stats sections and history rows
 * @type {Record<string, string>}
 */

export const PLAY_HISTORY = {
  list: 'flex flex-col gap-2',
  empty: 'play-glass rounded-2xl p-5 text-sm text-[var(--play-ink-soft)] italic',
  chips: 'flex gap-2 overflow-x-auto pb-1',
  chip: 'play-glass flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-extrabold text-[var(--play-ink-soft)]',
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
  seatMe: 'bg-[var(--play-panel-strong)] font-extrabold',
  place: 'w-5 text-center text-xs font-extrabold tabular-nums text-[var(--play-ink-soft)]',
  seatName: 'flex min-w-0 flex-1 items-center gap-2 truncate',
  botTag:
    'rounded-full bg-[var(--play-panel-strong)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--play-ink-soft)] uppercase',
  seatScore: 'text-xs font-bold tabular-nums text-[var(--play-ink-soft)]',
  replay:
    'self-start text-sm font-extrabold text-[var(--play-gold-ink)] underline-offset-2 hover:underline',
  page: 'play-glass flex min-h-11 items-center justify-center rounded-full text-sm font-extrabold text-[var(--play-ink)]',
  logo: 'size-10',
  body: 'flex min-w-0 flex-1 flex-col',
  game: 'truncate text-sm font-extrabold text-[var(--play-ink)]',
  meta: 'text-xs text-[var(--play-ink-soft)]',
  side: 'flex flex-col items-end gap-0.5',
  WIN: 'text-sm font-extrabold text-[var(--color-success)]',
  DRAW: 'text-sm font-extrabold text-[var(--play-ink-soft)]',
  LOSS: 'text-sm font-extrabold text-[var(--color-danger)]',
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
  sectionTitle: 'text-xs font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
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
  bar: 'fixed inset-x-0 bottom-0 z-50 flex items-center gap-2 border-t border-white/15 bg-[color-mix(in_oklab,var(--play-night)_88%,transparent)] px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-md',
  key: 'grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white active:scale-90',
  keyOff: 'opacity-50',
  keyIcon: 'size-8',
  input:
    'max-h-24 min-h-11 min-w-0 flex-1 resize-none rounded-full bg-white/10 px-4 py-2.5 text-base text-white outline-none placeholder:text-white/55 focus:bg-white/15',
  bubbles:
    'pointer-events-none absolute inset-x-3 bottom-full mb-2 flex flex-col items-start gap-1.5',
  bubble:
    'play-pop flex max-w-[85%] items-start gap-2 rounded-2xl bg-black/65 px-3 py-2 text-sm text-white backdrop-blur-sm',
  bubbleName: 'font-extrabold',
  sheet: 'flex flex-col gap-4',
  sheetTitle: 'text-lg font-extrabold',
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

import { PROPERTY_LABEL, PROPERTY_SPACING } from '@/declarations/ui/variants/controls'

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

// Shared arcade surfaces
const PANEL =
  'rounded-2xl bg-[var(--play-panel)] ring-1 ring-[var(--play-line)] backdrop-blur-xl backdrop-saturate-150'
// Lift of the main boxes, as on the Memora sections
const LIFT = 'shadow-[var(--shadow-sm)]'
const HEADING = 'text-xl font-extrabold tracking-tight text-[var(--play-ink)] sm:text-2xl'
const NOTE = 'text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]'

/**
 * Memora Play room around the pages
 * @type {Record<string, string>}
 */

export const PLAY_REWARD = {
  layer: 'pointer-events-none fixed inset-0 z-[60] grid place-items-center',
  xp: 'play-xp fixed bottom-44 left-1/2 text-4xl font-extrabold tracking-tight text-[var(--play-ink)] [text-shadow:0_2px_0_rgb(0_0_0/0.25)]',
  level: 'play-level flex flex-col items-center gap-1',
  levelCaption: 'text-sm font-extrabold tracking-widest text-[var(--play-golf-glow)] uppercase',
  levelNumber:
    'text-8xl font-extrabold text-[var(--play-ink)] [text-shadow:0_4px_0_rgb(0_0_0/0.25)]',
} as const

export const PLAY_SHELL = {
  room: 'play-room fixed inset-0 z-40 flex flex-col overflow-hidden',
  floor: 'play-floor',
  bar: 'relative z-10 flex w-full shrink-0 items-center justify-end gap-3 px-4 pt-5 sm:px-8 xl:px-12',
  // Pages scroll here, the room itself never does
  content:
    'relative z-10 flex min-h-0 w-full flex-1 flex-col gap-8 overflow-y-auto overscroll-contain px-4 pt-6 pb-36 sm:px-8 xl:px-12',
} as const

/**
 * Logos and banners of the games
 * @type {Record<string, string>}
 */

export const PLAY_BRAND = {
  logo: 'inline-flex shrink-0 items-center justify-center rounded-[28%] shadow-[0_0.3rem_0_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.4)]',
  logoMark: 'size-[80%]',
  // Tile-less logo, a light drop keeps it legible on any ground
  bare: 'inline-flex shrink-0 items-center justify-center',
  bareMark: 'size-full overflow-visible drop-shadow-[0_0.15rem_0_rgb(0_0_0/0.35)]',
  art: 'play-art absolute inset-0 size-full',
} as const

/**
 * Play pages
 * @type {Record<string, string>}
 */

export const PLAY_HUB = {
  section: 'flex flex-col gap-4',
  heading: HEADING,
  headRow: 'flex flex-wrap items-end justify-between gap-3',
  callout: `${PANEL} flex flex-wrap items-center justify-between gap-3 bg-[var(--play-panel-strong)] px-5 py-4 text-sm font-semibold text-[var(--play-ink)]`,
  // Game cards
  games: 'grid gap-5 sm:grid-cols-2 2xl:grid-cols-4',
  main: 'flex min-w-0 flex-col gap-10',
  card: `play-card relative flex aspect-[3/4] min-h-96 flex-col justify-end overflow-hidden rounded-[2rem] text-[var(--play-on-art)] ${LIFT} ring-2 ring-white/20`,
  cardShade:
    'absolute inset-0 bg-linear-to-t from-[var(--play-night)] from-5% via-[var(--play-night)]/55 via-35% to-transparent to-65%',
  cardLink:
    'absolute inset-0 z-10 rounded-[2rem] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-key)]',
  cardBody: 'relative flex flex-col items-center gap-2 p-7 text-center',
  cardName: 'truncate text-3xl font-extrabold tracking-tight uppercase',
  cardTagline: 'line-clamp-3 text-sm text-[var(--play-on-art)]/85',
  skeleton:
    'animate-pulse rounded-[1.75rem] bg-[var(--play-panel-strong)] motion-reduce:animate-none',
  // Game hub, centred and fitted to the room: logo | divider | actions, never scrolling
  page: 'relative flex min-h-0 flex-1 flex-col',
  hub: 'relative flex min-h-0 flex-1 items-center justify-center max-sm:overflow-y-auto',
  hubSplit: 'flex flex-col items-center gap-8 sm:flex-row sm:gap-20',
  hubIdentity: 'flex flex-col items-center gap-4 text-center',
  hubLogo: 'size-40 sm:size-52',
  hubLogoLarge: 'size-44 sm:size-72',
  srOnly: 'sr-only',
  hubName: 'text-3xl font-extrabold tracking-tight text-[var(--play-ink)]',
  hubTagline: 'max-w-64 text-sm text-[var(--play-ink-soft)]',
  hubDivider: 'h-px w-48 rounded-full bg-[var(--play-ink-faint)] sm:h-80 sm:w-px',
  hubMenu: 'flex w-full max-w-sm flex-col gap-6',
  // Buttons of one family, the families spaced apart
  hubGroup: 'flex flex-col gap-3',
  hubButton: 'w-full py-3.5! text-base!',
  // Tip wrapper stretched to its button
  tipBlock: 'flex! w-full',
  // Window opened over the hub, its own scroll
  sheet: 'fixed inset-0 z-30 grid place-items-center p-2 sm:p-6',
  sheetScrim: 'absolute inset-0 bg-[var(--play-night)]/45 backdrop-blur-sm',
  sheetWindow:
    'play-glass play-rise relative flex max-h-full w-full max-w-2xl flex-col gap-3 overflow-hidden rounded-3xl p-4',
  sheetHead: 'flex shrink-0 items-center justify-between gap-3',
  sheetTitle: 'text-sm font-extrabold tracking-wide text-[var(--play-ink)] uppercase',
  sheetClose:
    'grid size-9 place-items-center rounded-full text-[var(--play-ink-soft)] transition-colors hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  sheetCloseIcon: 'size-4',
  sheetBody: 'flex min-h-0 flex-col gap-4 overflow-y-auto',
  backIcon: 'size-3.5',
  hubBack:
    'inline-flex w-fit items-center gap-1.5 text-xs font-extrabold tracking-wider text-[var(--play-ink-soft)] uppercase hover:text-[var(--play-ink)]',
  hubSide: 'flex w-full max-w-xl flex-col gap-4',
  // Words written on the squares, blue pen
  words:
    'pointer-events-none fixed inset-0 z-0 grid grid-cols-[repeat(auto-fill,var(--play-paper-cell))] grid-rows-[repeat(auto-fill,var(--play-paper-cell))] overflow-hidden',
  word: 'play-pen',
  // Syllables rising like embers
  embers: 'pointer-events-none fixed inset-0 z-0 overflow-hidden',
  ember: 'play-ember',
  // Big bomb behind the hub
  bombBanner: 'play-bomb-banner absolute -right-24 -bottom-24 w-[46rem] max-w-[90vw]',
  // Tables
  list: 'flex flex-col gap-2',
  row: `${PANEL} flex items-center gap-3 px-3 py-3`,
  rowActions: 'flex shrink-0 items-center gap-2',
  rowText: 'flex min-w-0 flex-1 flex-col',
  rowTitle: 'truncate text-sm font-extrabold text-[var(--play-ink)]',
  rowNote: NOTE,
  empty: `${PANEL} px-4 py-5 text-sm italic text-[var(--play-ink-faint)]`,
  // Leaderboard
  leader: 'flex items-center gap-3 rounded-2xl px-3 py-2',
  leaderMe: 'bg-[var(--play-chip)]',
  leaderText: 'flex min-w-0 items-baseline gap-2',
  leaderRank: 'w-7 text-center text-sm font-extrabold tabular-nums text-[var(--play-ink-faint)]',
  leaderRankTop: 'text-[var(--play-gold-ink)]',
  leaderName: 'truncate text-sm font-bold text-[var(--play-ink)]',
  leaderNote: NOTE,
  leaders: `${PANEL} flex flex-col gap-1 p-2`,
  leaderTabs: 'flex justify-center gap-1 rounded-full bg-[var(--play-chip)] p-1 self-center',
  leaderTab:
    'rounded-full px-4 py-1.5 text-xs font-extrabold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)]',
  leaderTabOn: 'bg-[var(--play-panel-strong)] text-[var(--play-ink)] shadow-[var(--shadow-sm)]',
  // Lobby
  seats: 'grid gap-3 sm:grid-cols-2',
  seat: `${PANEL} flex h-16 items-center gap-3 px-3`,
  // Empty seat inviting, dashed
  inviteSlot:
    'flex h-16 w-full items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--play-line)] px-3 text-left text-[var(--play-ink-soft)] transition-colors hover:border-[var(--play-ink-faint)] hover:text-[var(--play-ink)]',
  inviteSlotIcon:
    'grid size-10 shrink-0 place-items-center rounded-full bg-[var(--play-chip)] text-[var(--play-ink-soft)]',
  rowLogo: 'size-10',
  seatOff: 'opacity-50',
  seatName: 'truncate text-sm font-extrabold',
  seatNote: NOTE,
  seatText: 'min-w-0',
  actions: 'flex flex-wrap items-center gap-3',
} as const

/**
 * Play progression board
 * @type {Record<string, string>}
 */

export const PLAY_STATS = {
  // Classic Memora look, outside the room
  classic: 'play-classic flex flex-col gap-6 text-[var(--play-ink)]',
  playerFrame: '@container',
  section: 'flex flex-col gap-3',
  heading: HEADING,
  player: `${PANEL} ${LIFT} flex flex-col items-center gap-5 rounded-[2rem] p-5 text-center @md:flex-row @md:text-left sm:p-6`,
  face: 'relative flex shrink-0',
  faceLevel:
    'absolute -right-1 -bottom-1 flex h-9 min-w-9 items-center justify-center rounded-full bg-[var(--play-gold)] px-1.5 text-sm font-extrabold tabular-nums text-[var(--play-night)] ring-4 ring-[var(--play-panel-strong)]',
  playerText: 'flex min-w-0 flex-1 flex-col gap-2.5',
  playerHead: 'flex flex-wrap items-center justify-center gap-2 @md:justify-start',
  playerName: 'mr-1 text-2xl font-extrabold tracking-tight',
  tier: 'inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-extrabold tracking-wider text-[var(--play-night)] uppercase',
  chip: 'rounded-full bg-[var(--play-chip)] px-2.5 py-1 text-xs font-extrabold tabular-nums',
  bar: 'block h-3 w-full overflow-hidden rounded-full bg-[var(--play-track)]',
  barThin: 'block h-2 w-full overflow-hidden rounded-full bg-[var(--play-track)]',
  barFill: 'block h-full rounded-full bg-linear-to-r from-[var(--play-key)] to-[var(--play-gold)]',
  caption: NOTE,
  tiles: 'grid grid-cols-2 gap-3 sm:grid-cols-3',
  tile: `${PANEL} flex flex-col gap-1 p-4`,
  tileValue: 'text-2xl font-extrabold tabular-nums',
  tileLabel: 'text-xs font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  games: 'grid gap-3 sm:grid-cols-2',
  game: `${PANEL} flex items-center gap-3 p-3`,
  gameLogo: 'size-12',
  gameText: 'flex min-w-0 flex-1 flex-col gap-1.5',
  gameHead: 'flex items-baseline justify-between gap-2',
  gameName: 'truncate font-extrabold',
  gameLevel: 'text-sm font-extrabold tabular-nums text-[var(--play-accent)]',
  trophies: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
  trophy: `${PANEL} flex items-center gap-3 p-3`,
  trophyOn: 'bg-linear-to-br from-[var(--play-gold)]/25 to-transparent ring-[var(--play-gold)]/60',
  trophyIcon:
    'grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--play-chip)] text-[var(--play-ink-faint)]',
  trophyIconOn:
    'bg-[var(--play-gold)] text-[var(--play-night)] shadow-[0_0.2rem_0_var(--play-gold-deep)]',
  glyph: 'size-5',
  trophyText: 'flex min-w-0 flex-1 flex-col gap-1',
  trophyName: 'truncate text-sm font-extrabold',
  trophyGoal: 'truncate text-xs text-[var(--play-ink-soft)]',
} as const

/**
 * Sheet of another player: tier colour carries the page
 * @type {Record<string, string>}
 */

export const PLAY_PLAYER = {
  back: 'w-fit',
  backIcon: 'size-4',
  hero: 'flex flex-col gap-4 rounded-3xl bg-[color-mix(in_oklab,var(--tier)_22%,var(--play-night))] p-6 ring-2 ring-[var(--tier)] sm:p-8',
  top: 'flex flex-wrap items-center gap-5',
  avatar: 'ring-4 ring-[var(--tier)]',
  who: 'flex min-w-0 flex-1 flex-col gap-1',
  name: 'truncate text-3xl font-extrabold tracking-tight text-[var(--play-ink)] sm:text-5xl',
  tier: 'text-sm font-bold tracking-wide text-[var(--tier)] uppercase',
  level: 'flex flex-col items-end',
  levelKicker: 'text-xs font-bold tracking-widest text-[var(--play-ink-soft)] uppercase',
  levelValue: 'text-6xl leading-none font-extrabold tabular-nums text-[var(--tier)] sm:text-7xl',
  track: 'h-3 overflow-hidden rounded-full bg-black/40',
  fill: 'block h-full rounded-full bg-[var(--tier)]',
  caption: NOTE,
  figures: 'mt-2 grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-6',
  figure: 'flex flex-col-reverse gap-1 border-l-2 border-[var(--tier)] pl-4',
  figureValue: 'text-3xl font-extrabold tabular-nums text-[var(--play-ink)]',
  figureLabel: 'text-xs font-bold tracking-wide text-[var(--play-ink-soft)] uppercase',
} as const

/**
 * Lobby chat bubble stuck to the right edge, vertically centred
 * @type {Record<string, string>}
 */

export const PLAY_CHAT_BUBBLE = {
  open: 'play-side-in mt-4 flex min-h-80 w-full flex-col lg:fixed lg:top-1/2 lg:right-0 lg:z-40 lg:mt-0 lg:w-[var(--play-side-open)] lg:-translate-y-1/2',
  folding: 'play-side-out',
  closed:
    'play-glass play-pop fixed top-1/2 right-0 z-40 grid size-14 -translate-y-1/2 place-items-center rounded-l-full text-[var(--play-ink)] hover:text-[var(--play-gold-ink)]',
  icon: 'size-6',
} as const

/**
 * Play invitation hung under the rail shortcut
 * @type {Record<string, string>}
 */

export const PLAY_NOTICE = {
  wrap: 'relative mx-4 pt-3 pb-1',
  caret: 'pointer-events-none absolute top-1.5 h-3 w-3 rotate-45 rounded-sm bg-[var(--play-dusk)]',
  bubble:
    'play-sky rail-reset relative z-10 block rounded-[var(--radius-lg)] p-3.5 pr-10 shadow-[var(--shadow-md)] ring-1 ring-[var(--play-gold)]/50',
  titleRow: 'flex flex-wrap items-center gap-2',
  title: 'block text-sm font-extrabold text-[var(--play-gold-ink)]',
  lead: 'mt-0.5 block text-sm font-semibold text-[var(--play-ink)]',
  dismiss:
    'absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full text-[var(--play-ink-soft)] transition-colors hover:bg-white/15 hover:text-[var(--play-ink)]',
  dismissIcon: 'h-3.5 w-3.5',
} as const

/**
 * Game choice laid as a row of tall posters
 * @type {Record<string, string>}
 */

export const PLAY_CROSS = {
  stage: 'flex min-h-[calc(100dvh-14rem)] items-center justify-center',
  cross: 'mx-auto grid w-full max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6',
  card: '',
} as const

// Bubble opened by the dock
const BUBBLE = 'play-glass rounded-2xl'

/**
 * Dock at the bottom of Memora Play
 * @type {Record<string, string>}
 */

export const PLAY_DOCK = {
  wrap: 'fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none',
  bar: `${BUBBLE} pointer-events-auto relative flex items-center gap-2 rounded-full px-3 py-2 sm:gap-4 sm:px-5`,
  button:
    'grid size-11 place-items-center rounded-full text-[var(--play-ink-soft)] transition-colors hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  buttonOn: 'bg-[var(--play-chip)] text-[var(--play-ink)]',
  // Game or invitation waiting, the glyph turns gold
  buttonCall: 'text-[var(--play-gold-ink)]',
  icon: 'size-5',
  avatarButton: 'relative mx-1 -my-6 rounded-full transition-transform hover:-translate-y-0.5',
  avatarRing: 'rounded-full ring-4 ring-[var(--play-panel-strong)]',
  level:
    'absolute -right-1 -bottom-1 grid min-w-7 place-items-center rounded-full bg-[var(--play-gold)] px-1.5 py-0.5 text-xs font-extrabold tabular-nums text-[var(--play-night)] ring-2 ring-[var(--play-panel-strong)]',
  split: 'h-6 w-px bg-[var(--play-line)]',
  // Bubble pointing at its button
  bubble: `${BUBBLE} play-rise pointer-events-auto absolute bottom-full mb-20 flex w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col p-4 text-[var(--play-ink)]`,
  // Shrinking bubbles pointing at the key
  trail: 'play-glass play-pop pointer-events-none absolute rounded-full',
  head: 'play-rise-item flex items-center justify-between gap-3 pb-3',
  content: 'play-rise-item',
  title: 'text-sm font-extrabold tracking-wide uppercase',
  open: 'grid size-8 place-items-center rounded-full text-[var(--play-ink-soft)] hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  openIcon: 'size-4',
  rows: 'flex max-h-96 flex-col divide-y divide-[var(--play-line)] overflow-y-auto',
  row: 'flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0',
  rowHead: 'flex items-center justify-between gap-2 text-sm font-extrabold',
  rowName: 'flex min-w-0 items-center gap-2 truncate',
  rowLogo: 'size-7',
  rowValue: 'text-sm font-extrabold tabular-nums text-[var(--play-accent)]',
  rowNote: NOTE,
  rowActions: 'flex items-center gap-2 pt-1 pb-1.5',
  empty: 'py-2 text-sm italic text-[var(--play-ink-faint)]',
  // Nothing in the feed, glyph over the line
  void: 'flex flex-col items-center gap-2 py-4 text-center text-sm font-bold text-[var(--play-ink-soft)]',
  voidIcon: 'size-9 text-[var(--play-ink-faint)]',
} as const

/**
 * Lobby page: logo, the players in the middle, the chat on the right
 * @type {Record<string, string>}
 */

export const PLAY_ROOM = {
  // Lobby: header row, then the box centred in what is left
  main: 'flex min-w-0 flex-col gap-4 lg:min-h-[calc(100dvh-17rem)]',
  head: 'flex items-start justify-between gap-4',
  center: 'my-auto',
  logo: 'ml-16 size-28 sm:ml-12 sm:size-32 xl:ml-8',
  game: NOTE,
  back: 'inline-flex shrink-0 items-center gap-1.5 text-xs font-extrabold tracking-wider text-[var(--play-ink-soft)] uppercase hover:text-[var(--play-ink)]',
  // Players and gestures, centred
  middle: 'mx-auto flex w-full max-w-xl flex-col items-center gap-6',
  playersTitle: `${HEADING} text-center`,
  box: `${PANEL} ${LIFT} flex w-full flex-col items-center gap-5 p-5`,
  seatsBox: 'h-[17.5rem] w-full overflow-y-auto p-1',
  actions: 'flex w-full max-w-sm flex-col gap-4',
  divider: 'h-px w-full bg-[var(--play-line)]',
  secondary: 'grid grid-cols-2 gap-3 *:min-w-0',
  note: 'text-center text-sm text-[var(--play-ink-soft)]',
} as const

/**
 * Discord-like chat of a game, plain text
 * @type {Record<string, string>}
 */

export const PLAY_CHAT_UI = {
  headActions: 'flex items-center gap-1',
  panel: `${PANEL} ${LIFT} flex h-full flex-col overflow-hidden lg:rounded-r-none`,
  // Inside the session side column: takes the room left under the players
  panelSide: `${PANEL} ${LIFT} flex min-h-0 flex-1 flex-col overflow-hidden max-lg:h-[28rem] lg:rounded-r-none`,
  head: 'flex items-center justify-between gap-3 border-b border-[var(--play-line)] px-4 py-3',
  title: 'text-sm font-extrabold tracking-wide uppercase',
  list: 'flex flex-1 flex-col overflow-y-auto px-2 py-3',
  empty: 'm-auto px-6 text-center text-sm italic text-[var(--play-ink-faint)]',
  message: 'flex gap-3 rounded-lg px-2 pt-2 pb-0.5 hover:bg-[var(--play-chip)]',
  event: 'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-[var(--play-ink-soft)]',
  eventName: 'font-extrabold text-[var(--play-ink)]',
  eventVerb: 'font-bold',
  follow: 'rounded-lg py-0.5 pr-2 pl-[2.75rem] hover:bg-[var(--play-chip)]',
  body: 'flex min-w-0 flex-col',
  meta: 'flex items-baseline gap-2',
  author: 'truncate text-sm font-extrabold',
  time: 'text-[0.7rem] font-semibold tabular-nums text-[var(--play-ink-faint)]',
  text: 'text-sm break-words whitespace-pre-wrap text-[var(--play-ink)]',
  composer: 'border-t border-[var(--play-line)] p-3',
  input:
    'block max-h-32 min-h-11 w-full resize-none rounded-xl bg-[var(--play-chip)] px-3 py-2.5 text-sm text-[var(--play-ink)] placeholder:text-[var(--play-ink-faint)] focus:outline-none',
} as const

/**
 * Invitation picker, everyone or chosen people
 * @type {Record<string, string>}
 */

export const PLAY_INVITE = {
  anchor: 'relative',
  panel: `${BUBBLE} absolute top-full left-0 z-30 mt-2 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3 p-3 text-[var(--play-ink)]`,
  panelEnd: 'right-0 left-auto',
  // Opens in the seats grid, never clipped
  anchorInline: 'contents',
  panelInline: `${PANEL} relative col-span-full mx-auto mt-2 flex w-full max-w-md flex-col gap-3 p-3 text-[var(--play-ink)]`,
  // Tip aimed at the trigger above
  arrow:
    'absolute -top-1.5 left-[var(--arrow-x,50%)] size-3 -translate-x-1/2 rotate-45 bg-[var(--play-panel-strong)] ring-1 ring-[var(--play-line)] [clip-path:polygon(0_0,100%_0,0_100%)]',
  choice:
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-extrabold hover:bg-[var(--play-chip)]',
  choiceIcon: 'size-5 shrink-0 text-[var(--play-ink-soft)]',
  roles: 'grid grid-cols-2 gap-1 rounded-xl bg-[var(--play-chip)] p-1',
  role: 'rounded-lg px-3 py-1.5 text-xs font-extrabold text-[var(--play-ink-soft)]',
  roleOn: 'bg-[var(--play-panel-strong)] text-[var(--play-ink)] shadow-[var(--shadow-sm)]',
  search:
    'w-full rounded-xl bg-[var(--play-chip)] px-3 py-2 text-sm placeholder:text-[var(--play-ink-faint)] focus:outline-none',
  people: 'flex max-h-44 flex-col overflow-y-auto',
  person:
    'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm font-bold hover:bg-[var(--play-chip)]',
  personOn: 'play-pick bg-[var(--play-chip)]',
  check: 'ml-auto size-4 text-[var(--play-ink)]',
  empty: 'px-2 py-2 text-sm italic text-[var(--play-ink-faint)]',
  back: 'w-fit text-xs font-extrabold tracking-wider text-[var(--play-ink-soft)] uppercase hover:text-[var(--play-ink)]',
} as const

/**
 * Baccalaureat board, phase by phase
 * @type {Record<string, string>}
 */

export const BAC_BOARD = {
  board: 'flex flex-col gap-5',
  bar: 'flex flex-wrap items-center justify-between gap-3',
  round: NOTE,
  clock: 'text-2xl font-extrabold tabular-nums text-[var(--play-ink)]',
  clockLow: 'text-[var(--color-danger)]',
  // Countdown in place of the board, no veil behind
  inline: 'grid min-h-[50vh] place-items-center',
  // Countdown, a big blue 3D figure in the middle of the page over a blurred room
  overlay: 'fixed inset-0 z-30 grid place-items-center bg-[var(--play-night)]/45 backdrop-blur-xl',
  stage: 'flex flex-col items-center justify-center gap-6 text-center',
  stageLead: 'text-sm font-extrabold tracking-[0.3em] text-[var(--play-ink-soft)] uppercase',
  figure:
    'play-figure play-figure-blue text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Someone called stop: their face, then the word, in place of the clock
  stop: 'flex items-center gap-3',
  stopWord:
    'play-stop text-4xl leading-none font-extrabold tracking-tight text-[var(--color-danger)] sm:text-6xl',
  // Letter tile
  letterRow: 'flex items-center gap-4',
  letter:
    'play-figure grid size-20 place-items-center rounded-2xl bg-[var(--play-chip)] text-6xl font-black',
  letterLabel: 'text-xs font-extrabold tracking-widest text-[var(--play-ink-faint)] uppercase',
  // Writing form
  fields: 'grid gap-3 sm:grid-cols-2',
  field: 'flex flex-col gap-1.5',
  fieldLabel: 'text-xs font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  input:
    'rounded-xl bg-[var(--play-chip)] px-3 py-2.5 text-base font-bold text-[var(--play-ink)] placeholder:font-normal placeholder:text-[var(--play-ink-faint)] focus:outline-none focus-visible:shadow-[0_0_0_2px_var(--play-baccalaureat)]!',
  actions: 'flex flex-wrap items-center gap-3',
  // Review and scores
  lead: 'text-sm text-[var(--play-ink-soft)]',
  categories: 'flex flex-col gap-4',
  category: 'flex flex-col gap-2',
  categoryName: 'text-xs font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  answers: 'flex flex-col divide-y divide-[var(--play-line)] rounded-xl bg-[var(--play-chip)]',
  answer: 'flex items-center gap-3 px-3 py-2',
  answerName: 'w-28 shrink-0 truncate text-xs font-bold text-[var(--play-ink-soft)]',
  answerWord: 'min-w-0 flex-1 truncate text-sm font-extrabold text-[var(--play-ink)]',
  answerOff: 'line-through opacity-50',
  answerEmpty: 'min-w-0 flex-1 text-sm italic text-[var(--play-ink-faint)]',
  answerNote: NOTE,
  vote: 'rounded-lg px-2.5 py-1 text-xs font-extrabold text-[var(--play-ink-soft)] hover:bg-[var(--play-panel-strong)]',
  voteOn: 'bg-[var(--play-panel-strong)] text-[var(--play-ink)]',
  // Vote side with the faces of its voters
  voteSide: 'flex shrink-0 items-center gap-1.5',
  voteLabel: 'px-1 text-xs font-extrabold text-[var(--play-ink-faint)]',
  // Ranking
  ranks: 'flex flex-col gap-2',
  rank: `${PANEL} flex items-center gap-3 px-3 py-2.5`,
  rankIndex: 'w-6 text-center text-sm font-extrabold tabular-nums text-[var(--play-ink-faint)]',
  rankName: 'min-w-0 flex-1 truncate text-sm font-extrabold',
  rankPoints: 'text-sm font-extrabold tabular-nums text-[var(--play-ink)]',
  // Podium, first place in the middle
  podium: 'relative flex items-end justify-center gap-3 pt-10 sm:gap-5',
  podiumPlace: 'flex w-24 flex-col items-center gap-2 sm:w-32',
  podiumFace: 'relative flex flex-col items-center gap-1',
  podiumCrown: 'absolute -top-7 size-7 text-[var(--play-gold-ink)]',
  podiumName: 'w-full truncate text-center text-sm font-extrabold',
  podiumPoints: NOTE,
  podiumBlock:
    'flex w-full items-start justify-center rounded-t-2xl pt-3 text-3xl font-extrabold tabular-nums text-[var(--play-night)]',
  highlights: 'grid gap-3 sm:grid-cols-2',
  highlight: `${PANEL} flex flex-col gap-1 p-3`,
} as const

/**
 * Bomb Party board: letters column, the bomb ringed by its players
 * @type {Record<string, string>}
 */

export const BOMB_BOARD = {
  board: 'relative grid items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)]',
  figure:
    'play-figure play-figure-fire text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Bonus letters, a column on the left
  letters: 'flex gap-1 max-sm:flex-wrap max-sm:justify-center sm:flex-col',
  letter:
    'grid size-7 place-items-center rounded-lg bg-[var(--play-chip)] text-xs font-extrabold text-[var(--play-ink-faint)] transition-colors duration-[var(--motion-duration-fast)]',
  letterOn:
    'bg-[var(--play-bomb)] text-[var(--play-on-art)] shadow-[0_0.15rem_0_var(--play-bomb-deep)]',
  // Clear of the dock at the bottom
  stage: 'flex min-w-0 flex-col items-center gap-4 pb-16',
  // Square table, seats on an orbit
  table: 'play-bomb-table relative aspect-square w-full max-w-[min(34rem,60dvh)]',
  center: 'absolute top-1/2 left-1/2 w-[44%] -translate-x-1/2 -translate-y-1/2',
  bomb: 'play-bomb relative',
  bombBlast: 'play-bomb-blast',
  bombArt: 'block h-auto w-full',
  prompt:
    'absolute top-[59%] left-[48%] -translate-x-1/2 -translate-y-1/2 text-[clamp(1.5rem,6cqi,3rem)] leading-none font-black tracking-wider text-[var(--play-on-art)] uppercase',
  spark: 'play-bomb-spark',
  arrow: 'play-bomb-arrow',
  seat: 'play-bomb-seat flex w-28 flex-col items-center gap-1 text-center transition-opacity duration-[var(--motion-duration-panel)]',
  seatTurn: 'play-bomb-seat-turn',
  seatOut: 'opacity-40 grayscale',
  seatBlast: 'play-bomb-shake',
  seatNote: NOTE,
  hearts: 'flex items-center gap-0.5',
  heartCell: 'relative grid',
  heartShine: 'play-heart-shine',
  heart: 'size-6 drop-shadow-[0_2px_4px_rgb(0_0_0/0.35)]',
  heartOn: 'text-[var(--play-heart)]',
  heartOff: 'text-[var(--play-ink-faint)] opacity-50',
  // Live typing under the player on turn
  draft:
    'max-w-36 truncate rounded-lg bg-[var(--play-chip)] px-2 py-0.5 text-sm font-extrabold tracking-wide text-[var(--play-ink)] uppercase',
  draftMiss: 'text-[var(--color-danger)] line-through',
  // Last word a player got through, kept until the next one
  lastWord:
    'max-w-36 truncate rounded-lg bg-[var(--play-chip)] px-2 py-0.5 text-sm font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  missReason: 'text-[0.7rem] font-bold text-[var(--color-danger)]',
  lead: 'text-center text-sm text-[var(--play-ink-soft)]',
  leadPrompt: 'font-black tracking-wider text-[var(--play-bomb-glow)] uppercase',
  form: 'flex w-full max-w-md items-center gap-2',
  input:
    'min-w-0 flex-1 rounded-xl bg-[var(--play-chip)] px-4 py-3 text-center text-lg font-extrabold tracking-wide text-[var(--play-ink)] uppercase placeholder:font-normal placeholder:normal-case placeholder:text-[var(--play-ink-faint)] focus:bg-[var(--play-panel-strong)] focus:outline-none',
  // Final screen
  result: 'flex flex-col items-center gap-5',
} as const

/**
 * Podium block by place
 * @type {Record<number, string>}
 */

export const BAC_PODIUM_BLOCKS: Record<number, string> = {
  1: 'h-32 bg-[var(--play-medal-first)]',
  2: 'h-24 bg-[var(--play-medal-second)]',
  3: 'h-16 bg-[var(--play-medal-third)]',
}

/**
 * Confetti falling over the podium
 * @type {Record<string, string>}
 */

export const PLAY_CONFETTI_UI = {
  layer: 'pointer-events-none fixed inset-0 z-30 overflow-hidden',
  piece: 'play-confetti absolute top-0 block',
} as const

/**
 * Session page of a running game: the table, and a column flush right holding crowd, chat and feed
 * @type {Record<string, string>}
 */

export const BAC_SESSION = {
  page: 'relative w-full pb-6 transition-[padding] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  pageOpen: 'lg:pr-[calc(var(--play-side-open)+1.5rem)]',
  pageFolded: 'lg:pr-[calc(var(--play-side-folded)+1.5rem)]',
  main: 'flex min-w-0 flex-col gap-4',
  // Way out on the left, game identity on the right
  top: 'flex items-center justify-between gap-3',
  exits: 'flex flex-wrap items-center gap-2',
  exit: 'gap-2 px-3.5! py-2! text-sm!',
  exitIcon: 'size-4',
  identity: 'flex items-center gap-3',
  titles: 'flex min-w-0 flex-col items-end',
  title: 'truncate text-lg font-extrabold tracking-tight text-[var(--play-ink)]',
  logo: 'size-14',
  box: `${PANEL} ${LIFT} flex flex-col gap-5 p-5 sm:p-6`,
  // Column flush against the right edge, under the shell bar
  side: 'mt-4 flex min-w-0 flex-col gap-3 lg:fixed lg:top-[var(--play-bar-h)] lg:right-0 lg:bottom-0 lg:z-40 lg:mt-0 lg:pb-28',
  sideOpen: 'lg:w-[var(--play-side-open)]',
  sideFolded: 'lg:w-[var(--play-side-folded)]',
  // Crowd window: players, then spectators when there are some
  crowd: `${PANEL} ${LIFT} flex shrink-0 flex-col gap-3 p-4 lg:rounded-r-none`,
  group: 'flex min-w-0 flex-col gap-2',
  groupTitle: 'text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  stack: 'flex flex-wrap items-center -space-x-2.5',
  stacked: 'rounded-full ring-2 ring-[var(--play-ring)]',
  empty: 'text-sm italic text-[var(--play-ink-faint)]',
  fold: 'inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--play-ink-soft)] hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  foldIcon: 'size-5',
  // Avatars in a row, done or still writing
  progress:
    'flex flex-wrap items-center justify-center gap-5 border-t border-[var(--play-line)] pt-4',
  progressItem: 'relative',
  badge:
    'absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full ring-2 ring-[var(--play-ring)]',
  badgeDone: 'bg-[var(--play-baccalaureat)] text-[var(--play-on-art)]',
  badgeWriting: 'bg-[var(--play-panel-strong)] text-[var(--play-ink)]',
  badgeIcon: 'size-3.5',
  // Feed of the session, under the chat
  feedBox: `${PANEL} ${LIFT} flex max-h-60 min-h-0 shrink-0 flex-col gap-3 p-4 lg:rounded-r-none`,
  feedTitle: 'text-sm font-extrabold tracking-wide uppercase',
  feed: 'flex min-h-0 flex-col gap-1 overflow-y-auto',
  feedLine: 'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-[var(--play-ink)]',
  feedName: 'font-extrabold',
  feedText: 'min-w-0 flex-1 text-[var(--play-ink-soft)]',
  feedTime: 'text-[0.7rem] font-semibold tabular-nums text-[var(--play-ink-faint)]',
  feedMark:
    'grid size-6 shrink-0 place-items-center rounded-full bg-[var(--play-chip)] text-[var(--play-blue-ink)]',
  feedMarkIcon: 'size-3.5',
  // Folded side: one button on the right edge
  rail: `${PANEL} ${LIFT} flex items-center justify-center p-2 lg:rounded-r-none`,
} as const

const SETUP_TILE =
  'rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] text-[var(--color-on-field)] transition-colors hover:border-[var(--color-field-border-strong)]'
// Picked in the game colour
const SETUP_BLUE =
  'border-[var(--play-baccalaureat)] bg-[var(--play-baccalaureat)] text-white hover:border-[var(--play-baccalaureat)]'
const SETUP_FIRE =
  'border-[var(--play-bomb)] bg-[var(--play-bomb)] text-white hover:border-[var(--play-bomb)]'

/**
 * Setup drawer classes, picked in one colour
 * @param {string} picked - Picked tile class
 * @return {Record<string, string>} - Classes
 */

export const setupStyles = (picked: string) =>
  ({
    body: `flex flex-col ${PROPERTY_SPACING.rows}`,
    head: 'flex items-center justify-between gap-4',
    // Label left, switch right
    switchRow: 'flex min-h-11 items-center justify-between gap-4',
    switchLabel: 'text-sm font-medium text-[var(--color-ink)]',
    count: 'shrink-0 text-sm font-bold tabular-nums text-[var(--color-ink-subtle)]',
    value: 'text-sm font-semibold text-[var(--color-ink)]',
    letters: 'flex flex-wrap gap-1.5',
    // Unchecked greyed, checked in colour, white letter both ways
    letter:
      'grid size-9 place-items-center rounded-[var(--radius-md)] border border-transparent bg-[var(--color-border-strong)] text-sm font-semibold text-white transition-colors hover:brightness-95',
    letterOn: picked,
    quick: 'flex gap-2',
    quickButton:
      'rounded-full px-3 py-1.5 text-xs font-bold text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
    // Preset chips
    chips: 'flex flex-wrap gap-2',
    chip: `${SETUP_TILE} min-h-11 px-3.5 text-sm font-semibold tabular-nums`,
    chipOn: picked,
    // Stepper
    stepper: 'flex items-center gap-3',
    step: `${SETUP_TILE} grid size-11 place-items-center disabled:pointer-events-none disabled:opacity-40`,
    stepIcon: 'size-4',
    stepValue: 'min-w-10 text-center text-xl font-bold tabular-nums text-[var(--color-ink)]',
    // Choice cards
    cards: 'grid grid-cols-2 gap-3',
    card: `${SETUP_TILE} flex flex-col items-start gap-0.5 px-3.5 py-2.5 text-left`,
    cardOn: picked,
    cardTitle: 'text-sm font-semibold',
    cardNote: 'text-xs opacity-70',
  }) as const

export type PlaySetupStyles = ReturnType<typeof setupStyles>

/**
 * Setup drawer of a new Baccalaureat game
 * @type {PlaySetupStyles}
 */

export const BAC_SETUP = setupStyles(SETUP_BLUE)

/**
 * Setup drawer of a new Bomb Party game
 * @type {PlaySetupStyles}
 */

export const BOMB_SETUP = setupStyles(SETUP_FIRE)

/**
 * Rules of a game, read only, in a page drawer
 * @type {Record<string, string>}
 */

export const BAC_RULES = {
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-col gap-1 py-3 first:pt-0 last:pb-0',
  label: PROPERTY_LABEL,
  value: 'text-sm text-[var(--color-ink)]',
} as const

/**
 * Verb colour of a chat event, by kind
 * @type {Record<string, string>}
 */

export const PLAY_CHAT_VERBS: Record<string, string> = {
  JOINED: 'text-[var(--play-golf-glow)]',
  LEFT: 'text-[var(--play-bomb-glow)]',
  KICKED: 'text-[var(--play-heart)]',
}

/**
 * Verb colour of a game feed line, by kind
 * @type {Record<string, string>}
 */

export const PLAY_FEED_VERBS: Record<string, string> = {
  WORD: 'text-[var(--play-blue-ink)]',
  BLAST: 'text-[var(--play-heart)]',
  LIFE: 'text-[var(--play-gold-ink)]',
  finished: 'text-[var(--play-blue-ink)]',
  stopped: 'text-[var(--play-heart)]',
  HOLED: 'text-[var(--play-golf-glow)]',
  ACE: 'text-[var(--play-gold-ink)]',
  POWER: 'text-[var(--play-blue-ink)]',
  FALL: 'text-[var(--play-heart)]',
}

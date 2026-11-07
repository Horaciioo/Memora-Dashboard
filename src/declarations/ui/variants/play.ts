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
export const PLAY_PANEL = PANEL
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
    'relative z-10 flex min-h-0 w-full flex-1 flex-col gap-8 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pt-6 pb-36 sm:px-8 xl:px-12',
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
  // Blocky title, extruded upward
  title:
    'play-title text-center text-4xl leading-none font-black tracking-wide text-white uppercase sm:text-5xl',
  headRow: 'flex flex-wrap items-end justify-between gap-3',
  callout: `${PANEL} flex flex-wrap items-center justify-between gap-3 bg-[var(--play-panel-strong)] px-5 py-4 text-sm font-semibold text-[var(--play-ink)]`,
  // Game cards
  games: 'grid gap-5 sm:grid-cols-2 2xl:grid-cols-4',
  main: 'flex min-w-0 flex-col gap-10',
  // Phone: a wide row, art right, name left
  card: `play-card relative flex aspect-[3/4] min-h-96 flex-col justify-end overflow-hidden rounded-[2rem] text-[var(--play-on-art)] ${LIFT} ring-2 ring-white/20 transition-transform duration-100 active:scale-[0.98] max-md:aspect-[5/2] max-md:min-h-28 max-md:justify-center max-md:rounded-3xl`,
  cardShade:
    'absolute inset-0 bg-linear-to-t from-[var(--play-night)] from-5% via-[var(--play-night)]/55 via-35% to-transparent to-65% max-md:bg-linear-to-r max-md:via-45% max-md:to-80%',
  cardLink:
    'absolute inset-0 z-10 rounded-[2rem] max-md:rounded-3xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-key)]',
  cardBody:
    'relative flex flex-col items-center gap-2 p-7 text-center max-md:w-3/5 max-md:items-start max-md:gap-1 max-md:p-5 max-md:text-left',
  cardName:
    'truncate text-3xl font-extrabold tracking-tight uppercase max-md:max-w-full max-md:text-xl max-md:whitespace-normal',
  cardTagline:
    'line-clamp-3 text-sm text-[var(--play-on-art)]/85 max-md:line-clamp-2 max-md:text-xs',
  skeleton:
    'animate-pulse rounded-[1.75rem] bg-[var(--play-panel-strong)] motion-reduce:animate-none',
  // Game hub, centred and fitted to the room: logo | divider | actions, never scrolling
  page: 'relative flex min-h-0 flex-1 flex-col',
  hub: 'relative flex min-h-0 flex-1 items-center justify-center max-sm:overflow-y-auto',
  hubSplit: 'flex flex-col items-center gap-8 lg:flex-row lg:gap-14 xl:gap-20',
  hubLive: 'w-full max-w-md shrink-0 lg:max-h-[min(36rem,calc(100dvh-14rem))] lg:w-[26rem]',
  hubIdentity: 'flex flex-col items-center gap-4 text-center',
  hubLogo: 'size-40 sm:size-52',
  hubLogoLarge: 'size-44 sm:size-72',
  srOnly: 'sr-only',
  hubName: 'text-3xl font-extrabold tracking-tight text-[var(--play-ink)]',
  hubTagline: 'max-w-64 text-sm text-[var(--play-ink-soft)]',
  hubDivider: 'h-px w-48 shrink-0 rounded-full bg-[var(--play-ink-faint)] lg:h-80 lg:w-px',
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
  seats: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  // Two columns on a phone, so the seat stacks its face over its name
  seat: `${PANEL} relative flex h-20 items-center gap-4 px-4 text-left`,
  seatReady: 'mt-0.5 inline-flex items-center gap-1 text-xs font-extrabold text-[var(--play-ink)]',
  seatWait: 'mt-0.5 text-xs font-bold text-[var(--play-ink-faint)] italic',
  seatReadyIcon: 'size-3.5',
  // Empty seat inviting, dashed
  inviteSlot:
    'col-span-full flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--play-line)] px-3 text-[var(--play-ink-soft)] transition-colors hover:border-[var(--play-ink-faint)] hover:text-[var(--play-ink)]',
  inviteSlotIcon:
    'grid size-6 shrink-0 place-items-center rounded-full bg-[var(--play-chip)] text-[var(--play-ink-soft)]',
  inviteSlotText: 'truncate text-sm font-extrabold',
  rowLogo: 'size-10',
  seatOff: 'opacity-50',
  seatName: 'truncate text-base font-extrabold',
  seatNote: 'text-xs font-extrabold tracking-wider text-[var(--play-ink-faint)] uppercase',
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
  // Banner of the player, a soft sweep of the key behind
  player: `${PANEL} ${LIFT} relative flex flex-col items-center gap-6 overflow-hidden rounded-[2rem] bg-[linear-gradient(110deg,color-mix(in_srgb,var(--play-key)_22%,var(--play-panel-strong))_0%,var(--play-panel-strong)_55%)] p-6 text-center @md:flex-row @md:text-left sm:p-8`,
  face: 'relative flex shrink-0',
  faceLevel:
    'absolute -right-1 -bottom-1 flex h-9 min-w-9 items-center justify-center rounded-full bg-[var(--play-gold)] px-1.5 text-sm font-extrabold tabular-nums text-[var(--play-night)] ring-4 ring-[var(--play-panel-strong)]',
  playerText: 'flex min-w-0 flex-1 flex-col gap-2.5',
  playerHead: 'flex flex-wrap items-center justify-center gap-2 @md:justify-start',
  playerName: 'mr-1 text-2xl font-extrabold tracking-tight sm:text-3xl',
  tier: 'inline-flex w-fit items-center rounded-lg px-3 py-1 text-xs font-extrabold tracking-wider text-[var(--play-night)] uppercase',
  chip: 'rounded-lg bg-[var(--play-chip)] px-2 py-0.5 text-[0.65rem] font-extrabold md:px-2.5 md:py-1 md:text-xs tabular-nums',
  bar: 'block h-4 w-full overflow-hidden rounded-full bg-[var(--play-track)]',
  barThin: 'block h-2 w-full overflow-hidden rounded-full bg-[var(--play-track)]',
  barFill: 'block h-full rounded-full bg-[var(--play-gold)]',
  caption: NOTE,
  // One board split in cells, no loose cards
  tiles: `${LIFT} grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[var(--play-line)] ring-1 ring-[var(--play-line)] sm:grid-cols-3`,
  tile: 'flex flex-col gap-3 bg-[var(--play-panel-strong)] p-4 sm:p-5',
  tileIcon:
    'grid size-10 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--tile)_16%,transparent)] text-[var(--tile)]',
  tileText: 'flex min-w-0 flex-col gap-0.5',
  tileValue: 'text-2xl font-extrabold sm:text-3xl tracking-tight tabular-nums',
  tileLabel: 'text-xs font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  games: 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4',
  // Card topped by a band in its game colour
  game: `${LIFT} flex flex-col overflow-hidden rounded-2xl bg-[var(--play-panel-strong)] ring-1 ring-[var(--play-line)]`,
  gameBand:
    'flex h-24 items-center justify-center bg-[linear-gradient(135deg,var(--game),color-mix(in_srgb,var(--game)_60%,black))]',
  gameLogo: 'size-16 drop-shadow-[0_4px_0_rgb(0_0_0/0.2)]',
  gameText: 'flex min-w-0 flex-1 flex-col gap-2 p-4',
  gameHead: 'flex items-baseline justify-between gap-2',
  gameName: 'truncate text-lg font-extrabold',
  gameLevel: 'text-sm font-extrabold tabular-nums text-[var(--play-accent)]',
  trophies: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
  trophy: `${PANEL} flex items-center gap-4 p-4`,
  trophyOn:
    'bg-[color-mix(in_srgb,var(--play-gold)_16%,var(--play-panel))] ring-[var(--play-gold)]/60',
  trophyIcon:
    'grid size-14 shrink-0 place-items-center rounded-full bg-[var(--play-chip)] text-[var(--play-ink-faint)]',
  trophyIconOn:
    'bg-[var(--play-gold)] text-[var(--play-night)] shadow-[0_0.2rem_0_var(--play-gold-deep)]',
  glyph: 'size-6',
  trophyText: 'flex min-w-0 flex-1 flex-col gap-1',
  trophyName: 'truncate text-base font-extrabold',
  trophyGoal: 'truncate text-xs text-[var(--play-ink-soft)]',
} as const

/**
 * Sheet of another player: tier colour carries the page
 * @type {Record<string, string>}
 */

export const PLAY_PLAYER = {
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
  // Centred over the chat box, desktop only
  above: 'absolute bottom-full left-0 mb-3 flex w-full justify-center max-lg:hidden',
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
  // Games stacked left, a divider at the centre, who is playing right
  stage:
    'mx-auto grid w-full max-w-[96rem] items-start gap-8 pb-28 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch lg:gap-10',
  divider: 'w-px self-stretch bg-[var(--play-line)] max-lg:hidden',
  // Live tables, then the online box
  side: 'flex min-h-0 min-w-0 flex-col justify-center gap-6 max-md:hidden lg:mx-auto lg:w-full lg:max-w-sm lg:self-center',
  games: 'flex min-w-0 flex-col items-center gap-6',
  heading: `${HEADING} text-center max-md:sr-only sm:text-3xl`,
  // Two by two, posters as tall as the screen leaves room for
  cross: 'grid w-full gap-3 md:gap-5 md:grid-cols-2 lg:mx-auto lg:max-w-xs lg:grid-cols-1 lg:gap-3',
  card: 'min-h-0! md:aspect-[4/3]! lg:aspect-[2/1]! lg:rounded-2xl! lg:[&_h3]:text-xl lg:[&_p]:text-xs lg:[&_p]:line-clamp-2 lg:[&>div]:gap-1 lg:[&>div]:p-4',
  live: 'min-h-0 shrink',
  online: 'min-h-0 shrink-0',
} as const

// Bubble opened by the dock
const BUBBLE = 'play-glass rounded-2xl'
// Opaque card for pickers
const SOLID = 'rounded-2xl bg-[var(--play-panel-strong)] ring-1 ring-[var(--play-line)] shadow-xl'

/**
 * Dock at the bottom of Memora Play
 * @type {Record<string, string>}
 */

export const PLAY_DOCK = {
  wrap: 'fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none max-md:hidden',
  bar: `${BUBBLE} pointer-events-auto relative flex items-center gap-2 rounded-full px-3 py-2 sm:gap-4 sm:px-5`,
  button:
    'group relative grid size-11 place-items-center rounded-full text-[var(--play-ink-soft)] transition-colors hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  buttonOn: 'bg-[var(--play-chip)] text-[var(--play-ink)]',
  // Page title above a hovered key
  tip: 'play-glass pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-extrabold whitespace-nowrap text-[var(--play-ink)] opacity-0 transition-opacity group-hover:opacity-100 group-aria-expanded:hidden',
  // Game or invitation waiting, the glyph turns gold
  buttonCall: 'text-[var(--play-gold-ink)]',
  icon: 'size-5',
  avatarButton:
    'group relative mx-1 -my-6 rounded-full transition-transform hover:-translate-y-0.5',
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
  // Own game, a row of the sessions list
  resume: 'flex items-center gap-3 py-3 first:pt-0 last:pb-0',
  resumeLogo: 'size-12 shrink-0',
  resumeText: 'min-w-0 flex-1 text-sm font-extrabold text-[var(--play-ink)]',
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
  head: 'flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-between md:gap-4',
  center: 'my-auto',
  logo: 'size-28 sm:size-32 md:ml-12 xl:ml-8',
  game: NOTE,
  watch: 'flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--play-chip)] px-4 py-2',
  watchLabel: 'text-xs font-extrabold tracking-wider text-[var(--play-ink)] uppercase',
  watchFaces: 'flex items-center gap-1.5',
  watchAway: 'opacity-40 grayscale',
  lost: 'fixed top-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--play-panel-strong)] px-4 py-1.5 text-xs font-bold text-[var(--play-ink-soft)] shadow-lg',
  back: 'inline-flex shrink-0 items-center gap-1.5 text-xs font-extrabold tracking-wider text-[var(--play-ink-soft)] uppercase hover:text-[var(--play-ink)]',
  // Players and gestures, centred
  middle: 'mx-auto flex w-full max-w-2xl flex-col items-center gap-6',
  // Line under the title: access, count, rules
  summary:
    'grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm font-bold text-[var(--play-ink-soft)]',
  summaryCount: 'text-center',
  summaryLink:
    'justify-self-start rounded-xl bg-[var(--play-chip)] px-3 py-1.5 font-extrabold text-[var(--play-ink)] transition-colors hover:bg-[var(--play-panel-strong)] focus-visible:outline-3 focus-visible:outline-[var(--play-key)] disabled:cursor-default disabled:hover:bg-[var(--play-chip)]',
  summaryEnd: 'justify-self-end',
  // The table: seats as faces, empty ones as dashed rounds
  table: 'flex w-full flex-wrap justify-center gap-x-3 gap-y-4 py-2 md:gap-x-5 md:gap-y-6',
  tile: 'flex w-20 flex-col items-center gap-1 text-center md:w-24 md:gap-1.5',
  tileOff: 'opacity-50',
  tileName: 'w-full truncate text-xs font-extrabold md:text-sm',
  tileNote:
    'text-[0.6rem] font-extrabold tracking-wider md:text-xs text-[var(--play-ink-faint)] uppercase',
  tileReady:
    'inline-flex items-center gap-1 text-[0.6rem] md:text-xs font-extrabold text-[var(--play-ink)]',
  tileEmpty:
    'grid size-10 place-items-center rounded-full border-2 border-dashed md:size-16 border-[var(--play-line)] text-[var(--play-ink-soft)] transition-colors hover:border-[var(--play-ink-faint)] hover:text-[var(--play-ink)]',
  tileEmptyIcon: 'size-4 md:size-6',
  // Share row, always in reach
  link: 'flex w-full max-w-sm items-center gap-3 rounded-2xl bg-[var(--play-chip)] px-4 py-3 text-left text-sm font-bold text-[var(--play-ink-soft)] hover:text-[var(--play-ink)]',
  linkMain: 'mr-auto truncate',
  linkCode: 'text-lg font-extrabold tracking-[0.5em] text-[var(--play-ink)]',
  linkCopy: 'shrink-0 text-xs font-extrabold text-[var(--play-ink)]',
  playersTitle: `${HEADING} text-center`,
  box: `${PANEL} ${LIFT} flex w-full flex-col items-center gap-5 rounded-[2rem] p-5 sm:p-8`,
  // Plain column, flows under the players
  actions: 'flex w-full max-w-sm flex-col gap-3',
  // Quiet way out, under the main key
  exit: 'mx-auto text-sm font-bold text-[var(--play-ink-soft)] underline-offset-4 transition-colors hover:text-[var(--play-ink)] hover:underline disabled:opacity-50',
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
  // Feed, Chat, Tout as one segmented key
  tabs: 'flex flex-1 items-center gap-1 rounded-xl bg-[var(--play-chip)] p-1',
  tab: 'flex-1 rounded-lg px-2 py-1.5 text-xs font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase transition-colors hover:text-[var(--play-ink)]',
  tabOn: 'bg-[var(--play-panel-strong)] text-[var(--play-ink)] shadow-[var(--shadow-sm)]',
  // Who is there, one compact row
  people: 'flex items-center gap-3 border-b border-[var(--play-line)] px-4 py-2.5',
  peopleGroup: 'flex min-w-0 items-center gap-2',
  peopleLabel:
    'text-[0.65rem] font-extrabold tracking-widest text-[var(--play-ink-faint)] uppercase',
  peopleStack: 'flex min-w-0 items-center -space-x-2',
  peopleFace: 'rounded-full ring-2 ring-[var(--play-ring)]',
  peopleAway: 'opacity-40 grayscale',
  peopleSplit: 'h-5 w-px shrink-0 bg-[var(--play-line)]',
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
  composer: 'relative flex items-end gap-2 border-t border-[var(--play-line)] p-3',
  invite:
    'grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--play-chip)] text-[var(--play-ink-soft)] transition-colors hover:bg-[var(--play-key)] hover:text-[var(--play-key-ink)]',
  inviteOn: 'bg-[var(--play-key)] text-[var(--play-key-ink)]',
  inviteIcon: 'size-5',
  input:
    'block max-h-32 min-h-11 w-full resize-none rounded-xl bg-[var(--play-chip)] px-3 py-2.5 text-sm text-[var(--play-ink)] placeholder:text-[var(--play-ink-faint)] focus:outline-none',
} as const

/**
 * Invitation picker, everyone or chosen people
 * @type {Record<string, string>}
 */

export const PLAY_INVITE = {
  anchor: 'relative',
  panel: `${SOLID} absolute top-full left-0 z-30 mt-3 flex w-96 flex-col gap-3 p-3 text-[var(--play-ink)] max-md:fixed max-md:inset-auto max-md:top-1/2 max-md:left-1/2 max-md:z-[80] max-md:mt-0 max-md:w-[calc(100vw-2rem)] max-md:max-w-md max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:max-h-[85dvh] max-md:overflow-y-auto`,
  // Phone: a centred modal, so side anchors do nothing
  panelEnd: 'right-0 left-auto',
  panelCentered: 'left-1/2 right-auto -translate-x-1/2',
  // Dim page behind the phone modal
  scrim: 'fixed inset-0 z-[79] bg-[var(--color-scrim)]/40 md:hidden',
  // Over the composer, as wide as it so the chat never clips it
  panelDock: `${SOLID} absolute inset-x-3 bottom-full z-30 mb-2 flex flex-col gap-3 p-3 text-[var(--play-ink)]`,
  // Opens in the seats grid, never clipped
  anchorInline: 'contents',
  // Full screen sheet on a phone
  panelInline: `${SOLID} relative col-span-full mx-auto mt-2 flex w-full max-w-md flex-col gap-3 p-3 text-[var(--play-ink)] max-md:fixed max-md:inset-auto max-md:top-1/2 max-md:left-1/2 max-md:z-[80] max-md:mt-0 max-md:w-[calc(100vw-2rem)] max-md:max-w-md max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:max-h-[85dvh] max-md:overflow-y-auto`,
  // Tip aimed at the trigger above
  arrow:
    'absolute -top-1.5 left-[var(--arrow-x,50%)] size-3 max-md:hidden -translate-x-1/2 rotate-45 bg-[var(--play-panel-strong)] ring-1 ring-[var(--play-line)] [clip-path:polygon(0_0,100%_0,0_100%)]',
  // Quiet row under the list, label left and state right
  choice:
    'flex w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-1.5 text-left text-xs font-extrabold md:py-2 md:text-sm text-[var(--play-ink-soft)] hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)] disabled:opacity-50',
  choiceIcon: 'size-5 shrink-0',
  choiceText: 'mr-auto whitespace-nowrap',
  level:
    'rounded-lg bg-[var(--play-chip)] px-2.5 py-1 text-xs font-extrabold text-[var(--play-ink)] hover:bg-[var(--play-line)] disabled:opacity-50',
  foot: 'flex flex-col gap-1',
  footGroup: 'flex flex-col border-t border-[var(--play-line)] pt-1',
  search:
    'min-w-0 flex-1 rounded-xl bg-[var(--play-chip)] px-3 py-2 text-sm font-semibold md:py-2.5 placeholder:text-[var(--play-ink-faint)] focus:outline-none',
  head: 'flex items-center gap-2',
  close:
    'grid size-8 place-items-center rounded-lg text-[var(--play-ink-soft)] hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  // Only a phone sheet needs a way out, elsewhere a tap outside closes
  closeMobile: 'md:hidden',
  closeIcon: 'size-4',
  section: 'flex flex-col',
  sectionTitle:
    'px-2 pt-2 pb-1 text-[0.65rem] font-extrabold tracking-widest text-[var(--play-ink-faint)] uppercase',
  people: 'flex max-h-60 flex-col overflow-y-auto max-md:max-h-none max-md:flex-1',
  // Faces side by side, name under each
  faces: 'grid grid-cols-5 gap-x-1.5 gap-y-2 px-1 pb-1.5 md:gap-x-2 md:gap-y-3 md:pb-2',
  face: 'flex min-w-0 flex-col items-center gap-1 rounded-xl p-1.5 transition-colors hover:bg-[var(--play-chip)]',
  faceSent: 'cursor-default opacity-70 hover:bg-transparent',
  faceAvatar: 'relative',
  faceBadge:
    'absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-[var(--play-ink)] text-[var(--play-panel-strong)] ring-2 ring-[var(--play-panel-strong)]',
  faceName: 'w-full truncate text-center text-[0.65rem] font-bold md:text-xs',
  stateIcon: 'size-2.5',
  check: 'ml-auto size-4 text-[var(--play-ink)]',
  empty: 'px-2 py-2 text-sm italic text-[var(--play-ink-faint)]',
  codeInline: 'text-base font-extrabold tracking-[0.3em] text-[var(--play-ink)]',
  // Join with a code from the hub
  entry: 'flex w-full flex-col gap-2',
  entryInput:
    'w-full rounded-xl bg-[var(--play-chip)] px-3 py-3 text-center text-base font-extrabold tracking-[0.3em] text-[var(--play-ink)] uppercase placeholder:text-[var(--play-ink-faint)] placeholder:tracking-normal placeholder:normal-case focus:outline-none',
} as const

/**
 * Baccalaureat board, phase by phase
 * @type {Record<string, string>}
 */

export const BAC_BOARD = {
  // Phase on screen, rising in
  board: 'play-phase flex flex-col gap-5',
  // Header: round, letter, clock
  bar: 'grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-3xl bg-[var(--play-chip)] p-3 sm:p-4',
  roundBlock: 'flex min-w-0 flex-col gap-1.5',
  roundLabel:
    'text-[0.7rem] font-extrabold tracking-[0.25em] text-[var(--play-ink-faint)] uppercase',
  roundFigure:
    'flex items-baseline gap-1.5 text-5xl leading-none font-black tabular-nums text-[var(--play-ink)] sm:text-6xl',
  roundTotal: 'text-lg font-extrabold text-[var(--play-ink-faint)]',
  pips: 'flex flex-wrap gap-1',
  pip: 'h-1.5 w-3 rounded-full bg-[var(--play-line)]',
  pipDone: 'bg-[var(--play-baccalaureat)] opacity-50',
  pipNow: 'bg-[var(--play-baccalaureat)]',
  // Letter tile, bright blue
  letter:
    'play-tick grid size-24 place-items-center rounded-3xl bg-gradient-to-b from-[var(--play-baccalaureat-glow)] to-[var(--play-baccalaureat)] text-7xl leading-none font-black text-white shadow-[0_0.4rem_0_var(--play-baccalaureat-deep)] [text-shadow:0_2px_0_rgb(0_0_0/0.18)] sm:size-28 sm:text-8xl',
  letterHidden:
    'from-[var(--play-panel-strong)] to-[var(--play-chip)] text-[var(--play-ink-faint)]',
  // Clock ring, the number inside
  clockSlot: 'flex items-center justify-end',
  clock: 'relative grid size-20 place-items-center sm:size-24',
  clockSvg: 'absolute inset-0 size-full -rotate-90',
  clockTrack: 'stroke-[var(--play-line)]',
  clockBar:
    'stroke-[var(--play-baccalaureat)] transition-[stroke-dashoffset] duration-1000 ease-linear',
  clockBarLow: 'stroke-[var(--color-danger)]',
  clockNumber: 'relative text-3xl font-black tabular-nums text-[var(--play-ink)] sm:text-4xl',
  clockLow: 'text-[var(--color-danger)]',
  // Countdown in place of the board, no veil behind
  inline: 'grid min-h-[50vh] place-items-center',
  // Spectator waiting for the words
  wait: 'grid min-h-[40vh] place-content-center justify-items-center gap-2 text-center',
  waitLead: 'text-xl font-extrabold text-[var(--play-ink)]',
  waitNote: 'text-sm font-semibold text-[var(--play-ink-soft)]',
  // Countdown over the whole screen, chat and keys included, the veil fading in
  overlay: 'play-count fixed inset-0 z-[60] grid place-items-center',
  stage: 'relative flex flex-col items-center justify-center gap-6 text-center',
  // Glow ring pulsing behind each number
  halo: 'play-halo pointer-events-none absolute top-1/2 left-1/2 size-[min(70vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-full',
  stageLead:
    'relative rounded-full bg-[rgb(0_0_0/0.35)] px-5 py-2 text-sm font-extrabold tracking-[0.3em] text-white uppercase',
  figure:
    'play-figure play-figure-blue text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
  // Someone called stop: their face, then the word, in place of the clock
  stop: 'flex items-center justify-end gap-2',
  stopWord:
    'play-stop text-3xl leading-none font-extrabold tracking-tight text-[var(--color-danger)] sm:text-5xl',
  // Writing form
  fields: 'grid gap-3 sm:grid-cols-2',
  field:
    'flex items-center gap-3 rounded-2xl bg-[var(--play-chip)] p-3 transition-shadow focus-within:shadow-[0_0_0_2px_var(--play-baccalaureat)]',
  fieldIndex:
    'grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--play-panel-strong)] text-sm font-black text-[var(--play-ink-faint)]',
  fieldDone: 'bg-[var(--play-baccalaureat)] text-white',
  fieldIcon: 'size-5',
  fieldBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  fieldLabel:
    'text-[0.7rem] leading-tight font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  input:
    'w-full bg-transparent text-lg font-extrabold text-[var(--play-ink)] placeholder:text-base placeholder:font-normal placeholder:text-[var(--play-ink-faint)] focus:outline-none',
  actions: 'flex flex-wrap items-center justify-center gap-3',
  // Line at the bottom, like the Bomb Party hint
  lead: 'text-center text-sm font-semibold text-[var(--play-ink-soft)]',
  leadStrong: 'text-[var(--play-ink)]',
  // Votes and scored words, one card per word
  categories: 'flex flex-col gap-5',
  category: 'flex flex-col gap-2',
  categoryName: 'text-xs font-extrabold tracking-wide text-[var(--play-ink-soft)] uppercase',
  answers: 'grid gap-2 sm:grid-cols-2',
  card: 'flex items-center gap-3 rounded-2xl bg-[var(--play-chip)] p-2.5',
  cardFace: 'flex shrink-0 flex-col items-center gap-1',
  cardBody: 'flex min-w-0 flex-1 flex-col',
  cardName: 'truncate text-[0.7rem] font-bold text-[var(--play-ink-faint)]',
  cardWord: 'truncate text-base font-extrabold text-[var(--play-ink)]',
  cardWordOff: 'line-through opacity-50',
  cardEmpty: 'text-sm italic text-[var(--play-ink-faint)]',
  cardTag: 'truncate text-[0.7rem] font-bold text-[var(--play-ink-soft)]',
  // Who voted for or against
  voters: 'mt-1 flex flex-wrap items-center gap-y-1',
  voterGroup:
    'flex items-center gap-1 not-first:ml-2 not-first:border-l not-first:border-[var(--play-ink)]/20 not-first:pl-2',
  voterMark: 'grid size-4 place-items-center rounded-full',
  voterIcon: 'size-2.5',
  // Check or cross under the avatar
  verdict: 'grid size-6 place-items-center rounded-full',
  verdictYes: 'bg-[var(--color-success)] text-white',
  verdictNo: 'bg-[var(--color-danger)] text-white',
  verdictNone: 'bg-[var(--play-panel-strong)] text-[var(--play-ink-faint)]',
  verdictIcon: 'size-3.5',
  // Ballot buttons, then the locked vote
  ballots: 'flex shrink-0 items-center gap-1.5',
  ballot:
    'grid size-9 place-items-center rounded-full bg-[var(--play-panel-strong)] text-[var(--play-ink-soft)] transition-transform hover:scale-110 disabled:opacity-50',
  ballotYes: 'hover:bg-[var(--color-success)] hover:text-white',
  ballotNo: 'hover:bg-[var(--color-danger)] hover:text-white',
  ballotLocked: 'grid size-9 place-items-center rounded-full opacity-90',
  ballotIcon: 'size-5',
  points:
    'shrink-0 rounded-full bg-[var(--play-baccalaureat)] px-2.5 py-1 text-sm font-black tabular-nums text-white',
  pointsNone: 'bg-[var(--play-panel-strong)] text-[var(--play-ink-faint)]',
  // Scores, a reward moment
  scores: 'flex flex-col gap-4',
  hero: 'flex flex-col items-center gap-2 py-2 text-center',
  heroFace: 'play-pop relative',
  heroCrown: 'absolute -top-6 left-1/2 size-7 -translate-x-1/2 text-[var(--play-gold-ink)]',
  heroTitle: 'text-xl font-black tracking-tight text-[var(--play-ink)] sm:text-2xl',
  heroPoints: 'text-[var(--play-baccalaureat)]',
  scoreList: 'flex flex-col gap-2',
  scoreRow: 'play-score-row relative flex items-center gap-3 overflow-hidden rounded-2xl p-3',
  scoreRowPlain: 'bg-[var(--play-chip)]',
  // Filled boxes, gold then silver then bronze
  scoreRowMedals: [
    'bg-[var(--play-medal-gold)] [--play-ink:var(--play-medal-ink)] [--play-ink-faint:var(--play-medal-ink)]',
    'bg-[var(--play-medal-silver)] [--play-ink:var(--play-medal-ink)] [--play-ink-faint:var(--play-medal-ink)]',
    'bg-[var(--play-medal-bronze)] [--play-ink:var(--play-medal-ink)] [--play-ink-faint:var(--play-medal-ink)]',
  ],
  scoreBarMedal: 'bg-white/30',
  scoreBar: 'play-score-bar absolute inset-0 origin-left',
  scoreBarPlain: 'bg-[color-mix(in_srgb,var(--play-baccalaureat)_22%,transparent)]',
  scoreRank:
    'relative w-6 text-center text-sm font-black tabular-nums text-[var(--play-ink-faint)]',
  scoreName: 'relative min-w-0 flex-1 truncate text-sm font-extrabold text-[var(--play-ink)]',
  scoreGain:
    'play-pop relative rounded-full bg-[var(--play-baccalaureat)] px-2.5 py-1 text-sm font-black tabular-nums text-white',
  scoreSum: 'relative flex items-center gap-2.5',
  scoreDivider: 'h-7 w-0.5 rounded-full bg-[var(--play-ink)] opacity-30',
  scoreTotal: 'relative min-w-12 text-left text-2xl font-black tabular-nums text-[var(--play-ink)]',
  // Final ranking under the podium
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
    'grid size-7 place-items-center rounded-lg bg-[var(--play-chip)] text-xs font-extrabold transition-opacity duration-[var(--motion-duration-fast)]',
  letterFree: 'text-[var(--play-ink)]',
  // Used: struck through and faded
  letterUsed:
    'text-[var(--play-ink-faint)] line-through decoration-2 decoration-[var(--play-bomb)] opacity-45',
  // Clear of the dock at the bottom
  stage: 'flex min-w-0 flex-col items-center gap-4 pb-16 in-[.play-boxfull]:pb-0',
  // Square table, seats on an orbit
  table: 'play-bomb-table relative aspect-square w-full max-w-[min(34rem,60dvh)]',
  center: 'absolute top-1/2 left-1/2 w-[36%] -translate-x-1/2 -translate-y-1/2',
  bomb: 'play-bomb',
  bombBlast: 'play-bomb-blast',
  bombArt: 'block h-auto w-full',
  bombTremble: 'play-bomb-tremble',
  heatTint: 'play-bomb-heat',
  sparkGrow: 'play-bomb-spark-grow',
  shockwave: 'play-bomb-shockwave',
  debris: 'play-bomb-debris',
  prompt:
    'absolute top-[59%] left-[48%] -translate-x-1/2 -translate-y-1/2 text-[clamp(1.5rem,6cqi,3rem)] leading-none font-black tracking-wider text-[var(--play-on-art)] uppercase',
  spark: 'play-bomb-spark',
  arrow: 'play-bomb-arrow',
  seat: 'play-bomb-seat flex w-28 flex-col items-center gap-1 text-center transition-opacity duration-[var(--motion-duration-panel)]',
  seatTurn: 'play-bomb-seat-turn',
  seatOut: 'opacity-40 grayscale',
  seatBlast: 'play-bomb-shake play-bomb-hit',
  seatNote: NOTE,
  hearts: 'relative flex items-center gap-0.5',
  heartsMax: 'play-hearts-max',
  heartCell: 'relative grid',
  heartShine: 'play-heart-shine',
  heartGain: 'play-heart-gain',
  heartLose: 'play-heart-lose',
  heartBurst: 'play-heart-burst',
  heartTag: 'play-heart-tag',
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

// Idle chip of a difficulty, faded; picked one raised
const LEVEL_CHIP =
  'min-h-11 rounded-[var(--radius-md)] px-3.5 text-sm font-semibold tabular-nums transition-[opacity,box-shadow] duration-[var(--motion-duration-fast)]'

/**
 * Setup chip of a Bomb Party difficulty
 * @param {string} colour - Fill and ink classes
 * @param {string} raised - Shadow of the picked chip
 * @return {{ idle: string, on: string }} - Classes
 */

const levelChip = (colour: string, raised: string) => ({
  idle: `${LEVEL_CHIP} ${colour} opacity-55 hover:opacity-90`,
  on: `${LEVEL_CHIP} ${colour} opacity-100 ${raised}`,
})

/**
 * Colour of each Bomb Party difficulty button
 * @type {Record<string, { idle: string, on: string }>}
 */

export const BOMB_LEVEL_CHIPS = {
  beginner: levelChip(
    'bg-[var(--play-level-beginner)] text-[var(--play-level-light-ink)]',
    'shadow-[0_0.2rem_0_color-mix(in_srgb,var(--play-level-beginner)_55%,black)]'
  ),
  easy: levelChip(
    'bg-[var(--play-level-easy)] text-[var(--play-level-light-ink)]',
    'shadow-[0_0.2rem_0_color-mix(in_srgb,var(--play-level-easy)_55%,black)]'
  ),
  medium: levelChip(
    'bg-[var(--play-level-medium)] text-[var(--play-level-dark-ink)]',
    'shadow-[0_0.2rem_0_color-mix(in_srgb,var(--play-level-medium)_55%,black)]'
  ),
  hard: levelChip(
    'bg-[var(--play-level-hard)] text-[var(--play-level-dark-ink)]',
    'shadow-[0_0.2rem_0_color-mix(in_srgb,var(--play-level-hard)_55%,black)]'
  ),
  extreme: levelChip(
    'bg-[var(--play-level-extreme)] text-[var(--play-level-light-ink)]',
    'shadow-[0_0.2rem_0_color-mix(in_srgb,var(--play-level-extreme)_55%,black)]'
  ),
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
 * End of a game: replay, new game and hub under the result
 * @type {Record<string, string>}
 */

export const PLAY_END = {
  bar: 'flex flex-wrap items-center justify-center gap-2 px-4 pb-4',
  count: 'w-full text-center text-sm font-semibold text-[var(--play-ink-soft,inherit)] opacity-80',
  action: 'gap-2 px-4! py-2.5! text-sm!',
} as const

/**
 * Session page of a running game: the table, and a column flush right holding crowd, chat and feed
 * @type {Record<string, string>}
 */

export const BAC_SESSION = {
  page: 'relative w-full pb-6 transition-[padding] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  pageOpen: 'lg:pr-[calc(var(--play-side-open)+1.5rem)]',
  pageFolded: 'lg:pr-[calc(var(--play-side-folded)+1.5rem)]',
  // Table alone on the screen, the side column slides over it from the right
  pageFull: 'play-room fixed inset-0 z-50 overflow-hidden p-0!',
  main: 'flex min-w-0 flex-col gap-4',
  mainFull: 'h-full gap-0',
  // Empty marker carrying the game ground into the full screen room
  groundMark: 'hidden',
  // Chat open beside the table, never over it on wide screens
  mainBeside:
    'transition-[padding] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] lg:pr-[min(var(--play-side-open),100vw)] motion-reduce:transition-none',
  // Way out on the left, game identity on the right
  top: 'flex items-center justify-between gap-3',
  exits: 'flex flex-wrap items-center gap-2',
  exit: 'gap-2 px-3.5! py-2! text-sm!',
  exitIcon: 'size-4',
  identity: 'flex items-center gap-3',
  titles: 'flex min-w-0 flex-col items-end',
  title: 'truncate text-lg font-extrabold tracking-tight text-[var(--play-ink)]',
  logo: 'size-14',
  // Full screen table scrolls when taller than the screen
  boxFull: 'play-boxfull flex min-h-0 flex-1 flex-col overflow-y-auto',
  // Same panel as the page so the ink stays readable, content centred as one group, dock margin dropped
  boxFullPad: `${PANEL} ${LIFT} m-4 gap-5 p-5 sm:m-6 sm:p-6 *:first:mt-auto *:last:mb-auto *:pb-0!`,
  // Stage keys: in the top bar, then floating over the table, shifted by the open chat
  keys: 'flex items-center gap-2',
  keysFull:
    'fixed top-8 right-8 z-50 sm:top-10 sm:right-10 transition-[right] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  // Inside the table's top corner, left of the open chat
  keysShifted:
    'right-[calc(min(var(--play-side-open),100vw)+2rem)] sm:right-[calc(min(var(--play-side-open),100vw)+2.5rem)]',
  keysIcon: 'size-5',
  keyButton: 'px-3! py-2!',
  // Sound card hanging under the sound key
  keyHolder: 'relative',
  volumeCard:
    'absolute top-full right-0 z-10 mt-2 flex w-64 max-w-[calc(100vw-1.5rem)] flex-col gap-1 rounded-[var(--radius-md)] bg-[var(--play-panel,var(--color-surface))] p-3 shadow-lg ring-1 ring-[var(--play-line,var(--color-border))]',
  box: `${PANEL} ${LIFT} flex flex-col gap-5 p-5 sm:p-6`,
  // Column flush against the right edge, under the shell bar
  side: 'mt-4 flex min-w-0 flex-col gap-3 lg:fixed lg:top-[var(--play-bar-h)] lg:right-0 lg:bottom-0 lg:z-40 lg:mt-0 lg:pb-28',
  sideOpen: 'lg:w-[var(--play-side-open)]',
  // Level with the table, its height and no dock room
  sideSpan: 'lg:pb-0!',
  sideFolded: 'lg:w-[var(--play-side-folded)]',
  // Full screen: flush right over the table, slides in and out
  sideFull:
    'fixed right-0 z-40 mt-0 w-[min(var(--play-side-open),100vw)]! transition-transform duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  // Same top and foot as the padded table
  sideFullPad: 'top-4! bottom-4! pb-0! sm:top-6! sm:bottom-6!',
  // Golf course edge to edge, the column too
  sideFullBleed: 'top-0! bottom-0! pb-6!',
  sideShown: 'translate-x-0',
  sideHidden: 'pointer-events-none translate-x-full',
  // Crowd window: players, then spectators when there are some
  crowd: `${PANEL} ${LIFT} flex shrink-0 flex-col gap-3 p-4 lg:rounded-r-none`,
  group: 'flex min-w-0 flex-col gap-2',
  groupTitle: 'text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  stack: 'flex flex-wrap items-center -space-x-2.5',
  stacked: 'rounded-full ring-2 ring-[var(--play-ring)]',
  faceAway: 'opacity-40 grayscale',
  empty: 'text-sm italic text-[var(--play-ink-faint)]',
  fold: 'inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--play-ink-soft)] hover:bg-[var(--play-chip)] hover:text-[var(--play-ink)]',
  foldIcon: 'size-5',
  // Avatars in a row, done or still writing
  progress: 'flex flex-wrap items-center justify-center gap-5',
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
  REQUESTED: 'text-[var(--play-golf-glow)]',
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
  CAPTURE: 'text-[var(--play-heart)]',
  EXIT: 'text-[var(--play-blue-ink)]',
  HOME: 'text-[var(--play-gold-ink)]',
  SKIP: 'text-[var(--play-blue-ink)]',
  PENALTY: 'text-[var(--play-heart)]',
  FINISH: 'text-[var(--play-gold-ink)]',
}

/**
 * Volume slider of a game or of the settings
 * @type {Record<string, string>}
 */

export const PLAY_VOLUME_UI = {
  row: 'flex items-center gap-3',
  mute: 'shrink-0 text-[var(--play-ink,var(--color-ink))]',
  icon: 'size-5',
  slider: 'min-w-0 flex-1 cursor-pointer accent-[var(--play-accent,var(--color-ink-accent))]',
  follow:
    'self-start px-1 text-xs font-bold text-[var(--play-ink-soft,var(--color-ink-subtle))] underline underline-offset-2',
  followed: 'px-1 text-xs text-[var(--play-ink-soft,var(--color-ink-subtle))]',
}

/**
 * Extra sections of a player sheet: top games, records, presence
 * @type {Record<string, string>}
 */

export const PLAY_PROFILE = {
  list: 'flex flex-col gap-2',
  row: `${PANEL} flex items-center gap-3 p-3`,
  logo: 'size-10 shrink-0',
  rowText: 'flex min-w-0 flex-1 flex-col',
  rowName: 'truncate text-sm font-extrabold',
  rowNote: NOTE,
  records: 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3',
  record: `${PANEL} flex flex-col gap-1 p-4`,
  recordValue: 'text-2xl font-extrabold tabular-nums tracking-tight',
  recordLabel: 'text-xs font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  empty: 'text-sm italic text-[var(--play-ink-soft)]',
  // Presence line and the gestures under the hero
  presence: 'flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--play-ink-soft)]',
  presenceOn: 'text-[var(--play-ink)]',
  dot: 'size-2 rounded-full bg-[var(--play-ink-faint)]',
  dotOn: 'bg-[var(--play-gold)]',
  actions: 'flex flex-wrap gap-2',
  key: 'key inline-flex items-center px-5 py-3 text-base font-bold',
  keyGhost: 'key key-slate inline-flex items-center px-5 py-3 text-base font-bold',
  more: 'w-fit text-sm font-extrabold text-[var(--play-accent)] underline-offset-4 hover:underline',
} as const

/**
 * Group tab: name, members, invitations, proposed games
 * @type {Record<string, string>}
 */

export const PLAY_GROUP = {
  // Name edited in place, same box as the title
  name: 'w-full min-w-0 truncate rounded-lg bg-transparent px-1 text-left text-xl font-extrabold tracking-tight text-[var(--play-ink)] sm:text-2xl',
  nameInput:
    'w-full min-w-0 rounded-lg bg-[var(--play-chip)] px-1 text-xl font-extrabold tracking-tight text-[var(--play-ink)] outline-none sm:text-2xl',
  section: 'flex flex-col gap-3',
  heading: 'text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  list: 'flex flex-col gap-2',
  gameList: 'grid grid-cols-2 gap-3 xl:grid-cols-3',
  memberList: 'grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3',
  hint: 'text-sm text-[var(--play-ink-soft)]',
  // Banner box, the title sits bottom left
  gameBox:
    'group relative block aspect-[16/6] w-full lg:aspect-[16/9] overflow-hidden rounded-2xl text-left transition-transform duration-150 enabled:active:scale-[0.98] disabled:cursor-default',
  // Banner inside a chat line
  chatGame:
    'relative mt-1 block aspect-[16/8] w-64 max-w-full overflow-hidden rounded-xl transition-transform duration-150 active:scale-[0.98]',
  gameArt: 'absolute inset-0 size-full object-cover',
  gameShade: 'absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent',
  gameTitle:
    'absolute bottom-2.5 left-3.5 max-w-[55%] truncate text-base font-black text-white sm:text-lg lg:text-xl drop-shadow-[0_0.1rem_0.3rem_rgb(0_0_0/0.5)]',
  // Pill on a banner, tells the host it opens a table
  gamePlay:
    'absolute right-2.5 bottom-2.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black whitespace-nowrap text-black',
  row: 'flex min-h-[4.5rem] items-center gap-3 rounded-xl bg-[var(--play-chip)] p-3',
  rowText: 'flex min-w-0 flex-1 flex-col',
  rowName: 'truncate text-base font-extrabold',
  rowNote: NOTE,
  rowOnline: 'size-2.5 shrink-0 rounded-full bg-[var(--play-gold)]',
  rowOffline: 'size-2.5 shrink-0 rounded-full bg-[var(--play-ink-faint)]',
  actions: 'flex shrink-0 flex-wrap items-center gap-2',
  link: 'text-xs font-extrabold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)] disabled:opacity-50',
  logo: 'size-10 shrink-0',
  faces: 'flex -space-x-2',
  search:
    'min-h-11 w-full rounded-xl bg-[var(--play-chip)] px-3 text-sm text-[var(--play-ink)] outline-none placeholder:text-[var(--play-ink-faint)]',
  pick: 'flex max-h-72 flex-col gap-1 overflow-y-auto',
  pickRow:
    'flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm font-bold transition-colors hover:bg-[var(--play-chip)]',
  pickRowOn: 'bg-[var(--play-chip)] ring-1 ring-[var(--play-key)]',
  footer: 'flex flex-wrap gap-2 pt-2',
} as const

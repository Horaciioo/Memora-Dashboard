import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'
import { BOTTOM_SHEET } from '@/declarations/ui/variants/surfaces'
import {
  HEADING,
  LIFT,
  NOTE,
  PANEL,
  PLAY_GOLD_TILE,
} from '@/declarations/ui/variants/games/play/shared'

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
  // Page and sidebar side by side
  body: 'relative z-10 flex min-h-0 w-full flex-1',
  // Room left to the sidebar
  withAside: 'flex min-h-full flex-col md:pr-[21.5rem] xl:pr-[23.5rem]',
  // Pages scroll here, the room itself never does
  content:
    'relative z-10 flex min-h-0 min-w-0 flex-1 flex-col gap-8 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pt-8 pb-36 sm:px-8 xl:px-12',
} as const

/**
 * Painted backdrop of the room, plate plus drifting mist
 * @type {Readonly<Record<string, string>>}
 */

export const PLAY_SCENE_BANNER = {
  root: 'play-scene-banner pointer-events-none fixed inset-0 z-0 overflow-hidden',
  plate: 'play-scene-plate',
  art: 'absolute inset-0 size-full',
  mists: 'play-scene-mists',
  mist: 'play-scene-mist',
  mistFar: 'play-scene-mist-far',
  mistNear: 'play-scene-mist-near',
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
  // Same title as the Dashboard navigation sheet
  title: `${BOTTOM_SHEET.figureTitle} w-full text-center text-[var(--color-on-media)]`,
  headRow: 'flex flex-wrap items-end justify-between gap-3',
  callout: `${PANEL} flex flex-wrap items-center justify-between gap-3 bg-[var(--play-panel-strong)] px-5 py-4 text-sm font-semibold text-[var(--play-ink)]`,
  // Game cards
  games: 'grid gap-5 sm:grid-cols-2 2xl:grid-cols-4',
  main: 'flex min-w-0 flex-col gap-10',
  // Phone: a wide row, art right, name left
  // Trading card from md: game-coloured frame, inner keyline, plate under the art
  card: `play-card relative flex aspect-[3/4] min-h-96 flex-col justify-end overflow-hidden rounded-[2rem] text-[var(--play-on-art)] ${LIFT} ring-2 ring-white/20 transition-transform duration-200 active:scale-[0.98] max-md:aspect-[5/2] max-md:min-h-28 max-md:justify-center max-md:rounded-3xl md:rounded-3xl md:ring-[0.4rem] md:ring-[var(--game)] md:hover:-translate-y-2 md:hover:-rotate-1 md:after:pointer-events-none md:after:absolute md:after:inset-2 md:after:rounded-[1.1rem] md:after:border md:after:border-white/40 md:after:content-['']`,
  cardShade:
    'absolute inset-0 bg-linear-to-t from-[var(--play-night)] from-5% via-[var(--play-night)]/55 via-35% to-transparent to-65% max-md:bg-linear-to-r max-md:via-45% max-md:to-80%',
  cardLink:
    'absolute inset-0 z-10 rounded-[2rem] max-md:rounded-3xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-key)]',
  cardBody:
    'relative flex flex-col items-center gap-2 p-7 text-center max-md:w-3/5 max-md:items-start max-md:gap-1 max-md:p-5 max-md:text-left md:mx-4 md:mb-4 md:gap-1 md:rounded-2xl md:bg-[var(--play-night)]/80 md:p-3',
  cardName:
    'truncate text-3xl font-extrabold tracking-tight uppercase max-md:max-w-full max-md:text-xl max-md:whitespace-normal md:text-xl',
  // Seat count, the card's one figure
  cardSeats: 'text-xs font-extrabold tabular-nums text-[var(--game)] max-md:hidden',
  skeleton:
    'min-h-64 animate-pulse rounded-[1.75rem] bg-[var(--play-panel-strong)] motion-reduce:animate-none',
  // Game hub, centred and fitted to the room: logo | divider | actions, never scrolling
  page: 'play-game-hub relative flex min-h-0 flex-1 flex-col',
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
  // Painted set under the floaters
  scenery: 'absolute inset-0 size-full',
  ember: 'play-ember',
  // Scribbles rising like bubbles
  croquisFloat: 'play-croquis-float',
  // Chalk letters rising like bubbles
  suspensFloat: 'play-suspens-float',
  // Symbols rising like bubbles
  echoFloat: 'play-echo-float',
  // Shapes and figures rising like bubbles
  glitchFloat: 'play-glitch-float',
  // Letters rising like bubbles
  jumbleFloat: 'play-jumble-float',
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
  trophies: 'grid grid-cols-1 gap-3 @md:grid-cols-2 @3xl:grid-cols-3',
  trophiesBox: '@container',
  trophy: `${PANEL} flex items-center gap-4 p-4`,
  trophyOn:
    'bg-[color-mix(in_srgb,var(--play-gold)_16%,var(--play-panel))] ring-[var(--play-gold)]/60',
  trophyIcon:
    'grid size-14 shrink-0 place-items-center rounded-full bg-[var(--play-chip)] text-[var(--play-ink-faint)]',
  trophyIconOn: PLAY_GOLD_TILE,
  trophyIdle: 'opacity-55',
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
  key: 'play-key inline-flex items-center px-5 py-3 text-base font-bold',
  keyGhost: 'play-key play-key-ghost inline-flex items-center px-5 py-3 text-base font-bold',
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
  // Game picker grid
  gameRow: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
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
    'absolute bottom-7 left-3.5 max-w-[55%] truncate text-base font-bold text-white sm:text-lg drop-shadow-[0_0.1rem_0.3rem_rgb(0_0_0/0.5)]',
  gamePlayers:
    'absolute bottom-2.5 left-3.5 text-xs font-semibold text-white/90 drop-shadow-[0_0.1rem_0.3rem_rgb(0_0_0/0.5)]',
  // Pill on a banner, tells the host it opens a table
  gamePlay:
    'absolute right-2.5 bottom-2.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black whitespace-nowrap text-black',
  row: 'flex min-h-[4.5rem] items-center gap-3 rounded-xl bg-[var(--play-chip)] p-3',
  rowText: 'flex min-w-0 flex-1 flex-col',
  rowName: 'truncate text-base font-extrabold',
  rowNote: NOTE,
  rowOnline: 'size-2.5 shrink-0 rounded-full bg-[var(--play-gold)]',
  rowOffline: 'size-2.5 shrink-0 rounded-full bg-[var(--play-ink-faint)]',
  presence: 'flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[var(--play-ink-soft)]',
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

/**
 * Floating note above the bottom bar
 * @type {Record<string, string>}
 */

export const PLAY_NOTE = {
  note: 'play-glass fixed inset-x-4 bottom-28 z-50 mx-auto w-fit max-w-md rounded-2xl px-5 py-3 text-center text-sm font-semibold text-[var(--play-ink)] shadow-lg',
} as const

/**
 * Leave game question, a glass window over the room
 * @type {Record<string, string>}
 */

export const PLAY_LEAVE_UI = {
  window: 'max-w-sm items-center gap-5 p-6 text-center',
  title: 'text-xl font-extrabold tracking-tight text-[var(--play-ink)]',
  text: 'text-sm text-[var(--play-ink-soft)]',
  keys: 'flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center',
  key: 'justify-center',
} as const

/**
 * Trophy change window, banner on top and three figures
 * @type {Record<string, string>}
 */

export const PLAY_TROPHY_UI = {
  window: 'max-w-md gap-0 rounded-3xl p-0',
  banner: 'relative h-36 shrink-0 overflow-hidden',
  art: 'absolute inset-0 size-full object-cover',
  shade: 'absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,var(--play-glass-solid))]',
  medal: `${PLAY_GOLD_TILE} absolute bottom-0 left-1/2 grid size-20 -translate-x-1/2 translate-y-1/2 place-items-center rounded-full`,
  medalIcon: 'size-10',
  body: 'flex flex-col items-center gap-5 px-6 pt-14 pb-6 text-center',
  title: 'text-2xl font-extrabold tracking-tight text-[var(--play-ink)]',
  text: 'max-w-xs text-sm text-[var(--play-ink-soft)]',
  figures: 'grid w-full grid-cols-3 gap-2',
  figure:
    'play-rise-item flex flex-col items-center gap-0.5 rounded-2xl bg-[var(--play-chip)] px-2 py-3',
  value: 'text-2xl font-extrabold tabular-nums text-[var(--play-ink)]',
  label: 'text-micro font-bold tracking-wide text-[var(--play-ink-soft)] uppercase',
  key: 'w-full justify-center',
} as const

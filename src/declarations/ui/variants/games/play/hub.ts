import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'
import { HEADING, NOTE, PANEL, PLAY_GOLD_TILE } from '@/declarations/ui/variants/games/play/shared'

/**
 * Play blocks of a moderator file
 * @type {Record<string, string>}
 */

export const PLAY_MEMBER = {
  stack: 'flex flex-col gap-6',
  // Global card then one card per game
  cards: 'flex flex-col gap-3 p-4',
  grid: 'grid gap-3 sm:grid-cols-2',
  card: 'flex w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_58%,transparent)] backdrop-blur-xl backdrop-saturate-150 p-4 text-left',
  hero: 'flex w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-sunken)_58%,transparent)] backdrop-blur-xl backdrop-saturate-150 p-5 text-left',
  off: 'opacity-60',
  clickable:
    'transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]',
  head: 'flex items-baseline justify-between gap-3',
  label: PROPERTY_LABEL,
  level: 'text-lg font-bold tabular-nums text-[var(--color-ink)]',
  heroLevel: 'text-3xl font-bold tabular-nums text-[var(--color-ink)]',
  xp: 'text-sm tabular-nums text-[var(--color-ink-subtle)]',
  // Level bar
  bar: 'flex flex-col gap-1',
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
} as const

/**
 * Memora Play room around the pages
 * @type {Record<string, string>}
 */

export const PLAY_REWARD = {
  layer: 'pointer-events-none fixed inset-0 z-60 grid place-items-center',
  xp: 'play-xp fixed bottom-40 left-1/2 text-[clamp(2.25rem,6dvh,3.5rem)] font-black tracking-tight text-[var(--play-ink)] tabular-nums [text-shadow:0_0.15rem_0_var(--play-drop)]',
} as const

export const PLAY_SHELL = {
  room: 'play-room fixed inset-0 z-40 flex flex-col overflow-hidden',
  floor: 'play-floor',
  // Page and friends side by side, each its own box on the ground
  body: 'relative z-10 flex min-h-0 w-full flex-1 md:gap-3 md:px-3 md:pb-3',
  // Hub page, the profile card floats at the bottom
  withAside: 'flex min-h-full flex-col',
  // Pages scroll here, the room itself never does; phone: top edge fades under the header
  content:
    'relative z-10 flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pt-5 pb-24 max-md:[mask-image:linear-gradient(to_bottom,transparent,black_1.5rem)] md:gap-8 md:pt-8 sm:px-8 md:rounded-2xl md:border md:border-[var(--play-line)] md:bg-play-shade md:pb-10 xl:px-12',
} as const

/**
 * Plain gradient backdrop of the room
 * @type {Readonly<Record<string, string>>}
 */

export const PLAY_SCENE_BANNER = {
  root: 'play-scene-banner pointer-events-none fixed inset-0 z-0 overflow-hidden',
  // Plain grey, lighter at the top
  art: 'absolute inset-0 bg-[linear-gradient(to_bottom,var(--play-haze),var(--play-night))]',
} as const

/**
 * Logos and banners of the games
 * @type {Record<string, string>}
 */

export const PLAY_BRAND = {
  logo: 'inline-flex shrink-0 items-center justify-center rounded-[28%] shadow-[0_0.3rem_0_var(--play-drop),inset_0_1px_0_var(--play-gloss)]',
  logoMark: 'size-[80%] [&_*]:animate-none!',
  // Tile-less logo, a light drop keeps it legible on any ground
  bare: 'inline-flex shrink-0 items-center justify-center',
  bareMark:
    'size-full overflow-visible drop-shadow-[0_0.15rem_0_var(--play-drop)] [&_*]:animate-none!',
  art: 'play-art absolute inset-0 size-full',
} as const

/**
 * Play pages
 * @type {Record<string, string>}
 */

export const PLAY_HUB = {
  callout: `${PANEL} flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-[var(--play-ink)]`,
  // Painted ground under the road
  embers: 'pointer-events-none fixed inset-0 z-0 overflow-hidden',
  scenery: 'absolute inset-0 size-full',
  // Map canvas stretched over the room, hard pixels between tiles
  worldMap: 'absolute inset-0 size-full object-cover [image-rendering:pixelated]',
  // Soft veil keeping the menu readable over the map
  worldVeil:
    'absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(13_16_51/0.55),rgb(13_16_51/0.15)_70%)]',
  // Game cards
  games: 'grid gap-5 sm:grid-cols-2 2xl:grid-cols-4',
  skeleton:
    'min-h-64 animate-pulse rounded-3xl bg-[var(--play-panel-strong)] motion-reduce:animate-none',
  // Game hub, centred and fitted to the room: logo | divider | actions, never scrolling
  page: 'play-game-hub relative flex min-h-0 flex-1 flex-col',
  hub: 'relative flex min-h-0 flex-1 items-center justify-center max-sm:overflow-y-auto',
  hubSplit: 'flex flex-col items-center gap-8 lg:flex-row lg:gap-14 xl:gap-20',
  hubLive: 'w-full max-w-md shrink-0 lg:max-h-[min(36rem,calc(100dvh-14rem))] lg:w-[26rem]',
  hubIdentity: 'flex flex-col items-center gap-4 text-center',
  hubLogoLarge: 'size-44 sm:size-72',
  srOnly: 'sr-only',
  hubDivider: 'h-px w-48 shrink-0 rounded-full bg-[var(--play-ink-faint)] lg:h-80 lg:w-px',
  hubMenu: 'flex w-full max-w-sm flex-col gap-6',
  // Buttons of one family, the families spaced apart
  hubGroup: 'flex flex-col gap-3',
  hubButton: 'w-full py-3.5! text-base!',
  // Secondary views, one row under the actions
  hubRow: 'grid grid-cols-3 gap-2',
  hubButtonSmall: 'w-full px-2! py-2.5! text-sm!',
  // Tip wrapper stretched to its button
  tipBlock: 'flex! w-full',
  // Window opened over the hub, its own scroll
  sheet: 'fixed inset-0 z-30 grid place-items-center p-2 sm:p-6',
  sheetScrim: 'absolute inset-0 bg-[var(--play-night)]/45 backdrop-blur-sm',
  sheetWindow: `${PANEL} play-rise relative flex max-h-full w-full max-w-2xl flex-col gap-1.5 overflow-hidden p-1.5 shadow-[var(--shadow-sm)]`,
  sheetHead: 'flex shrink-0 items-center justify-between gap-3 px-3.5 pt-2.5 pb-1',
  sheetTitle: 'text-xs font-bold tracking-wide text-[var(--play-ink-soft)] uppercase',
  // Content held in one nested group
  sheetGroup: 'flex flex-col gap-4 rounded-[var(--radius-lg)] bg-play-nest p-4 sm:p-5',
  sheetClose:
    'grid size-9 place-items-center rounded-full text-[var(--play-ink-soft)] transition-colors hover:bg-play-lift hover:text-[var(--play-ink)]',
  sheetCloseIcon: 'size-4',
  sheetBody: 'flex min-h-0 flex-col gap-1.5 overflow-y-auto',
  backIcon: 'size-3.5',
  // Full-screen banner drawn behind a game hub
  groundArt: 'pointer-events-none fixed inset-0 z-0 size-full',
  // Finish laid over the banner
  groundFinish: 'pointer-events-none fixed inset-0 z-0 overflow-hidden',
  groundLight: 'play-finish-light absolute inset-0',
  groundVignette: 'play-finish-vignette absolute inset-0',
  groundGrain: 'play-finish-grain absolute inset-0',
  // Light paper banner, flips the room ink to dark
  groundArtSheet: 'play-ground-sheet pointer-events-none fixed inset-0 z-0 size-full',
  // Écho rings under the pointer
  echoRipples: 'pointer-events-none fixed inset-0 z-0 overflow-hidden',
  echoRipple: 'echo-ripple',
} as const

/**
 * Play progression board
 * @type {Record<string, string>}
 */

export const PLAY_STATS = {
  playerFrame: '@container',
  section: 'flex flex-col gap-3',
  heading: HEADING,
  bar: 'block h-4 w-full overflow-hidden rounded-full bg-[var(--play-track)]',
  barThin: 'block h-2 w-full overflow-hidden rounded-full bg-[var(--play-track)]',
  barFill: 'block h-full rounded-full bg-[var(--play-gold)]',
  games: 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4',
  // Card topped by a band in its game colour
  game: 'play-raised flex flex-col overflow-hidden',
  gameBand:
    'flex h-24 items-center justify-center bg-[linear-gradient(135deg,var(--game),color-mix(in_srgb,var(--game)_60%,black))]',
  gameLogo: 'size-16 drop-shadow-[0_4px_0_var(--play-drop)]',
  gameText: 'flex min-w-0 flex-1 flex-col gap-2 p-4',
  gameHead: 'flex items-baseline justify-between gap-2',
  gameName: 'truncate text-lg font-bold',
  gameLevel: 'text-sm font-bold tabular-nums text-[var(--play-accent)]',
  glyph: 'size-6',
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
  row: 'flex items-center gap-3 rounded-[var(--radius-lg)] bg-play-nest p-3 transition-colors hover:bg-play-lift',
  logo: 'size-10 shrink-0',
  rowText: 'flex min-w-0 flex-1 flex-col',
  rowName: 'truncate text-sm font-bold',
  rowNote: NOTE,
  records: 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3',
  record: 'play-raised flex flex-col gap-1 p-4',
  recordValue: 'text-2xl font-bold tabular-nums tracking-tight',
  recordLabel: 'text-xs font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  // Presence line and the gestures under the hero, one nested group
  presenceBox:
    'flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] bg-play-nest px-5 py-4',
  presence: 'text-sm font-bold text-[var(--play-ink-soft)]',
  presenceOn: 'text-[var(--play-gold-ink)]',
  actions: 'flex flex-wrap gap-2',
  key: 'play-key inline-flex items-center px-5 py-3 text-base font-bold',
  keyGhost: 'play-key play-key-ghost inline-flex items-center px-5 py-3 text-base font-bold',
  more: 'w-fit text-sm font-bold text-[var(--play-accent)] underline-offset-4 hover:underline',
} as const

/**
 * Group tab: name, members, invitations, proposed games
 * @type {Record<string, string>}
 */

export const PLAY_GROUP = {
  // Name edited in place, same box as the title
  name: 'w-full min-w-0 truncate rounded-lg bg-transparent px-1 text-left text-xl font-bold tracking-tight text-[var(--play-ink)] sm:text-2xl',
  nameInput:
    'w-full min-w-0 rounded-lg bg-[var(--play-chip)] px-1 text-xl font-bold tracking-tight text-[var(--play-ink)] outline-none sm:text-2xl',
  section: 'flex flex-col gap-3',
  heading: 'text-xs font-bold tracking-widest text-[var(--play-ink-soft)] uppercase',
  list: 'flex flex-col gap-2',
  gameArt: 'absolute inset-0 size-full object-cover',
  gameShade:
    'absolute inset-0 bg-gradient-to-t from-[var(--color-media-shade)]/40 via-transparent to-transparent',
  gameTitle:
    'absolute bottom-7 left-3.5 max-w-[55%] truncate text-base font-bold text-[var(--play-on-art)] sm:text-lg drop-shadow-[0_0.1rem_0.3rem_var(--play-drop)]',
  rowText: 'flex min-w-0 flex-1 flex-col',
  rowName: 'truncate text-base font-bold',
  rowNote: NOTE,
  rowOnline: 'size-2.5 shrink-0 rounded-full bg-[var(--play-gold)]',
  actions: 'flex shrink-0 flex-wrap items-center gap-2',
  faces: 'flex -space-x-2',
  // Folded group card, the whole card opens the room
  card: 'group play-end-rise flex w-full flex-col gap-5 rounded-3xl bg-play-nest p-5 text-left ring-1 ring-[var(--play-line)] transition duration-150 hover:-translate-y-0.5 hover:bg-play-lift hover:shadow-[var(--shadow-sm)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)] active:scale-[0.99]',
  cardHead: 'flex items-start gap-3',
  cardName: 'min-w-0 flex-1 truncate text-xl font-extrabold tracking-tight text-[var(--play-ink)]',
  cardOpen:
    'shrink-0 rounded-full bg-[var(--play-chip)] px-3 py-1 text-xs font-bold text-[var(--play-ink-soft)] transition-colors group-hover:bg-[var(--play-key)] group-hover:text-[var(--play-night)]',
  cardFoot: 'flex items-center justify-between gap-3',
  cardGrid: 'grid w-full grid-cols-1 gap-3 md:grid-cols-2',
  // Invitations waiting, lit in gold
  invites: 'flex flex-col gap-3 rounded-3xl bg-play-nest p-4 ring-2 ring-[var(--play-gold)] sm:p-5',
  invite: 'play-end-rise flex flex-wrap items-center gap-3 rounded-2xl bg-play-lift p-3',
  pick: 'flex max-h-72 flex-col gap-1 overflow-y-auto',
  pickRow:
    'flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm font-bold transition-colors hover:bg-[var(--play-chip)]',
  pickRowOn: 'bg-[var(--play-chip)] ring-1 ring-[var(--play-key)]',
  footer: 'flex flex-wrap gap-2 pt-2',
  // Dashed box, same size and gap as a group card
  addBox:
    'flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[var(--play-line)] p-5 text-base font-bold text-[var(--play-ink-soft)] transition-colors hover:bg-play-nest hover:text-[var(--play-ink)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  addIcon: 'size-6',
  // Creation steps, a timeline above the field
  wizard: 'flex flex-col gap-5 rounded-3xl bg-play-nest p-5 md:col-span-2',
  timeline: 'flex items-center gap-2',
  step: 'flex items-center gap-2 text-sm font-bold text-[var(--play-ink-faint)]',
  stepOn: 'text-[var(--play-ink)]',
  stepDot:
    'grid size-7 shrink-0 place-items-center rounded-full bg-[var(--play-chip)] text-xs tabular-nums',
  stepDotOn: 'bg-[var(--play-key)] text-[var(--play-night)]',
  stepLine: 'h-0.5 min-w-4 flex-1 rounded-full bg-[var(--play-chip)]',
  stepLineOn: 'bg-[var(--play-key)]',
  stepLabel: 'hidden sm:inline',
  recap: 'flex flex-col gap-2 rounded-2xl bg-play-lift p-4',
  recapName: 'truncate text-xl font-extrabold tracking-tight text-[var(--play-ink)]',
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
  title: 'text-xl font-bold tracking-tight text-[var(--play-ink)]',
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
  art: 'absolute inset-0 bg-[linear-gradient(to_bottom,var(--play-haze),var(--play-night))]',
  shade: 'absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,var(--play-glass-solid))]',
  medal: `${PLAY_GOLD_TILE} absolute bottom-0 left-1/2 grid size-20 -translate-x-1/2 translate-y-1/2 place-items-center rounded-full`,
  medalIcon: 'size-10',
  body: 'flex flex-col items-center gap-5 px-6 pt-14 pb-6 text-center',
  title: 'text-2xl font-bold tracking-tight text-[var(--play-ink)]',
  text: 'max-w-xs text-sm text-[var(--play-ink-soft)]',
  figures: 'grid w-full grid-cols-3 gap-2',
  figure:
    'play-rise-item flex flex-col items-center gap-0.5 rounded-2xl bg-[var(--play-chip)] px-2 py-3',
  value: 'text-2xl font-bold tabular-nums text-[var(--play-ink)]',
  label: 'text-micro font-bold tracking-wide text-[var(--play-ink-soft)] uppercase',
  key: 'w-full justify-center',
} as const

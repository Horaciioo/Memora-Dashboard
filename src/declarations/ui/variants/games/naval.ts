import { setupStyles } from '@/declarations/ui/variants/games/play'

// Glass card over the sea
const PANEL =
  'rounded-2xl border border-white/10 bg-[var(--play-naval-panel)] p-3 backdrop-blur-md shadow-[0_0.6rem_1.6rem_rgb(0_0_0/0.35)]'

// Round key on the sea
const KEY =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold transition-[transform,background-color,opacity] duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-40'

/**
 * Naval table frame
 * @type {Record<string, string>}
 */

export const NAVAL_BOARD = {
  root: 'relative flex size-full items-center justify-center overflow-y-auto px-3 pt-28 pb-3 text-[var(--play-naval-ink)] select-none lg:overflow-hidden lg:px-[22rem] lg:pt-24',
  // Phones stack, wide screens set the sea beside a slim rail
  battle: 'flex max-h-full flex-col items-center gap-4',
  // Bar, sea and weapon share the width of the sea, as large as the screen allows
  stage: 'mx-auto flex w-[min(calc(100dvh-7rem),calc(100vw-1.5rem))] min-w-[19rem] flex-col gap-2.5 lg:w-[min(calc(100dvh-7rem),calc(100vw-44rem))]',
  rail: 'flex w-full max-w-[34rem] flex-col gap-3 empty:hidden lg:absolute lg:top-24 lg:left-7 lg:max-h-[calc(100dvh-8rem)] lg:w-[19rem] lg:overflow-y-auto',
  target: 'relative mx-auto w-full',
  // Melee: a new sea fades in
  seaIn: 'naval-sea-in',
  mineTag:
    'pointer-events-none absolute inset-x-0 top-3 z-10 text-center text-lg font-black tracking-[0.14em] text-white uppercase [text-shadow:0_0.1rem_0.6rem_rgb(0_0_0/0.8)]',
  panel: PANEL,
  title: 'text-xs font-black tracking-[0.14em] uppercase text-[var(--play-naval-ink-soft)]',
  sub: 'text-sm font-semibold text-[var(--play-naval-ink-soft)]',
} as const

/**
 * Top bar: mode, turn call, clock, sound
 * @type {Record<string, string>}
 */

export const NAVAL_HUD = {
  root: 'pointer-events-none absolute inset-0 z-20 select-none',
  crew: 'play-hud-block pointer-events-auto absolute top-3 left-3 flex items-center gap-3 rounded-lg! px-3 py-1.5 backdrop-blur-md md:top-6 md:left-7',
  captain: 'flex items-center gap-1.5',
  captainOut: 'opacity-40 grayscale',
  face: 'overflow-hidden rounded-full',
  sunk: 'text-sm font-black tabular-nums text-[var(--play-ink-faint)]',
  sunkMine: 'text-[var(--play-ink-soft)]',
  bridge:
    'play-hud-block pointer-events-auto absolute top-3 left-1/2 flex h-11 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-5 rounded-lg! px-5 backdrop-blur-md max-md:top-16 md:top-6',
  call: 'naval-call truncate text-sm font-black tracking-[0.12em] text-[var(--play-ink)] uppercase md:text-base',
  callMine: 'text-[var(--play-accent)]',
  callDanger: 'text-[var(--play-naval-danger)]',
  keys: 'pointer-events-auto absolute top-3 right-3 md:top-6 md:right-7',
  actions: 'flex items-center gap-2 border-l border-[var(--play-line)] pl-4',
  action: 'h-8 rounded-md bg-[var(--play-chip)] px-3 text-sm font-extrabold tracking-wide whitespace-nowrap text-[var(--play-ink)] uppercase transition-transform hover:-translate-y-px active:scale-[0.97] disabled:opacity-50',
  actionMain: 'bg-[var(--play-accent)] text-[var(--hud-solid)]',
  clockRow: 'flex w-36 items-center gap-2',
  clock: 'naval-clock h-2.5 flex-1 overflow-hidden rounded-sm bg-[var(--play-chip)]',
  clockFill: 'naval-clock-fill block h-full w-full rounded-sm bg-[var(--play-accent)]',
  clockAlert: 'bg-[var(--play-naval-danger)]',
  seconds: 'min-w-7 text-right text-sm font-extrabold tabular-nums text-[var(--play-ink)]',
} as const

/**
 * Captain chips
 * @type {Record<string, string>}
 */

export const NAVAL_FOES = {
  row: 'flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible',
  chip: 'naval-chip flex min-h-14 min-w-[8.5rem] snap-start items-center gap-2 rounded-2xl border border-white/10 bg-[var(--play-naval-panel)] px-2.5 py-1.5 text-left transition-[transform,border-color,opacity] duration-150 active:scale-[0.97] lg:min-w-0',
  chipOn: 'border-[var(--play-naval-reticle)] bg-white/10',
  chipOut: 'opacity-45 grayscale',
  chipHit: 'naval-chip-hit',
  chipTurn: 'naval-chip-turn',
  text: 'flex min-w-0 flex-1 flex-col',
  name: 'truncate text-sm font-extrabold text-[var(--play-naval-ink)]',
  note: 'truncate text-xs font-semibold text-[var(--play-naval-ink-soft)]',
  pips: 'mt-0.5 flex gap-0.5',
  pip: 'h-1.5 w-3 rounded-sm bg-[var(--play-naval-hull)]',
  pipOff: 'bg-[var(--play-naval-hit)] opacity-60',
} as const

/**
 * Placement screen
 * @type {Record<string, string>}
 */

export const NAVAL_PLACE = {
  root: 'relative flex size-full items-center justify-center overflow-y-auto px-3 pt-28 pb-3 text-[var(--play-naval-ink)] select-none lg:overflow-hidden lg:px-[22rem] lg:pt-24',
  stage: 'flex w-full flex-col items-center',
  body: 'flex w-full flex-col items-center justify-center',
  sea: 'mx-auto w-[min(calc(100dvh-7rem),calc(100vw-1.5rem))] lg:w-[min(calc(100dvh-7rem),calc(100vw-44rem))]',
} as const

/**
 * Bracket tree
 * @type {Record<string, string>}
 */

export const NAVAL_BRACKET = {
  root: `${PANEL} flex flex-col gap-3`,
  round: 'flex flex-col gap-1.5',
  roundTitle: 'text-xs font-black tracking-[0.14em] uppercase text-[var(--play-naval-ink-soft)]',
  match: 'flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-1.5 transition-colors',
  matchLive: 'border-[var(--play-naval-glow)]',
  matchMine: 'bg-white/12',
  side: 'flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-bold',
  sideWon: 'bg-[var(--play-naval)]/45',
  sideLost: 'opacity-45',
  name: 'min-w-0 flex-1 truncate',
  note: 'text-xs font-semibold text-[var(--play-naval-ink-soft)]',
} as const

/**
 * Result screen
 * @type {Record<string, string>}
 */

export const NAVAL_RESULT = {
  root: 'mx-auto flex w-full max-w-[40rem] flex-col gap-4 pt-4',
  banner: 'text-center text-4xl font-black text-[var(--play-naval-ink)]',
  glow: 'naval-result-glow pointer-events-none fixed inset-0 -z-10',
  glowWin: 'naval-result-win',
  glowLose: 'naval-result-lose',
  sea: 'relative mx-auto w-full max-w-[30rem]',
  seaNav: 'mx-auto flex w-full max-w-[30rem] items-center justify-between gap-3',
  seaArrow:
    'flex size-10 items-center justify-center rounded-full bg-white/12 text-[var(--play-naval-ink)] transition-colors hover:bg-white/20 disabled:opacity-30',
  seaTitle: 'flex min-w-0 flex-1 flex-col items-center text-center',
  seaName: 'max-w-full truncate text-base font-black text-[var(--play-naval-ink)]',
  seaCount: 'text-xs font-bold text-[var(--play-naval-ink-soft)]',
  stats: `${PANEL} grid grid-cols-2 gap-3 sm:grid-cols-4`,
  stat: 'flex flex-col items-center gap-0.5 text-center',
  statValue: 'text-xl font-black tabular-nums text-[var(--play-naval-ink)]',
  statLabel: 'text-xs font-bold tracking-[0.1em] uppercase text-[var(--play-naval-ink-soft)]',
  bannerWin: 'text-[var(--play-naval-reticle)]',
  list: `${PANEL} flex flex-col gap-1.5`,
  row: 'flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm font-bold',
  rowMine: 'bg-white/12',
  rank: 'w-8 text-center text-lg font-black tabular-nums text-[var(--play-naval-reticle)]',
  name: 'min-w-0 flex-1 truncate',
  note: 'text-xs font-semibold text-[var(--play-naval-ink-soft)]',
} as const

/**
 * Banner over the sea for a moment
 * @type {Record<string, string>}
 */

export const NAVAL_CALLOUT = {
  root: 'naval-callout pointer-events-none absolute inset-x-0 top-[38%] z-20 flex justify-center px-4',
  text: 'rounded-2xl bg-black/65 px-5 py-2.5 text-2xl font-black text-[var(--play-naval-ink)] shadow-[0_0.6rem_2rem_rgb(0_0_0/0.5)] backdrop-blur-sm sm:text-3xl',
  hit: 'text-[var(--play-naval-fire)]',
  sunk: 'text-[var(--play-naval-hit)]',
  miss: 'text-[var(--play-naval-foam)]',
  eliminated: 'text-[var(--play-naval-danger)]',
} as const

/**
 * Setup drawer of a new naval game
 * @type {Record<string, string>}
 */

export const NAVAL_SETUP = setupStyles(
  'border-[var(--play-naval)] bg-[var(--play-naval)] text-white hover:border-[var(--play-naval)]'
)

/**
 * Hub ground, a fleet on a burning sea
 * @type {Record<string, string>}
 */

export const NAVAL_HUB = {
  scene: 'pointer-events-none fixed inset-0 z-0 overflow-hidden',
  photo: 'object-cover',
  veil: 'naval-hub-veil absolute inset-0',
} as const

/**
 * Canvas sea
 * @type {Record<string, string>}
 */

export const NAVAL_OCEAN = {
  box: 'naval-ocean relative aspect-square w-full touch-none select-none',
  dim: 'naval-ocean-dim',
  canvas: 'naval-ocean-canvas block size-full rounded-[1rem]',
} as const

/**
 * Weapon drawn and action key
 * @type {Record<string, string>}
 */

export const NAVAL_ARSENAL = {
  root: 'flex items-center gap-2',
  idle: 'opacity-70',
  card: 'naval-draw flex min-w-0 items-center gap-2 rounded-md bg-[var(--play-chip)] py-1 pr-3 pl-1.5 text-left text-[var(--play-ink)] transition-transform active:scale-[0.97]',
  cardFixed: 'cursor-default active:scale-100 disabled:opacity-100',
  glyphBox: 'grid size-7 shrink-0 place-items-center text-[var(--play-accent)]',
  glyph: 'size-6 fill-current',
  name: 'truncate text-sm font-extrabold tracking-wide uppercase',
  fire: 'h-8 rounded-md bg-[var(--play-naval-hit)] px-4 text-sm font-black tracking-wide text-white uppercase transition-transform active:scale-[0.96] disabled:bg-[var(--play-chip)] disabled:text-[var(--play-ink-faint)]',
} as const

/**
 * Map card of the launch vote: drawn picture, size badge
 * @type {Record<string, string>}
 */

export const NAVAL_MAP_CARD = {
  shot: 'absolute inset-0 size-full object-cover',
  // Soft tint while the picture is being drawn
  pending: 'absolute inset-0 animate-pulse bg-white/10',
  size: 'absolute right-2 bottom-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-extrabold tabular-nums text-white backdrop-blur-sm sm:text-sm',
} as const

/**
 * Sketched faces of the rule cards in the launch vote
 * @type {Record<string, string>}
 */

export const NAVAL_VOTE_FACE = {
  art: 'size-[78%] text-white',
} as const

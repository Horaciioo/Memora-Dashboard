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
  root: 'relative mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-[80rem] flex-col gap-3 px-3 pt-2 pb-28 lg:pb-6 text-[var(--play-naval-ink)] select-none lg:px-6',
  // Phones stack, wide screens set the sea beside a slim rail
  battle: 'my-auto flex flex-col items-center gap-4',
  // Bar, sea and weapon share the width of the sea, as large as the screen allows
  stage:
    'mx-auto flex w-[min(100%,calc(100dvh-17rem))] min-w-[19rem] flex-col gap-2.5',
  rail: 'flex w-full max-w-[34rem] flex-col gap-3 empty:hidden',
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
  bar: 'flex items-center justify-center',
  lead: 'flex min-w-0 flex-1 flex-col items-center gap-1 text-center',
  call: 'naval-call truncate text-lg leading-6 font-black text-[var(--play-naval-ink)] sm:text-xl',
  callMine: 'text-[var(--play-naval-reticle)]',
  callDanger: 'text-[var(--play-naval-danger)]',
  clockRow: 'flex w-full max-w-xs items-center gap-2',
  clock: 'naval-clock h-1.5 flex-1 overflow-hidden rounded-full bg-white/10',
  clockFill: 'naval-clock-fill block h-full w-full rounded-full bg-[var(--play-naval-glow)]',
  clockAlert: 'bg-[var(--play-naval-danger)]',
  seconds: 'min-w-9 text-right text-lg font-black tabular-nums',
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
  root: 'mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-[96rem] flex-col items-center gap-3 px-3 pt-2 pb-28 lg:px-8 lg:pb-6 text-[var(--play-naval-ink)] select-none',
  // Title and timer above, the sea beside its ships and keys
  stage: 'my-auto flex w-full flex-col items-center gap-4',
  head: 'flex w-full max-w-md flex-col items-center gap-2 text-center',
  heading: 'text-2xl font-black',
  body: 'grid w-full grid-cols-1 items-center gap-6 lg:grid-cols-[min(72rem,calc(100dvh-12rem))_minmax(14rem,20rem)] lg:justify-start',
  sea: 'mx-auto w-[min(100%,calc(100dvh-24rem))] lg:w-full',
  side: 'flex flex-col items-center gap-4 lg:items-stretch',
  dock: 'flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:flex-col lg:items-start',
  ship: 'naval-dock-ship shrink-0 touch-none rounded-lg px-1.5 py-2 transition-[transform,opacity,background-color] duration-150 active:scale-95',
  sprite: 'block',
  spriteCell: 30,
  shipOn: 'bg-white/20',
  shipDone: 'opacity-45',
  keys: 'flex w-full flex-wrap gap-2 lg:flex-col [&>button]:flex-auto [&>button]:px-2 [&>button]:text-xs [&>button]:whitespace-nowrap lg:[&>button]:px-4 lg:[&>button]:text-sm',
  key: `${KEY} bg-white/10 text-[var(--play-naval-ink)] hover:bg-white/20`,
  keyMain: `${KEY} bg-[var(--play-naval)] text-white hover:bg-[#2b8bbd]`,
  sub: 'text-sm font-semibold text-[var(--play-naval-ink-soft)]',
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
  root: 'flex items-stretch gap-2 rounded-2xl border border-white/10 bg-[var(--play-naval-panel)] p-2 backdrop-blur-sm',
  idle: 'opacity-80',
  card: 'naval-draw flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-white/10 px-2.5 py-1.5 text-left text-[var(--play-naval-ink)] transition-transform active:scale-[0.98]',
  cardFixed: 'cursor-default active:scale-100 disabled:opacity-100',
  glyphBox: 'grid size-12 shrink-0 place-items-center rounded-lg bg-black/25 text-[var(--play-naval-reticle)]',
  glyph: 'size-9 fill-current',
  text: 'flex min-w-0 flex-col',
  name: 'truncate text-lg leading-6 font-black',
  note: 'truncate text-xs font-semibold text-[var(--play-naval-ink-soft)]',
  fire: 'min-h-14 min-w-28 rounded-xl bg-[var(--play-naval-hit)] px-5 text-lg font-black text-white transition-transform active:scale-[0.97] disabled:bg-white/10 disabled:text-[var(--play-naval-ink-soft)]',
  wait: 'grid min-h-14 w-full place-items-center text-center text-base font-black text-[var(--play-naval-ink-soft)]',
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

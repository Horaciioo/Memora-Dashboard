import { setupStyles } from '@/declarations/ui/variants/play'

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
  root: 'relative mx-auto flex w-full max-w-[74rem] flex-col gap-3 px-3 pt-2 pb-28 text-[var(--play-naval-ink)] select-none lg:px-6',
  // Phones stack, wide screens set three columns
  battle:
    'grid grid-cols-1 gap-3 lg:grid-cols-[minmax(15rem,1fr)_minmax(0,34rem)_minmax(15rem,1fr)] lg:items-start [grid-template-areas:"hud"_"foes"_"sea"_"fire"_"mine"_"side"] lg:[grid-template-areas:"hud_hud_hud"_"left_sea_side"_"left_fire_side"]',
  hud: '[grid-area:hud]',
  // Phones keep the strip and the fleet apart, wide screens stack them on the left
  left: 'contents lg:flex lg:flex-col lg:gap-3 lg:[grid-area:left]',
  foes: '[grid-area:foes] lg:[grid-area:auto]',
  sea: 'mx-auto flex w-[min(100%,calc(100dvh-25rem))] min-w-[18rem] flex-col gap-2 [grid-area:sea] lg:w-full lg:min-w-0',
  fire: 'mx-auto w-full max-w-[34rem] [grid-area:fire]',
  mine: 'flex flex-col gap-3 [grid-area:mine] lg:[grid-area:auto]',
  side: 'flex flex-col gap-3 [grid-area:side]',
  panel: PANEL,
  title: 'text-xs font-black tracking-[0.14em] uppercase text-[var(--play-naval-ink-soft)]',
  sub: 'text-sm font-semibold text-[var(--play-naval-ink-soft)]',
} as const

/**
 * Top bar: mode, turn call, clock, sound
 * @type {Record<string, string>}
 */

export const NAVAL_HUD = {
  bar: `${PANEL} flex items-center gap-3`,
  lead: 'flex min-w-0 flex-1 flex-col',
  mode: 'text-xs font-black tracking-[0.14em] uppercase text-[var(--play-naval-glow)]',
  call: 'truncate text-lg leading-6 font-black text-[var(--play-naval-ink)] sm:text-xl',
  callMine: 'text-[var(--play-naval-reticle)]',
  callDanger: 'text-[var(--play-naval-danger)]',
  clockRow: 'flex items-center gap-2',
  clock: 'naval-clock h-1.5 flex-1 overflow-hidden rounded-full bg-white/10',
  clockFill: 'naval-clock-fill block h-full w-full rounded-full bg-[var(--play-naval-glow)]',
  clockAlert: 'bg-[var(--play-naval-danger)]',
  seconds: 'min-w-9 text-right text-lg font-black tabular-nums',
  keys: 'flex shrink-0 gap-1.5',
  soundKey: `${KEY} size-11 bg-white/10 px-0 text-[var(--play-naval-ink)] hover:bg-white/20 aria-pressed:bg-[var(--play-naval)] aria-pressed:text-white`,
  soundIcon: 'size-5',
} as const

/**
 * One sea: frame, labels, grid
 * @type {Record<string, string>}
 */

export const NAVAL_SEA_UI = {
  frame:
    'grid grid-cols-[1.1rem_1fr] grid-rows-[1.1rem_1fr] gap-x-1 gap-y-0.5 text-[0.65rem] font-black text-[var(--play-naval-ink-soft)]',
  frameMini: 'grid-cols-[0.7rem_1fr] grid-rows-[0.7rem_1fr] text-[0.5rem]',
  columns: 'col-start-2 grid',
  rows: 'row-start-2 grid',
  label: 'grid place-items-center leading-none',
  sea: 'naval-sea col-start-2 row-start-2',
  live: 'naval-sea-live',
  cells: 'naval-cells',
  cell: 'naval-cell',
  ships: 'pointer-events-none absolute inset-0',
  effects: 'pointer-events-none absolute inset-0 overflow-hidden',
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
 * Aim readout and fire key
 * @type {Record<string, string>}
 */

export const NAVAL_FIRE = {
  bar: `${PANEL} flex items-center gap-3`,
  target: 'flex min-w-0 flex-1 flex-col',
  square: 'text-3xl leading-8 font-black tabular-nums text-[var(--play-naval-reticle)]',
  hint: 'truncate text-sm font-semibold text-[var(--play-naval-ink-soft)]',
  fire: `${KEY} naval-fire min-h-14 min-w-32 bg-[var(--play-naval-hit)] text-lg text-white shadow-[0_0.3rem_0_#a3270f] hover:bg-[#ff6e4d] active:translate-y-0.5 active:shadow-[0_0.1rem_0_#a3270f]`,
} as const

/**
 * Placement screen
 * @type {Record<string, string>}
 */

export const NAVAL_PLACE = {
  root: 'mx-auto grid w-full max-w-[56rem] gap-3 lg:grid-cols-[minmax(0,34rem)_1fr] lg:items-start',
  sea: 'mx-auto w-[min(100%,calc(100dvh-24rem))] min-w-[18rem] lg:w-full lg:min-w-0',
  side: 'flex flex-col gap-3',
  dock: 'flex flex-wrap gap-2',
  ship: 'naval-dock-ship flex min-h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm font-bold transition-[transform,border-color,opacity] duration-150 active:scale-95',
  shipOn: 'border-[var(--play-naval-reticle)] bg-white/15',
  shipDone: 'opacity-45',
  cells: 'flex gap-0.5',
  cellBlock: 'size-3 rounded-[0.2rem] bg-[var(--play-naval-hull)]',
  keys: 'flex flex-wrap gap-2',
  key: `${KEY} bg-white/10 text-[var(--play-naval-ink)] hover:bg-white/20`,
  keyMain: `${KEY} bg-[var(--play-naval)] text-white hover:bg-[#2b8bbd]`,
  ready: 'flex flex-col gap-1.5',
  readyRow: 'flex items-center gap-2 text-sm font-semibold',
  readyOff: 'opacity-55',
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
  scene: 'naval-scene pointer-events-none fixed inset-0 z-0 overflow-hidden',
  layer: 'absolute inset-x-0',
} as const

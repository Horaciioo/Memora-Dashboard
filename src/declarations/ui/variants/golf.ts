import { setupStyles } from '@/declarations/ui/variants/play'

// Frosted card over the course
const GLASS = 'play-glass rounded-2xl ring-1 ring-[var(--play-line)] shadow-[var(--shadow-sm)]'
const CAPTION =
  'text-[0.68rem] font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase'
const FIGURE = 'text-2xl leading-none font-extrabold tabular-nums text-[var(--play-ink)]'
const ROUND =
  'grid size-11 place-items-center rounded-xl text-[var(--play-ink)] hover:bg-[var(--play-chip)]'

/**
 * Golf course screen: the 3D stage and the cards laid over it
 * @type {Record<string, string>}
 */

export const GOLF_BOARD = {
  board: 'flex flex-col gap-4 pb-16',
  stage:
    'relative h-[min(72dvh,46rem)] min-h-[24rem] w-full overflow-hidden rounded-2xl bg-[var(--play-golf-deep)] ring-1 ring-[var(--play-line)] select-none',
  loading: 'absolute inset-0 grid place-items-center text-sm font-bold text-[var(--play-ink-soft)]',
  // Top row: hole card, players, view keys
  top: 'pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3',
  hole: `${GLASS} pointer-events-auto flex items-center gap-4 px-4 py-3`,
  holeBlock: 'flex flex-col gap-1',
  caption: CAPTION,
  figure: FIGURE,
  figureSmall: 'text-base leading-none font-extrabold tabular-nums text-[var(--play-ink)]',
  clockLow: 'text-[var(--play-golf-malus)]',
  divider: 'h-9 w-px bg-[var(--play-line)]',
  views: `${GLASS} pointer-events-auto flex items-center gap-1 p-1`,
  view: ROUND,
  viewOn: 'bg-[var(--play-chip)]',
  viewIcon: 'size-5',
  // Players strip
  players: `${GLASS} pointer-events-auto hidden items-center gap-3 px-3 py-2 md:flex`,
  player: 'relative flex flex-col items-center gap-1',
  playerFace: 'rounded-full ring-2',
  playerStrokes: 'text-xs font-extrabold tabular-nums text-[var(--play-ink)]',
  playerMark:
    'absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-[var(--play-golf-bonus)] text-[var(--play-on-art)] ring-2 ring-[var(--play-night)]',
  playerMarkIcon: 'size-3',
  playerGone: 'opacity-40 grayscale',
  // Bottom row: power slot, status and gauge, strokes
  bottom:
    'pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-3',
  slot: `${GLASS} pointer-events-auto flex max-w-xs items-center gap-3 p-2.5 pr-3`,
  slotEmpty: 'border border-dashed border-[var(--play-line)] bg-transparent shadow-none',
  slotIcon: 'grid size-12 shrink-0 place-items-center rounded-xl text-[var(--play-on-art)]',
  slotIconEmpty: 'bg-[var(--play-chip)] text-[var(--play-ink-faint)]',
  slotGlyph: 'size-7',
  slotText: 'flex min-w-0 flex-col gap-0.5',
  slotName: 'truncate text-sm font-extrabold text-[var(--play-ink)]',
  slotHint: 'text-sm italic text-[var(--play-ink-faint)]',
  slotUse: 'shrink-0',
  bonus: 'bg-[var(--play-golf-bonus)]',
  malus: 'bg-[var(--play-golf-malus)]',
  bonusInk: 'text-[var(--play-golf-bonus)]',
  malusInk: 'text-[var(--play-golf-malus)]',
  middle:
    'pointer-events-none flex min-w-0 flex-1 flex-col items-center gap-2 max-md:order-first max-md:basis-full',
  status: `${GLASS} px-4 py-2 text-center text-sm font-bold text-[var(--play-ink)]`,
  gauge: `${GLASS} flex w-full max-w-sm flex-col gap-1.5 px-4 py-2.5`,
  gaugeRow: 'flex items-center justify-between',
  gaugeTrack: 'h-2.5 overflow-hidden rounded-full bg-[var(--play-track)]',
  gaugeFill:
    'h-full rounded-full bg-[linear-gradient(90deg,var(--play-golf-aim-low),var(--play-golf-boost),var(--play-golf-aim-high))] bg-[length:var(--play-gauge-span)_100%] transition-[width] duration-75',
  strokes: `${GLASS} pointer-events-auto flex flex-col items-end gap-1 px-4 py-3`,
  // Effects worn by the viewer
  effects: 'flex flex-wrap items-center gap-1.5',
  effect: 'grid size-7 place-items-center rounded-lg text-[var(--play-on-art)]',
  effectIcon: 'size-4',
  // Placement banner
  placing: `${GLASS} pointer-events-auto absolute top-24 left-1/2 flex -translate-x-1/2 items-center gap-3 px-4 py-2.5 text-sm font-bold text-[var(--play-ink)]`,
  // Hole intro banner
  intro: 'pointer-events-none absolute inset-0 grid place-items-center',
  introCard: `${GLASS} play-tick flex flex-col items-center gap-1 px-10 py-6`,
  introHole: 'text-4xl font-extrabold tracking-tight text-[var(--play-ink)]',
  introPar: 'text-sm font-extrabold tracking-widest text-[var(--play-golf-glow)] uppercase',
  figureCountdown:
    'play-figure play-figure-golf text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
} as const

/**
 * Scorecard between two holes and at the end
 * @type {Record<string, string>}
 */

export const GOLF_SCORECARD = {
  overlay:
    'absolute inset-0 z-10 grid place-items-center overflow-y-auto bg-[var(--play-night)]/55 p-4 backdrop-blur-md',
  card: `${GLASS} flex w-full max-w-3xl flex-col gap-4 p-5`,
  head: 'flex flex-wrap items-center justify-between gap-3',
  title: 'text-xl font-extrabold tracking-tight text-[var(--play-ink)]',
  next: 'text-sm font-bold tabular-nums text-[var(--play-ink-soft)]',
  scroll: 'overflow-x-auto',
  table: 'w-full border-separate border-spacing-0 text-sm tabular-nums',
  headCell: `${CAPTION} px-2 py-2 text-center first:text-left`,
  row: 'text-[var(--play-ink)]',
  rowMe: 'bg-[var(--play-chip)]',
  name: 'flex min-w-36 items-center gap-2 px-2 py-2 font-extrabold',
  cell: 'px-2 py-2 text-center font-bold',
  cellPending: 'text-[var(--play-ink-faint)]',
  cellUnder: 'text-[var(--play-golf-glow)]',
  cellOver: 'text-[var(--play-bomb-glow)]',
  total: 'px-2 py-2 text-center text-base font-extrabold',
  parRow: 'text-[var(--play-ink-soft)]',
  scoreName: 'text-sm font-extrabold text-[var(--play-golf-glow)]',
} as const

/**
 * Drawn inside the 3D canvas
 * @type {Record<string, string>}
 */

export const GOLF_SCENE_UI = {
  canvas: 'absolute! inset-0 touch-none',
} as const

// Picked in the golf green
const SETUP_TURF =
  'border-[var(--play-golf)] bg-[var(--play-golf)] text-white hover:border-[var(--play-golf)]'

/**
 * Setup drawer of a new golf game
 * @type {PlaySetupStyles}
 */

export const GOLF_SETUP = {
  ...setupStyles(SETUP_TURF),
  powers: 'grid gap-2 sm:grid-cols-2',
  power:
    'flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] p-3 text-left transition-colors hover:border-[var(--color-field-border-strong)]',
  powerOn: 'border-[var(--play-golf)] ring-1 ring-[var(--play-golf)]',
  powerIcon: 'grid size-9 shrink-0 place-items-center rounded-lg text-white',
  powerOff: 'opacity-45 grayscale',
  powerGlyph: 'size-5',
  powerText: 'flex min-w-0 flex-col gap-0.5',
  powerName: 'text-sm font-semibold text-[var(--color-ink)]',
  powerEffect: 'text-xs text-[var(--color-ink-subtle)]',
} as const

import { setupStyles } from '@/declarations/ui/variants/play'

// Putt Party pixel slab over the course
const GLASS = 'golf-block'
const CAPTION = 'text-sm leading-none font-black tracking-wide text-[var(--play-ink)] uppercase'
const FIGURE = 'text-3xl leading-none font-black tabular-nums text-[var(--play-ink-soft)]'
const ROUND =
  'grid size-11 place-items-center text-[var(--play-ink)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--play-chip)]'

/**
 * Golf course screen: the 3D stage and the cards laid over it
 * @type {Record<string, string>}
 */

export const GOLF_BOARD = {
  board: 'flex flex-col gap-4 pb-16',
  stage:
    'golf-hud-theme relative h-[min(72dvh,46rem)] min-h-[24rem] w-full overflow-hidden rounded-[0.7rem_1.1rem_0.8rem_1rem] border-b-[0.4rem] border-[var(--play-golf-deep)] bg-[var(--play-golf-deep)] ring-1 ring-[var(--play-line)] select-none',
  stageFull: 'h-full! min-h-0! rounded-none! border-b-0! ring-0!',
  boardFull: 'min-h-0 flex-1 pb-0!',
  loading: 'absolute inset-0 grid place-items-center text-sm font-bold text-[var(--play-ink-soft)]',
  // Top row: hole card, players, view keys
  top: 'golf-block-drop pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3',
  hole: `${GLASS} pointer-events-auto flex w-[40rem] max-w-full items-center gap-4 px-6 py-3.5 md:order-2`,
  holeBlock: 'flex min-w-0 flex-1 basis-0 items-baseline justify-center gap-2',
  caption: CAPTION,
  figure: FIGURE,
  figureSmall: 'text-base leading-none font-extrabold tabular-nums text-[var(--play-ink)]',
  clockLow: 'animate-pulse text-[var(--play-golf-hud-ink)]',
  divider: 'w-px self-stretch bg-[var(--play-line)]',
  rule: 'my-1 h-px bg-[var(--play-line)]',
  views: `${GLASS} pointer-events-auto flex items-center gap-1 p-1.5`,
  view: ROUND,
  viewOn: 'bg-[var(--play-chip)]',
  viewIcon: 'size-5',
  // Keys and the settings card hanging under them
  keys: 'pointer-events-auto relative md:order-3',
  settings: `${GLASS} absolute top-full right-0 z-10 mt-3 flex w-72 flex-col gap-1 p-3`,
  setting:
    'flex items-center justify-between gap-3 px-1 py-1.5 text-left text-base font-extrabold text-[var(--play-ink)]',
  soundRow: 'flex items-center gap-3 px-1 py-1.5 text-base font-extrabold text-[var(--play-ink)]',
  volume: 'min-w-0 flex-1 cursor-pointer accent-[var(--play-accent)]',
  // Players strip
  players: `${GLASS} pointer-events-auto hidden items-center gap-3 px-3 py-2 md:order-1 md:flex`,
  player: 'relative flex flex-col items-center gap-1',
  playerFace: 'overflow-hidden ring-[3px]',
  playerStrokes: 'text-sm font-black tabular-nums text-[var(--play-ink)]',
  playerMark:
    'absolute -top-1 -right-1 grid size-5 place-items-center bg-[var(--play-golf-bonus)] text-[var(--play-on-art)] ring-2 ring-[var(--play-golf-hud-deep)]',
  playerMarkIcon: 'size-3',
  playerGone: 'opacity-40 grayscale',
  // Bottom row: power slot, status and gauge, strokes
  bottom:
    'golf-block-drop pointer-events-none absolute inset-x-5 bottom-5 flex flex-wrap items-end justify-between gap-4 md:inset-x-7 md:bottom-7',
  // Hand: rounded cases, bottom right
  handBox: 'pointer-events-auto flex flex-col items-end gap-2',
  hand: 'flex items-end gap-3',
  slot: 'group/slot pointer-events-auto relative grid size-[4.75rem] place-items-center text-[var(--play-on-art)] transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60',
  // Grey cube, nothing to play
  slotEmpty: 'cursor-default opacity-60 hover:translate-y-0',
  slotOrb: 'size-[4.75rem]',
  // Name and effect, on hover only
  slotTip: `${GLASS} pointer-events-none absolute right-0 bottom-full mb-3 flex w-56 flex-col gap-1 p-3 text-left opacity-0 transition-opacity group-hover/slot:opacity-100 group-focus-visible/slot:opacity-100`,
  slotKind:
    'self-start px-1.5 py-0.5 text-[0.65rem] leading-none font-black tracking-wide text-white uppercase',
  slotName: 'text-sm font-extrabold text-[var(--play-ink)]',
  slotEffect: 'text-xs font-semibold text-[var(--play-ink-soft)]',
  bonus: 'bg-[var(--play-golf-bonus)]',
  malus: 'bg-[var(--play-golf-malus)]',
  bonusInk: 'text-[var(--play-golf-bonus)]',
  malusInk: 'text-[var(--play-golf-malus)]',
  middle:
    'pointer-events-none flex min-w-0 flex-1 flex-col items-center gap-2 max-md:order-first max-md:basis-full',
  status: `${GLASS} px-4 py-2 text-center text-sm font-bold text-[var(--play-ink)]`,
  gauge: `${GLASS} flex w-full max-w-sm flex-col gap-1.5 px-4 py-2.5`,
  gaugeRow: 'flex items-center justify-between',
  gaugeTrack: 'h-3.5 overflow-hidden bg-[var(--play-track)]',
  gaugeFill:
    'h-full bg-[linear-gradient(90deg,var(--play-golf-aim-low),var(--play-golf-boost),var(--play-golf-aim-high))] bg-[length:var(--play-gauge-span)_100%] transition-[width] duration-75',
  // Effects worn by the viewer
  effects: 'flex flex-wrap items-center gap-1.5',
  effect: 'size-8',
  // Placement banner
  placing: `${GLASS} pointer-events-auto absolute top-24 left-1/2 flex -translate-x-1/2 items-center gap-3 px-4 py-2.5 text-sm font-bold text-[var(--play-ink)]`,
  // Hole intro banner
  intro: 'pointer-events-none absolute inset-0 grid place-items-center',
  introCard: `${GLASS} play-tick flex flex-col items-center gap-1 px-10 py-6`,
  introHole: 'text-4xl font-extrabold tracking-tight text-[var(--play-ink)]',
  introCourse: 'text-xs font-extrabold tracking-widest text-[var(--play-ink-soft)] uppercase',
  // Power revealed, used or ended
  cue: 'pointer-events-none absolute inset-x-0 bottom-40 grid place-items-center',
  cueCard: 'golf-cue flex flex-col items-center gap-2',
  cueOrb: 'size-28',
  cueName:
    'text-3xl font-extrabold tracking-tight text-[var(--play-ink)] [text-shadow:0_2px_0_rgb(0_0_0/0.25)]',
  // Pink arch of the hole winner
  victory: 'play-tick flex flex-col items-center gap-1',
  victoryArch:
    'grid h-28 w-40 place-items-center rounded-t-full rounded-b-2xl bg-[var(--color-brand-500)] text-[var(--color-on-brand)] shadow-[var(--shadow-sm)]',
  victoryGlyph: 'size-14',
  victoryName: 'text-lg font-extrabold text-[var(--play-ink)]',
  // Frost on the screen edges
  frost: 'golf-frost pointer-events-none absolute inset-0',
  frostMelt: 'golf-frost-melt',
  // Victory of a holed ball
  cheer: 'pointer-events-none absolute inset-0 grid place-items-center overflow-hidden',
  cheerFlash: 'golf-cheer-flash absolute inset-0 bg-white',
  cheerStage: 'relative -mt-[8%] grid place-items-center',
  cheerRays: 'golf-cheer-rays absolute size-[46rem] max-w-[170vw]',
  cheerSpark:
    'golf-cheer-spark absolute bg-[color-mix(in_srgb,var(--play-golf-gold-light)_var(--tone),var(--play-golf-hud-value))]',
  cheerCard: 'golf-cheer-card relative flex flex-col items-center gap-1',
  cheerTrophy: 'golf-trophy h-32 w-40 sm:h-40 sm:w-48',
  cheerText:
    'play-figure play-figure-golf text-5xl leading-none font-black tracking-tight uppercase sm:text-7xl',
  cheerGap:
    'text-2xl font-black tracking-wide text-[var(--play-ink)] uppercase [text-shadow:0_2px_0_rgb(0_0_0/0.3)]',
  figureCountdown:
    'play-figure play-figure-golf text-[11rem] leading-none font-black tabular-nums sm:text-[14rem]',
} as const

// Tone of a column header and its cells
const CARD_CELL = 'border-l-2 border-[var(--play-golf-card-line)] px-2 py-2.5 text-center'

/**
 * Score card bottom left: feed, round table, game stats key
 * @type {Record<string, string>}
 */

export const GOLF_PANEL = {
  root: 'pointer-events-auto flex w-72 max-w-[40%] flex-col max-md:hidden',
  log: 'flex flex-col gap-0.5 bg-[var(--play-golf-card-log)] px-3 py-2',
  logLine:
    'play-pop truncate text-sm font-extrabold text-white [text-shadow:0_1px_0_rgb(0_0_0/0.45)]',
  logHole: 'text-[var(--play-golf-card-faint)]',
  logName: 'text-[var(--play-golf-malus)]',
  head: 'flex items-center justify-between gap-2 bg-[var(--play-golf-card)] px-3 py-2.5',
  title: 'text-xl leading-none font-black tracking-tight whitespace-nowrap text-white uppercase',
  keys: 'flex items-center gap-1.5',
  key: 'grid size-9 place-items-center bg-white text-[var(--play-golf-card)] transition-transform hover:-translate-y-0.5',
  keyIcon:
    'size-5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
  fold: 'grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
  foldOpen: 'grid-rows-[1fr]',
  foldClip: 'min-h-0 overflow-hidden',
  switch: 'flex text-sm font-black uppercase',
  switchSide: 'px-2.5 py-1 bg-[var(--play-golf-card)] text-[var(--play-golf-card-faint)]',
  switchOff: 'bg-[var(--play-golf-card-off)] text-[var(--play-golf-card-off-ink)]',
  switchOn: 'text-[var(--play-golf-card-on)]',
  scroll: 'max-h-[min(16rem,30dvh)] overflow-y-auto bg-white',
  table: 'w-full border-collapse text-sm font-extrabold text-[var(--play-golf-card-ink)]',
  headCell: `${CARD_CELL} border-l-0 bg-white text-base font-black first:text-left`,
  row: 'bg-[var(--play-golf-card-row)] even:bg-[var(--play-golf-card-row-alt)]',
  rowMe: 'bg-[var(--play-golf-card-row-me)]!',
  name: 'flex min-w-0 items-center gap-1.5 px-2 py-2.5 text-base',
  eye: 'size-4 shrink-0 text-white',
  eyeSpace: 'size-4 shrink-0',
  nameText: 'min-w-0 flex-1 truncate',
  dot: 'size-5 shrink-0 rounded-full',
  cell: `${CARD_CELL} w-14 text-base`,
  holeMark:
    'inline-grid size-7 place-items-center rounded-full bg-[var(--play-golf-card-done)] text-white',
  empty: 'h-11',
} as const

/**
 * Scorecard between two holes and at the end
 * @type {Record<string, string>}
 */

export const GOLF_SCORECARD = {
  overlay:
    'absolute inset-0 z-10 grid place-items-center overflow-y-auto bg-[var(--play-night)]/55 p-4 backdrop-blur-md',
  card: `${GLASS} flex w-full max-w-3xl flex-col gap-4 p-5`,
  // Card with its stray squares and trophy
  frame: 'relative mt-16 w-full max-w-3xl',
  frameCard: `${GLASS} flex w-full flex-col gap-4 px-5 pt-8 pb-5`,
  edge: 'pointer-events-none absolute inset-0',
  square:
    'absolute bg-[color-mix(in_srgb,var(--play-golf-hud-light)_var(--tone),var(--play-golf-hud-deep))]',
  trophy:
    'golf-trophy pointer-events-none absolute -top-[4.6rem] left-1/2 h-[7.4rem] w-36 -translate-x-1/2',
  trophySheen: 'golf-trophy-sheen',
  trophyStar: 'golf-trophy-star',
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
  total: 'px-2 py-2 text-center text-base font-extrabold',
  close: 'flex justify-center',
} as const

/**
 * Blurred course panorama behind the golf hub
 * @type {Record<string, string>}
 */

export const GOLF_PANORAMA = {
  root: 'pointer-events-none fixed inset-0 z-0 overflow-hidden',
  // Oversized so the blur never shows its edge
  stage: 'absolute -inset-[3%] blur-[5px] brightness-[0.85] saturate-[0.7]',
  // Each course fades in over the last one
  layer: 'golf-panorama-in absolute inset-0',
  mist: 'absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/0.18)_0%,transparent_30%,transparent_65%,rgb(255_255_255/0.15)_100%)]',
  scrim: 'absolute inset-0 bg-[var(--play-night)]/40',
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
 * Power orb: a lit cube holding the glyph, a kind badge on its corner
 * @type {Record<string, string>}
 */

export const GOLF_ORB = {
  root: 'golf-orb-drop relative inline-grid shrink-0 place-items-center',
  cube: 'golf-orb absolute inset-0',
  glyph: 'relative size-[52%] text-white drop-shadow-[0_2px_0_rgb(0_0_0/0.3)]',
  kind: 'absolute -right-[6%] -bottom-[6%] grid size-[36%] place-items-center rounded-full text-white',
  kindIcon: 'size-[70%]',
} as const

/**
 * Setup drawer of a new golf game
 * @type {PlaySetupStyles}
 */

export const GOLF_SETUP = {
  ...setupStyles(SETUP_TURF),
  // Course cards: the map seen from above, no text
  courses: 'grid grid-cols-2 gap-3',
  course:
    'group relative aspect-video overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-field)] transition-[opacity,filter] hover:brightness-105',
  courseOff: 'opacity-55 saturate-50',
  courseShot: 'size-full object-cover',
  courseRandom: 'grid size-full place-items-center text-[var(--color-ink-subtle)]',
  courseRandomIcon: 'size-10',
  // Solid badge on the picked card
  courseMark:
    'absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-[var(--color-ink)] text-[var(--color-surface)]',
  courseMarkIcon: 'size-4',
  // Hidden canvas that draws the thumbnails
  shots: 'pointer-events-none fixed top-0 -left-[9999px]',
  powers: 'flex flex-col gap-5',
  powerGroup: 'flex flex-col gap-2',
  powerGroupTitle: 'text-xs font-extrabold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  powerList: 'grid gap-2 sm:grid-cols-2',
  // Orb card: tinted by its power, dull when off
  power:
    'relative flex items-start gap-3 rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--power)_14%,var(--color-field))] p-3 text-left transition-[filter,opacity] hover:brightness-95',
  powerOff: 'opacity-50 grayscale',
  powerOrb: 'size-12',
  powerText: 'flex min-w-0 flex-1 flex-col gap-0.5',
  powerKind: 'text-[0.65rem] leading-none font-black tracking-wide uppercase',
  powerKindBonus: 'text-[var(--play-golf-bonus)]',
  powerKindMalus: 'text-[var(--play-golf-malus)]',
  powerName: 'text-sm font-extrabold text-[var(--color-ink)]',
  powerEffect: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Vote after the rules: format, tournament length, course
 * @type {Record<string, string>}
 */

export const GOLF_VOTE = {
  root: 'golf-vote-root fixed inset-0 z-[80] overflow-y-auto bg-[var(--play-night)] text-white select-none',
  stage:
    'relative z-10 flex min-h-dvh flex-col items-center justify-center gap-16 px-4 pt-4 pb-8 sm:gap-28',
  head: 'flex flex-col items-center',
  title:
    'golf-plate golf-vote-title px-8 pt-2 pb-1 text-5xl leading-tight font-black tracking-tight text-[var(--play-golf-gold-light)] uppercase [text-shadow:0_3px_0_rgb(0_0_0/0.4)] sm:text-6xl',
  lead: 'golf-plate golf-vote-title px-8 py-2.5 text-center text-sm font-bold tracking-wide text-white uppercase sm:px-12 sm:text-xl',
  // Dark band behind the cards, flush to the screen
  deck: 'relative flex w-full flex-col items-center py-7 [--vote-card:clamp(5.25rem,11vw,11rem)] [--vote-gap:clamp(0.75rem,2.6vw,3.5rem)]',
  band: 'golf-vote-band absolute inset-x-0 inset-y-0 bg-[rgb(24_20_36/0.66)]',
  row: 'relative flex flex-wrap items-start justify-center gap-x-[var(--vote-gap)] gap-y-6 px-4',
  card: 'golf-vote-card group/card relative flex w-[var(--vote-card)] flex-col items-center gap-2 outline-none',
  face: 'relative grid aspect-square w-full place-items-center overflow-hidden bg-[var(--play-golf-vote-tile)] transition-[filter,translate] duration-150 group-hover/card:-translate-y-1 group-hover/card:brightness-110 group-focus-visible/card:ring-4 group-focus-visible/card:ring-white',
  faceOn: 'ring-4 ring-white',
  faceFramed: 'border-4 border-white',
  shot: 'size-full object-cover',
  glyph: 'size-[58%] text-[var(--play-golf-gold-light)] drop-shadow-[0_3px_0_rgb(0_0_0/0.3)]',
  number:
    'text-[calc(var(--vote-card)*0.52)] leading-none font-black text-white [text-shadow:0_4px_0_rgb(0_0_0/0.3)]',
  unit: 'absolute inset-x-0 bottom-[8%] text-center text-xs font-black tracking-widest text-white/80 uppercase',
  label:
    'text-center text-base font-black tracking-wide text-white uppercase [text-shadow:0_2px_0_rgb(0_0_0/0.45)] sm:text-2xl',
  strip:
    'w-full bg-[var(--play-golf-vote-strip)] px-2 py-1 text-center text-xs font-black tracking-wide text-white uppercase sm:text-base',
  // Avatar standing over the picked card
  avatarBox:
    'pointer-events-none absolute inset-x-0 bottom-full mb-2 flex flex-wrap items-end justify-center -space-x-1.5',
  avatarRing: 'shadow-[0_0.25rem_0_rgb(0_0_0/0.3)]',
  avatarName:
    'absolute top-full mt-1 text-xs font-black tracking-wide text-[var(--play-golf-gold-light)] uppercase [text-shadow:0_2px_0_rgb(0_0_0/0.5)]',
  timer:
    'golf-plate grid min-w-20 place-items-center px-5 py-1 text-4xl leading-none font-black tabular-nums text-[var(--play-golf-gold-light)]',
  timerLow: 'animate-pulse text-white',
  hint: 'golf-plate max-w-xl px-6 py-2 text-center text-sm font-bold text-white/90 sm:text-base',
  actions: 'flex flex-wrap items-center justify-center gap-3',
  button:
    'golf-plate min-h-12 px-8 text-base font-black tracking-wide text-white uppercase transition-[filter,translate] hover:-translate-y-0.5 hover:brightness-125 disabled:pointer-events-none disabled:opacity-50',
  buttonMain: 'bg-[var(--play-golf-vote-strip)]',
} as const

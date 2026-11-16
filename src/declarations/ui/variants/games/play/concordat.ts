import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { SETUP_INDIGO } from '@/declarations/ui/variants/games/play/shared'

/**
 * Setup drawer of a new Concordat game
 * @type {PlaySetupStyles}
 */

export const CONCORDAT_SETUP = setupStyles(SETUP_INDIGO)

/**
 * Pictures of the setup tiles: region silhouette and size dots
 * @type {Record<string, string>}
 */

export const CONCORDAT_SETUP_ART = {
  region:
    'block h-full w-full bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]',
  blurred: 'blur-[3px] opacity-70',
  random: 'relative grid size-full place-items-center',
  mark: 'absolute text-4xl leading-none font-black text-white [text-shadow:0_1px_8px_rgb(0_0_0/0.6)]',
  dots: 'grid gap-1',
  dot: 'size-1.5 rounded-full bg-current',
} as const

const BLOCK = 'play-hud-block'
const CAPTION =
  'text-[0.65rem] leading-none font-bold tracking-[0.2em] text-[var(--play-ink)] uppercase'
const BUTTON =
  'rounded-[0.15rem] px-2.5 py-1 text-xs font-bold tracking-wide uppercase transition-colors disabled:opacity-40'
const ON_BRASS = 'text-[var(--concordat-plate)]'

/**
 * Concordat map layer: table, canvas, tooltip and target menu
 * @type {Record<string, string>}
 */

export const CONCORDAT_BOARD = {
  root: 'concordat-table relative size-full touch-none overflow-hidden select-none',
  canvas: 'absolute inset-0 size-full',
  tooltip: `${BLOCK} pointer-events-none absolute z-30 flex max-w-60 flex-col gap-0.5 px-3 py-2 text-sm font-extrabold text-[var(--play-ink)]`,
  tooltipName: 'truncate text-base font-black',
  tooltipLine: 'text-xs font-bold tabular-nums text-[var(--play-ink-faint)]',
  menu: `${BLOCK} absolute z-30 flex w-60 flex-col gap-1 p-2`,
  menuHead: 'flex items-center gap-2 px-2 py-1.5',
  menuSwatch: 'size-3.5 shrink-0 rounded-[0.1rem]',
  menuName: 'min-w-0 flex-1 truncate text-base font-bold text-[var(--play-ink)]',
  menuTie: 'text-xs font-bold text-[var(--play-ink-faint)]',
  menuItem: `${BUTTON} text-left text-[var(--play-ink)] hover:bg-[var(--play-chip)]`,
  menuMain: `${BUTTON} bg-[var(--play-accent)] text-left ${ON_BRASS}`,
  waiting: 'grid size-full place-items-center text-lg font-bold text-[var(--concordat-card)]',
} as const

/**
 * Concordat HUD blocks laid over the map
 * @type {Record<string, string>}
 */

export const CONCORDAT_HUD = {
  // Bottom centre: one pill with figures, engagement and corps
  dock: 'pointer-events-none absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 max-md:bottom-[5.5rem]',
  pill: `${BLOCK} pointer-events-auto relative flex w-[min(50rem,calc(100vw-1.5rem))] flex-col gap-3 px-5 py-3.5 opacity-90 transition-opacity hover:opacity-100`,
  stats: 'flex items-baseline justify-between gap-3',
  stat: 'flex items-baseline gap-1.5',
  statFigure: 'text-sm leading-none font-bold tabular-nums text-[var(--play-ink)]',
  statCaption:
    'text-[0.55rem] leading-none font-bold tracking-[0.2em] text-[var(--play-ink-faint)] uppercase',
  row: 'flex items-center gap-3',
  minimap: `${BLOCK} pointer-events-auto relative overflow-hidden p-1.5`,
  minimapCanvas: 'block cursor-pointer rounded-[0.1rem]',
  // Top left: standings sidebar, keys row then the table
  standings:
    'pointer-events-none absolute top-4 left-5 z-20 flex max-w-[calc(100vw-2.5rem)] flex-col gap-1.5 max-md:hidden',
  standKeys: 'pointer-events-auto flex items-center gap-1',
  standKey: `${BLOCK} grid size-9 place-items-center text-[var(--play-ink)] transition-transform hover:-translate-y-0.5`,
  standKeyOn: `${BLOCK} grid size-9 place-items-center text-[var(--play-accent)]`,
  standPicker: `${BLOCK} pointer-events-auto flex w-44 flex-col gap-0.5 p-1.5`,
  standPick:
    'flex items-center justify-between gap-2 rounded-[0.15rem] px-2 py-1 text-left text-xs font-bold text-[var(--play-ink)] hover:bg-[var(--play-chip)]',
  standTable: `${BLOCK} pointer-events-auto flex flex-col overflow-hidden`,
  standScroll: 'max-h-[11rem] overflow-y-auto overscroll-contain',
  standRow:
    'grid cursor-pointer items-center gap-x-2.5 px-2.5 py-1 text-xs tabular-nums text-[var(--play-ink)] transition-colors hover:bg-[var(--play-chip)]',
  standHead:
    'grid items-center gap-x-2.5 border-b border-[var(--play-line)] px-2.5 py-1.5 text-[0.6rem] font-black tracking-[0.12em] uppercase text-[var(--play-ink-faint)]',
  standSortKey: 'cursor-pointer text-right hover:text-[var(--play-ink)]',
  standMine: 'font-black',
  standPinned: 'border-t border-[var(--play-line)] bg-[var(--play-chip)]',
  standName: 'flex min-w-0 items-center gap-1.5 font-bold',
  standCell: 'text-right',
  caption: CAPTION,
  percent: 'w-10 shrink-0 text-sm leading-none font-bold tabular-nums text-[var(--play-ink-soft)]',
  percentField:
    'flex shrink-0 items-center rounded-md bg-[var(--play-chip)] px-1.5 py-0.5 text-sm leading-none font-bold tabular-nums text-[var(--play-ink)]',
  percentInput: 'concordat-percent w-7 bg-transparent text-right',
  slider: 'concordat-slider min-w-0 flex-1 cursor-pointer',
  corpsKey: `${BUTTON} bg-[var(--play-chip)] py-1 text-xs text-[var(--play-ink)]`,
  corpsList: `${BLOCK} pointer-events-auto absolute right-0 bottom-full mb-2 flex w-full flex-col gap-1 p-3`,
  corps: 'flex max-h-[18dvh] flex-col gap-1 overflow-y-auto',
  corpsRow: 'flex items-center gap-2 text-sm font-extrabold text-[var(--play-ink)]',
  corpsName: 'min-w-0 flex-1 truncate',
  corpsTroops: 'tabular-nums text-[var(--play-ink-soft)]',
  swatch: 'size-3 shrink-0 rounded-[0.1rem]',
  retreat: `${BUTTON} bg-[var(--play-chip)] py-1 text-xs text-[var(--play-ink)]`,
  arms: 'flex items-center justify-between gap-1',
  arm: 'relative flex size-9 shrink-0 flex-col items-center justify-center gap-px rounded-[0.15rem] bg-[var(--play-chip)] text-[var(--play-ink)] transition-colors hover:bg-[var(--play-line)] disabled:opacity-40',
  armOn:
    'relative flex size-9 shrink-0 flex-col items-center justify-center gap-px rounded-[0.15rem] bg-[var(--play-accent)] text-[var(--concordat-plate)]',
  armTip:
    'pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-56 -translate-x-1/2 flex-col gap-1 rounded-[0.15rem] bg-[var(--concordat-plate)] px-3 py-2 text-xs font-bold text-[var(--concordat-khaki)] shadow-lg group-hover/arm:flex',
  armTipHead: 'flex items-center justify-between gap-3',
  armTipTitle: 'text-sm font-bold',
  armTipCost: 'inline-flex shrink-0 items-center gap-1 text-sm font-bold tabular-nums',
  armKey:
    'pointer-events-none absolute top-0.5 left-1 text-[0.55rem] leading-none font-extrabold tabular-nums opacity-60',
  ghost:
    'pointer-events-none fixed top-0 left-0 z-40 flex size-12 items-center justify-center rounded-[0.2rem] bg-[var(--play-accent)] text-[var(--concordat-plate)] opacity-90 shadow-lg',
  armCount:
    'pointer-events-none absolute top-0.5 right-1 text-[0.6rem] leading-none font-extrabold tabular-nums',
  armNote: 'text-[0.6rem] leading-none font-bold tabular-nums opacity-70',
  toolBar: `${BLOCK} pointer-events-auto flex items-center gap-3 px-4 py-2 text-sm font-bold text-[var(--play-ink)]`,
  // Under the keys, top right
  meter: `${BLOCK} pointer-events-none absolute top-[4.25rem] right-5 z-[5] flex w-44 flex-col gap-1 px-3 py-2 max-md:top-[calc(4.5rem+env(safe-area-inset-top))] max-md:right-3`,
  meterRow: 'flex items-baseline justify-between gap-3',
  meterFigure: 'text-sm leading-none font-bold tabular-nums text-[var(--play-ink)]',
  meterSlow: 'text-[var(--play-accent)]',
  meterNote: 'text-[0.65rem] leading-tight font-bold text-[var(--play-ink-soft)]',
  // Under the info card, centred
  notice:
    'pointer-events-none absolute top-[5.75rem] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 max-md:top-[5.5rem]',
  // Zone won, centred above the board
  zones:
    'pointer-events-none absolute top-[32%] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2',
  zone: `${BLOCK} concordat-zone-pop flex flex-col items-center gap-0.5 px-6 py-3 text-center`,
  zoneTitle: 'text-xl font-bold tracking-wide uppercase text-[var(--play-ink)]',
  zoneGold:
    'inline-flex items-center gap-1 text-sm font-bold tabular-nums text-[var(--play-value)]',
  pick: `${BLOCK} flex max-w-[28rem] flex-col items-center gap-1 px-5 py-3 text-center`,
  pickTitle: 'text-lg font-bold text-[var(--play-ink)]',
  pickHint: 'text-sm font-bold text-[var(--play-ink-faint)]',
  accept: `${BUTTON} bg-[var(--play-accent)] py-1 text-xs ${ON_BRASS}`,
  refuse: `${BUTTON} bg-[var(--play-chip)] py-1 text-xs text-[var(--play-ink)]`,
} as const

/**
 * Concordat result: podium
 * @type {Record<string, string>}
 */

export const CONCORDAT_RESULT = {
  root: 'flex min-h-0 w-full flex-1 flex-col items-center justify-center',
} as const

/**
 * Card of the nation under the pointer, centred under the clock
 * @type {Record<string, string>}
 */

export const CONCORDAT_HOVER = {
  card: `${BLOCK} pointer-events-none absolute top-3 left-1/2 z-20 flex w-[min(64rem,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 px-3 py-2 max-md:hidden`,
  right: 'flex min-w-0 flex-1 flex-col justify-center gap-0.5',
  gold: 'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[0.3rem] border border-[var(--play-value)] px-3 text-base font-black tabular-nums text-[var(--play-value)]',
  sending: 'shrink-0 text-sm font-black tabular-nums text-[var(--play-ink-soft)]',
  bar: 'relative h-9 w-48 shrink-0 overflow-hidden rounded-[0.3rem] bg-[var(--play-chip)]',
  barFill: 'absolute inset-y-0 left-0 bg-[var(--play-accent)] opacity-80',
  barPush: 'absolute inset-y-0 bg-[var(--play-ink)] opacity-35',
  barText:
    'relative flex h-full items-center justify-center gap-1.5 text-sm font-black tabular-nums text-[var(--play-ink)]',
  nameRow: 'flex min-w-0 items-baseline gap-2',
  swatch: 'size-3 shrink-0 self-center rounded-[0.1rem]',
  name: 'min-w-0 truncate text-xl font-black text-[var(--play-ink)]',
  faint: 'truncate text-xs font-bold text-[var(--play-ink-faint)]',
  tieWar: 'text-xs font-bold text-[var(--play-ink-faint)]',
  tiePeace: 'text-xs font-bold text-[var(--play-ink-soft)]',
  tieAlly: 'text-xs font-black text-[var(--play-accent)]',
  badges: 'flex shrink-0 gap-1.5',
  badge:
    'inline-flex h-9 min-w-14 items-center justify-center gap-1.5 rounded-[0.3rem] border border-[var(--play-ink-faint)] px-2.5 text-sm font-bold tabular-nums text-[var(--play-ink-soft)]',
} as const

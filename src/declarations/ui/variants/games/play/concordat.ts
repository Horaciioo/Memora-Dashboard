import { setupStyles } from '@/declarations/ui/variants/games/play/boards'
import { SETUP_INDIGO } from '@/declarations/ui/variants/games/play/shared'

/**
 * Setup drawer of a new Concordat game
 * @type {PlaySetupStyles}
 */

export const CONCORDAT_SETUP = setupStyles(SETUP_INDIGO)

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
  pill: `${BLOCK} pointer-events-auto relative flex w-[min(32rem,calc(100vw-1.5rem))] flex-col gap-3 px-5 py-3.5 opacity-90 transition-opacity hover:opacity-100`,
  stats: 'flex items-baseline justify-between gap-3',
  stat: 'flex items-baseline gap-1.5',
  statFigure: 'text-sm leading-none font-bold tabular-nums text-[var(--play-ink)]',
  statCaption:
    'text-[0.55rem] leading-none font-bold tracking-[0.2em] text-[var(--play-ink-faint)] uppercase',
  row: 'flex items-center gap-3',
  minimap: `${BLOCK} pointer-events-auto relative overflow-hidden p-1.5`,
  minimapCanvas: 'block cursor-pointer rounded-[0.1rem]',
  ranking: 'pointer-events-none absolute top-20 right-7 z-20 w-72 max-md:hidden',
  caption: CAPTION,
  percent: 'w-10 shrink-0 text-sm leading-none font-bold tabular-nums text-[var(--play-ink-soft)]',
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
  armTipTitle: 'text-sm font-bold',
  armKey:
    'pointer-events-none absolute top-0.5 left-1 text-[0.55rem] leading-none font-extrabold tabular-nums opacity-60',
  ghost:
    'pointer-events-none fixed top-0 left-0 z-40 flex size-12 items-center justify-center rounded-[0.2rem] bg-[var(--play-accent)] text-[var(--concordat-plate)] opacity-90 shadow-lg',
  armNote: 'text-[0.6rem] leading-none font-bold tabular-nums opacity-70',
  toolBar: `${BLOCK} pointer-events-auto flex items-center gap-3 px-4 py-2 text-sm font-bold text-[var(--play-ink)]`,
  // Under the info card, centred
  notice:
    'pointer-events-none absolute top-[5.75rem] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 max-md:top-[5.5rem]',
  // Zone won, centred above the board
  zones:
    'pointer-events-none absolute top-[32%] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2',
  zone: `${BLOCK} concordat-zone-pop flex flex-col items-center gap-0.5 px-6 py-3 text-center`,
  zoneTitle: 'text-xl font-bold tracking-wide uppercase text-[var(--play-ink)]',
  zoneGold: 'text-sm font-bold tabular-nums text-[var(--play-value)]',
  threat: `${BLOCK} px-4 py-2 text-sm font-bold text-[var(--play-ink)]`,
  pick: `${BLOCK} flex max-w-[28rem] flex-col items-center gap-1 px-5 py-3 text-center`,
  pickTitle: 'text-lg font-bold text-[var(--play-ink)]',
  pickHint: 'text-sm font-bold text-[var(--play-ink-faint)]',
  offers: `${BLOCK} pointer-events-auto flex max-w-[26rem] flex-col gap-1.5 p-3`,
  offer: 'flex items-center gap-2 text-sm font-extrabold text-[var(--play-ink)]',
  offerText: 'min-w-0 flex-1',
  accept: `${BUTTON} bg-[var(--play-accent)] py-1 text-xs ${ON_BRASS}`,
  refuse: `${BUTTON} bg-[var(--play-chip)] py-1 text-xs text-[var(--play-ink)]`,
} as const

/**
 * Concordat result: podium then the history of the game
 * @type {Record<string, string>}
 */

export const CONCORDAT_RESULT = {
  root: 'flex min-h-0 w-full flex-1 flex-col items-center justify-center',
  under:
    'flex w-full max-w-4xl shrink-0 flex-col items-center gap-[clamp(0.3rem,1dvh,0.6rem)] px-4 pb-[clamp(0.5rem,2dvh,1.25rem)]',
  caption: 'text-xs font-extrabold tracking-wide text-[var(--play-ink-faint)] uppercase',
  hint: 'text-xs font-bold text-[var(--play-ink-faint)]',
  timeline: `${BLOCK} h-[clamp(7rem,20dvh,13rem)] w-full p-3`,
  svg: 'size-full overflow-visible',
} as const

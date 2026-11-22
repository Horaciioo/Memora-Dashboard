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
  emojis: 'grid grid-cols-8 gap-0.5 px-1 pt-1',
  emoji:
    'grid aspect-square place-items-center rounded-[0.15rem] text-base hover:bg-[var(--play-chip)]',
  waiting: 'grid size-full place-items-center text-lg font-bold text-[var(--concordat-card)]',
} as const

/**
 * Concordat HUD blocks laid over the map
 * @type {Record<string, string>}
 */

export const CONCORDAT_HUD = {
  // Bottom centre: one pill with figures, engagement and corps
  dock: 'pointer-events-none absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 max-md:bottom-1.5',
  pill: `${BLOCK} pointer-events-auto relative flex w-[min(56rem,calc(100vw-1rem))] flex-col gap-3 px-5 py-3.5 opacity-90 max-md:gap-1.5 max-md:px-2.5 max-md:py-2 transition-opacity hover:opacity-100`,
  troopRow: 'flex items-stretch gap-2',
  troopRate:
    'flex h-8 shrink-0 items-center gap-1.5 rounded-[0.3rem] bg-[var(--play-chip)] px-2.5 text-sm leading-none font-black tabular-nums text-[var(--play-ink)] shadow-[inset_0_0_0_0.07rem_var(--play-line)]',
  troopBar:
    'relative flex min-w-0 flex-1 h-8 items-center justify-center overflow-hidden rounded-[0.3rem] bg-[var(--play-chip)] shadow-[inset_0_0_0_0.07rem_var(--play-line)]',
  troopFill:
    'absolute inset-y-0 left-0 bg-[var(--concordat-push)] transition-[width] duration-300 ease-linear',
  troopText:
    'relative flex items-center gap-2 text-base leading-none font-black tabular-nums text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]',
  stats: 'flex items-baseline justify-between gap-3 max-md:gap-1.5',
  stat: 'flex items-baseline gap-1.5 max-md:gap-1',
  statFigure:
    'text-sm leading-none font-bold whitespace-nowrap tabular-nums text-[var(--tone,var(--play-ink))] max-md:text-[0.6rem]',
  statRate: 'max-md:hidden',
  statCaption:
    'text-[0.55rem] leading-none font-bold tracking-[0.2em] text-[var(--play-ink-faint)] uppercase max-md:text-[0.45rem] max-md:tracking-widest',
  row: 'flex items-center gap-3 max-md:gap-2',
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
    'flex shrink-0 items-center rounded-md bg-[var(--play-chip)] px-1.5 py-0.5 text-sm max-md:text-[0.6rem] leading-none font-bold tabular-nums text-[var(--play-ink)]',
  percentInput: 'concordat-percent w-7 bg-transparent text-right',
  percentSent: 'ml-1.5 min-w-[3.5rem] whitespace-nowrap text-[var(--play-ink-soft)]',
  slider: 'concordat-slider min-w-0 flex-1 cursor-pointer',
  corpsKey: `${BUTTON} bg-[var(--play-chip)] py-1 text-xs text-[var(--play-ink)]`,
  corpsList: `${BLOCK} pointer-events-auto absolute right-0 bottom-full mb-2 flex w-full flex-col gap-1 p-3`,
  corps: 'flex max-h-[18dvh] flex-col gap-1 overflow-y-auto',
  corpsRow: 'flex items-center gap-2 text-sm font-extrabold text-[var(--play-ink)]',
  corpsName: 'min-w-0 flex-1 truncate',
  corpsTroops: 'tabular-nums text-[var(--play-ink-soft)]',
  swatch: 'size-3 shrink-0 rounded-[0.1rem]',
  retreat: `${BUTTON} bg-[var(--play-chip)] py-1 text-xs text-[var(--play-ink)]`,
  arms: 'flex items-center justify-between gap-1 max-md:justify-start max-md:overflow-x-auto max-md:overscroll-x-contain max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden',
  arm: 'relative flex size-9 max-md:size-8 shrink-0 flex-col items-center justify-center gap-px rounded-[0.15rem] bg-[var(--play-chip)] text-[var(--play-ink)] transition-colors hover:bg-[var(--play-line)] disabled:opacity-40',
  armOn:
    'relative flex size-9 max-md:size-8 shrink-0 flex-col items-center justify-center gap-px rounded-[0.15rem] bg-[var(--concordat-gold)] text-[var(--concordat-plate)]',
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
  armNote:
    'text-[0.6rem] max-md:text-[0.5rem] leading-none font-bold tabular-nums opacity-70',
  toolBar: `${BLOCK} pointer-events-auto flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[var(--play-ink)]`,
  // Under the keys, top right
  meter: `${BLOCK} pointer-events-none absolute top-[4.25rem] right-5 z-[5] flex w-44 flex-col gap-1 px-3 py-2 max-md:top-[calc(4.5rem+env(safe-area-inset-top))] max-md:right-3`,
  meterRow: 'flex items-baseline justify-between gap-3',
  meterFigure: 'text-sm leading-none font-bold tabular-nums text-[var(--play-ink)]',
  meterSlow: 'text-[var(--play-accent)]',
  meterNote: 'text-[0.65rem] leading-tight font-bold text-[var(--play-ink-soft)]',
  // Under the info card, centred
  notice:
    'pointer-events-none absolute top-[5.75rem] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 max-md:top-[calc(0.75rem+env(safe-area-inset-top))] max-md:left-3 max-md:translate-x-0 max-md:items-start',
  shield: `${BLOCK} flex items-center gap-1.5 px-2 py-1 text-[0.65rem] leading-none font-bold tabular-nums text-[var(--play-ink)]`,
  // Attacks against me, under the info card
  alarm: 'concordat-alarm pointer-events-none absolute inset-0 z-10',
  alarmFlash: 'concordat-alarm-flash pointer-events-none absolute inset-0 z-10',
  // Glued to the pill, icon keys only
  lines:
    'pointer-events-none flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center justify-center gap-1.5',
  threats: 'contents',
  threat: `${BLOCK} concordat-alert-in pointer-events-auto flex items-center gap-2 bg-[color-mix(in_srgb,var(--concordat-alarm)_30%,var(--concordat-plate))]! px-2.5 py-1.5 text-xs font-bold tabular-nums text-[#ff8f84] shadow-[0_0_0_0.1rem_var(--concordat-alarm)]`,
  threatName: 'max-w-28 truncate',
  threatFigure: 'min-w-8 text-right',
  threatKey:
    'grid size-6 place-items-center rounded-[0.15rem] bg-[var(--play-chip)] text-[var(--play-ink)] active:bg-[var(--concordat-alarm)] active:text-white',
  threatIcon: 'size-3.5',
  // Start timer: a thin bar across the top, a line under the info card
  timerBar: 'pointer-events-none fixed inset-x-0 top-0 z-30 h-1.5 bg-[var(--play-chip)]/60',
  timerFill: 'h-full bg-[var(--play-accent)] transition-[width] duration-200 ease-linear',
  // Outgoing pushes, a strip above the pill
  fronts: 'contents',
  front: `${BLOCK} pointer-events-auto flex items-center gap-2 bg-[color-mix(in_srgb,var(--concordat-push)_24%,var(--concordat-plate))]! px-2.5 py-1.5 text-xs font-bold text-[#a9d0ff] shadow-[0_0_0_0.1rem_var(--concordat-push)]`,
  frontName: 'max-w-28 truncate',
  frontTroops: 'min-w-8 text-right tabular-nums',
  frontCancel: `${BUTTON} bg-[var(--play-chip)] px-1.5 py-0.5 text-[var(--play-ink)]`,
  gain: 'concordat-alert-in ml-1 text-sm font-bold tabular-nums text-[var(--play-value)]',
  // Zone won, centred above the board, small top left on mobile
  zones:
    'pointer-events-none absolute top-[32%] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 max-md:top-[calc(3.5rem+env(safe-area-inset-top))] max-md:left-3 max-md:max-w-[calc(100vw-8rem)] max-md:translate-x-0 max-md:items-start max-md:gap-1',
  zone: `${BLOCK} concordat-zone-pop flex flex-col items-center gap-0.5 px-6 py-3 text-center max-md:items-start max-md:px-2 max-md:py-1 max-md:text-left`,
  zoneTitle:
    'text-xl font-bold tracking-wide uppercase text-[var(--play-ink)] max-md:text-[0.65rem] max-md:leading-tight',
  zoneGold:
    'inline-flex items-center gap-1 text-sm font-bold tabular-nums text-[var(--play-value)] max-md:text-[0.65rem]',
  pick: `${BLOCK} flex max-w-[18rem] flex-col items-center gap-0.5 px-3 py-1.5 text-center`,
  pickTitle: 'text-sm font-bold text-[var(--play-ink)]',
  pickHint: 'text-xs font-bold text-[var(--play-ink-faint)] max-md:text-[0.6rem]',
  // Bottom right above the chat: one tinted card per proposal, the tone says the kind
  offers:
    'pointer-events-none absolute right-5 bottom-[15.5rem] z-30 flex w-72 flex-col gap-2 max-md:right-3 max-md:bottom-[9rem] max-md:w-60',
  offer: `${BLOCK} concordat-offer-in pointer-events-auto relative flex flex-col gap-2.5 overflow-hidden bg-[color-mix(in_srgb,var(--tone)_22%,var(--concordat-plate))]! px-3.5 py-3 shadow-[0_0_0_0.12rem_var(--tone),0_0.4rem_1rem_rgb(8_16_18/0.5)]!`,
  offerKind: 'text-[0.6rem] leading-none font-black tracking-[0.2em] uppercase text-[var(--tone)]',
  offerText: 'text-sm leading-snug font-bold text-[var(--tone)]',
  offerName: 'font-black text-white',
  offerActions: 'flex gap-2',
  offerBar: 'absolute inset-x-0 bottom-0 h-1 bg-black/30',
  offerFill: 'h-full bg-[var(--tone)]',
  accept: `${BUTTON} bg-[var(--concordat-ok)] py-1.5 text-xs ${ON_BRASS}`,
  refuse: `${BUTTON} bg-[var(--concordat-alarm)] py-1.5 text-xs text-white`,
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
  tieAlly: 'text-xs font-black text-[var(--play-accent)]',
  badges: 'flex shrink-0 gap-1.5',
  badge:
    'inline-flex h-9 min-w-14 items-center justify-center gap-1.5 rounded-[0.3rem] border border-[var(--play-ink-faint)] px-2.5 text-sm font-bold tabular-nums text-[var(--play-ink-soft)]',
} as const

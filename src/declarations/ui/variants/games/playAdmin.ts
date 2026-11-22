const CARD = 'rounded-[var(--radius-lg)] bg-play-nest'
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-[var(--play-key)]'
const LABEL = 'text-micro font-bold tracking-wide text-[var(--play-ink-faint)] uppercase'

/**
 * Play administration: pages, player list, player file
 * @type {Record<string, string>}
 */

export const PLAY_ADMIN = {
  // Own room: sidebar on the left, the page beside it
  room: 'relative z-10 flex min-h-0 w-full flex-1 md:gap-3 md:p-3',
  side: 'hidden w-64 shrink-0 flex-col gap-1 overflow-y-auto rounded-2xl border border-[var(--play-line)] bg-play-shade p-3 md:flex',
  sideTitle: 'px-3 pt-3 pb-2 text-lg font-extrabold tracking-tight text-[var(--play-ink)]',
  sideBack: `flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[var(--play-ink-soft)] transition-colors hover:bg-play-nest hover:text-[var(--play-ink)] ${FOCUS}`,
  sideRule: 'my-2 h-px bg-[var(--play-line)]',
  sideItem: `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[var(--play-ink-soft)] transition-colors hover:bg-play-nest hover:text-[var(--play-ink)] ${FOCUS}`,
  sideItemOn: 'bg-play-press text-[var(--play-ink)]',
  sideIcon: 'size-5 shrink-0',
  main: 'relative z-10 flex min-h-0 min-w-0 flex-1 flex-col gap-8 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pt-6 pb-10 sm:px-8 md:rounded-2xl md:border md:border-[var(--play-line)] md:bg-play-shade md:pt-8 xl:px-12',
  // Way out on a phone, where the sidebar is hidden
  phoneBack: `inline-flex w-fit items-center gap-2 text-sm font-bold text-[var(--play-ink-soft)] md:hidden ${FOCUS}`,
  // Pages of the administration on a phone, the rail being hidden
  phoneTabs:
    'mx-auto flex w-full max-w-2xl gap-1 overflow-x-auto rounded-[var(--radius-lg)] bg-play-nest p-1 md:hidden',
  phoneTab: `flex min-h-10 shrink-0 items-center justify-center rounded-xl px-3 text-sm font-bold text-[var(--play-ink-soft)] transition-colors hover:bg-play-nest hover:text-[var(--play-ink)] ${FOCUS}`,
  phoneTabOn: 'bg-play-press text-[var(--play-ink)]',
  // Figures of the board
  totals: 'grid grid-cols-2 gap-3 sm:grid-cols-4',
  total: `${CARD} flex min-w-0 flex-col gap-1 px-4 py-3`,
  totalValue: 'truncate text-2xl leading-none font-bold tabular-nums',
  totalLabel: LABEL,
  // Search and the two menus
  toolbar: 'grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]',
  toolbarAction: 'flex justify-end',
  skeleton: `${CARD} h-16 w-full animate-pulse motion-reduce:animate-none`,
  skeletons: 'flex flex-col gap-3',
  // One box per creator
  groups: 'flex flex-col gap-3',
  group: `${CARD} flex flex-col`,
  groupHead: `flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] p-3 text-left transition-colors hover:bg-play-nest ${FOCUS}`,
  groupName: 'min-w-0 flex-1 truncate text-lg font-bold tracking-tight',
  groupNote: 'shrink-0 text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
  groupChevron:
    'size-5 shrink-0 text-[var(--play-ink-soft)] transition-transform duration-300 ease-out motion-reduce:transition-none',
  groupChevronOpen: 'rotate-180',
  groupFold:
    'grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
  groupFoldOpen:
    'grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
  groupClip: 'min-h-0 overflow-hidden',
  groupBody:
    'flex flex-col gap-4 px-3 pb-3 opacity-0 -translate-y-2 transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none',
  groupBodyOpen:
    'flex flex-col gap-4 px-3 pb-3 opacity-100 translate-y-0 transition-[opacity,translate] delay-100 duration-400 ease-out motion-reduce:transition-none',
  sections: 'flex flex-col gap-4',
  section: 'flex flex-col gap-2',
  sectionHeading: LABEL,
  grid: 'grid grid-cols-1 gap-2 sm:grid-cols-2',
  // Player row
  card: `${CARD} flex min-h-14 w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-play-press ${FOCUS}`,
  cardChosen: 'bg-play-press ring-2 ring-[var(--play-ink-soft)]',
  cardText: 'flex min-w-0 flex-1 flex-col',
  cardName: 'truncate text-sm font-bold',
  cardNote: 'truncate text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
  cardOnline: 'shrink-0 text-xs font-bold text-[var(--play-gold-ink)]',
  cardBanned: 'shrink-0 text-xs font-bold text-[var(--play-alert)]',
  // Gestures on the chosen players
  bulk: 'sticky bottom-3 z-10 flex flex-wrap items-center gap-2 rounded-2xl bg-[var(--play-panel-strong)] px-4 py-3 shadow-[var(--shadow-lg)]',
  bulkCount: 'mr-auto text-sm font-bold',
  // Player file
  back: `inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[var(--play-ink-soft)] transition-colors hover:bg-play-nest hover:text-[var(--play-ink)] ${FOCUS}`,
  backGlyph: 'size-4 shrink-0',
  heroMeta: 'flex flex-wrap items-center gap-3',
  heroBanned: 'text-sm font-bold text-[var(--play-alert)]',
  heroNow: 'text-sm font-semibold text-[var(--play-ink-soft)]',
  id: `${CARD} flex w-full items-center gap-2 px-3 py-2 text-left font-[family-name:var(--font-mono)] text-xs break-all text-[var(--play-ink-soft)] transition-colors hover:bg-play-press hover:text-[var(--play-ink)] ${FOCUS}`,
  idText: 'min-w-0 flex-1',
  idGlyph: 'size-4 shrink-0',
  // Sections of the file, two columns on desktop
  cols: 'grid items-start gap-10 lg:grid-cols-2 lg:gap-x-8',
  cell: 'min-w-0',
  scope: 'w-full sm:w-64',
  // Progress rows
  progress: 'flex flex-col gap-2',
  progressRow: `${CARD} flex w-full flex-col gap-2 p-3 text-left transition-colors hover:bg-play-press ${FOCUS}`,
  progressHead: 'flex items-center gap-3',
  progressLogo: 'size-9 shrink-0',
  progressName: 'min-w-0 flex-1 truncate text-sm font-bold',
  progressLevel: 'text-sm font-bold tabular-nums',
  progressTrack: 'h-2 overflow-hidden rounded-full bg-[var(--play-track)]',
  progressFill: 'h-full rounded-full bg-[var(--play-key)]',
  progressFoot:
    'flex items-baseline justify-between gap-3 text-xs font-semibold tabular-nums text-[var(--play-ink-soft)]',
  progressOff: 'opacity-60',
  record: 'flex items-center gap-2',
  win: 'font-bold text-[var(--play-golf)]',
  draw: 'font-bold text-[var(--play-gold-ink)]',
  loss: 'font-bold text-[var(--play-alert)]',
  // Gestures
  cells: 'grid gap-3 sm:grid-cols-2',
  cellBox: `${CARD} flex flex-col items-start gap-2 p-3`,
  cellNote: 'text-sm text-[var(--play-ink-soft)]',
  note: 'text-sm font-semibold text-[var(--play-ink-soft)]',
  // Controls: a game, a boost, a setting
  list: 'flex flex-col gap-2',
  control: `${CARD} flex flex-wrap items-center gap-3 p-3`,
  controlLogo: 'size-11 shrink-0',
  controlText: 'flex min-w-0 flex-1 flex-col gap-0.5',
  controlName: 'truncate text-base font-bold',
  controlNote: 'text-sm font-semibold text-[var(--play-ink-soft)]',
  controlOn: 'font-bold text-[var(--play-golf)]',
  controlOff: 'font-bold text-[var(--play-alert)]',
  controlTools: 'flex shrink-0 items-center gap-3',
  star: `grid size-10 cursor-pointer place-items-center rounded-xl text-[var(--play-ink-faint)] transition-colors hover:bg-play-press hover:text-[var(--play-gold)] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`,
  starOn: 'text-[var(--play-gold)]',
  starIcon: 'size-5',
  counter: 'text-sm font-bold text-[var(--play-ink-soft)] tabular-nums',
  boosts: 'grid gap-3 lg:grid-cols-2',
  boost: `${CARD} flex flex-col gap-4 p-5`,
  boostHead: 'flex items-start justify-between gap-3',
  boostTitle: 'text-lg font-extrabold tracking-tight',
  boostValue: 'text-5xl leading-none font-extrabold tracking-tight tabular-nums',
  boostState: 'text-sm font-bold text-[var(--play-ink-soft)]',
  boostGames: 'flex flex-wrap gap-2',
  boostGame: 'flex items-center gap-2 rounded-xl bg-play-press px-2.5 py-1.5 text-sm font-bold',
  boostLogo: 'size-6 shrink-0',
  boostActions: 'flex flex-wrap items-center gap-3',
} as const

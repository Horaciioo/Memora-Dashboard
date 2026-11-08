import { BOARD_STYLES, PICK_RING, SELECTION_BAR } from '@/declarations/ui/variants/data/tables'

/**
 * Planning styles
 * @type {Record<string, string>}
 */

export const CALENDAR_AGENDA = {
  list: 'flex flex-col divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface px-3 sm:px-5',
  empty: 'py-16 text-center text-sm text-[var(--color-ink-subtle)]',
  day: 'grid grid-cols-1 gap-2 py-4 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-4 sm:py-5',
  head: 'flex items-start gap-3',
  number:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold tabular-nums',
  numberToday: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  weekday:
    'flex flex-col pt-0.5 text-micro leading-tight font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  month: 'font-semibold normal-case first-letter:uppercase',
  rows: 'flex flex-col',
  row: 'flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-2 py-2.5 sm:gap-4 sm:px-3 text-left transition-colors hover:bg-[var(--color-hover)]',
  rowSelected: 'ring-2 ring-[var(--color-pick)] ring-inset',
  bullet: 'h-2 w-2 shrink-0 rounded-full bg-current',
  time: 'w-16 shrink-0 text-sm sm:w-24 text-[var(--color-ink-subtle)] tabular-nums',
  title: 'min-w-0 flex-1 truncate text-sm font-semibold',
  meta: 'hidden shrink-0 text-sm text-[var(--color-ink-subtle)] md:inline',
} as const

/**
 * Mobile calendar header and month styles
 * @type {Record<string, string>}
 */

export const CALENDAR_MOBILE = {
  bar: 'flex flex-col gap-3 pb-3 md:hidden',
  row: 'flex items-center gap-2',
  title:
    'flex min-h-11 w-full min-w-0 items-center gap-1.5 text-left text-xl font-bold tracking-tight first-letter:uppercase sm:text-2xl',
  caret: 'size-5 shrink-0 text-[var(--color-ink-subtle)] transition-transform',
  caretOpen: 'rotate-180',
  views:
    'absolute top-full left-0 z-40 mt-1 flex w-52 flex-col divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
  view: 'flex min-h-11 items-center px-4 text-left text-sm font-medium transition-colors hover:bg-[var(--color-hover)]',
  viewActive: 'text-[var(--color-ink-accent)] font-bold',
  scrim: 'fixed inset-0 z-30',
  today:
    'touch-target flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border-2 border-[var(--color-ink)] text-sm font-bold tabular-nums',
  creator: '!w-auto shrink-0 rounded-full border-0 p-0.5',
  // Week of a phone month: bars of the periods lie under the day numbers
  lanes: 'pointer-events-none absolute inset-x-0 top-7 z-[3] grid auto-rows-5 gap-y-0.5 md:hidden',
  lane: 'pointer-events-auto chip-solid truncate px-1 text-left text-micro font-semibold leading-5',
  laneOpens: 'ml-0.5 rounded-l-[var(--radius-sm)]',
  laneCloses: 'mr-0.5 rounded-r-[var(--radius-sm)]',
  // Gap kept under the day number for the bars of the week
  laneSpacer: 'shrink-0 md:hidden',
  // Sheet of a touched day
  sheetTitle: 'text-lg font-bold first-letter:uppercase',
  sheetBody: 'flex flex-col gap-4',
  // One dot per entry of a day, wrapped under its number
  dots: 'flex flex-wrap justify-center gap-1 px-0.5',
  dot: 'size-2 rounded-full bg-[var(--accent-mobile)]',
  // Dots standing for the entries that do not fit
  overflow: 'text-center text-xs leading-none tracking-widest text-[var(--color-ink-subtle)]',
} as const

/**
 * Calendar side rail styles
 * @type {Record<string, string>}
 */

export const CALENDAR_SIDEBAR = {
  // Filters button of the screens without a sidebar
  trigger: 'md:hidden',
  triggerActive: '!border-[var(--color-brand-600)] !text-[var(--color-ink-accent)]',
  sheetBody: 'flex flex-col gap-6',
  // Sidebar version
  panel: 'flex min-h-0 w-full flex-1 flex-col gap-5 overflow-y-auto px-4 pt-5 pb-4',
  toggle:
    'flex w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm font-semibold',
  mini: 'flex flex-col gap-2',
  miniHead: 'flex items-center justify-between gap-2',
  miniTitle: 'min-w-0 flex-1 pl-2 text-sm font-bold first-letter:uppercase',
  miniSteps: 'flex shrink-0 items-center',
  miniStep:
    'flex size-7 items-center justify-center text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  miniStepIcon: 'size-4',
  miniGrid: 'grid grid-cols-7 gap-y-0.5 text-center',
  miniWeekday: 'py-1 text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  miniDay:
    'mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors hover:bg-[var(--color-hover)]',
  miniDayOutside: 'text-[var(--color-ink-subtle)]',
  miniDayToday:
    'day-blink bg-[var(--page-surface-raised)] text-[var(--page-ink)] shadow-[var(--shadow-sm)] hover:bg-[var(--page-surface-raised)]',
  miniDayInRange: 'bg-[var(--page-surface-raised)] text-[var(--page-ink)]',
  miniDayPicked:
    'bg-[var(--page-surface-raised)] text-[var(--page-ink)] hover:bg-[var(--page-surface-raised)]',
  group: 'flex flex-col gap-px',
  groupTitle:
    'px-3 pb-2 text-caption font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  row: 'flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2 text-left text-body font-medium transition-colors hover:bg-[var(--color-surface)]',
  rowLabel: 'min-w-0 flex-1 truncate',
  mark: 'flex size-6 shrink-0 items-center justify-center',
  markOff: 'opacity-45 grayscale',
  // A selected row fades from a light green wash into the ground
  rowOn:
    'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-success)_16%,transparent),transparent)] font-semibold text-[var(--color-ink)]',
  // A switched off row reads in retreat
  rowOff: 'text-[var(--color-ink-subtle)]',
  rowGlyph: 'size-5 shrink-0 opacity-70',
  // A selected calendar turns its glyph green
  rowGlyphOn: 'text-[color-mix(in_srgb,var(--color-success)_70%,black)] opacity-100',
  // Bar standing where the global search stands
  searchBar:
    'glass-panel flex w-full items-center gap-2.5 rounded-[var(--radius-lg)] border px-3.5 py-3 text-[var(--color-ink-subtle)] focus-within:text-[var(--color-ink)]',
  searchInput:
    'min-w-0 flex-1 bg-transparent text-body text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-subtle)]',
  search:
    'w-full rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3 py-2 text-sm text-[var(--color-on-field)] outline-none placeholder:text-[var(--color-on-field-subtle)] focus:border-[var(--color-field-border-strong)]',
} as const

/**
 * Calendar detail modal styles
 * @type {Record<string, string>}
 */

export const CALENDAR_DETAIL = {
  slotPicks: 'grid grid-cols-3 gap-2 sm:grid-cols-4',
  slotPick:
    'cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-sm font-semibold tabular-nums transition-colors hover:bg-[var(--color-hover)]',
  body: 'flex flex-col gap-6',
  heroSpan:
    'text-center text-section font-medium tracking-tight text-[var(--color-ink)] first-letter:uppercase [&>strong]:font-bold',
  rule: 'h-px w-full bg-[var(--color-border)]',
  facts: 'flex flex-col gap-1.5 text-sm text-[var(--color-ink-subtle)]',
  section: 'flex flex-col gap-3',
  // Names land one after the other once the card is ready
  rollItem:
    'translate-y-1 opacity-0 transition-[opacity,translate] duration-[var(--motion-duration-panel)] ease-out motion-reduce:transition-none group-data-[ready=true]/roll:translate-y-0 group-data-[ready=true]/roll:opacity-100 group-data-[ready=true]/roll:delay-[calc(var(--i)*70ms)]',
  // Tinted tile in the accent, like a task column
  tile: `${BOARD_STYLES.columnTint} flex flex-col gap-3 rounded-[var(--radius-md)] p-3`,
  card: 'flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4',
  answer: 'flex flex-wrap gap-2',
  answered: 'flex items-center justify-center gap-2 text-center text-sm',
  // Small way back under the answer
  changeMind:
    'cursor-pointer text-xs text-[var(--color-ink-subtle)] underline underline-offset-2 transition-colors hover:text-[var(--color-ink)]',
  columns: 'flex flex-col gap-3',
  divider: 'flex justify-center border-t border-[var(--color-border)] pt-4',
  // Content left, divider, roll-call right
  split: 'grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
  splitDivider: 'h-px w-full bg-[var(--color-border)] md:h-auto md:w-px',
  main: 'flex min-w-0 flex-col gap-6',
  none: 'text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Calendar grid styles
 * @type {Record<string, string>}
 */

export const CALENDAR_STYLES = {
  // A phone lays the grid edge to edge, bare
  frame:
    '-mx-4 overflow-hidden sm:-mx-6 md:mx-0 md:rounded-[var(--radius-lg)] md:border md:border-[var(--color-border)] md:card-surface',
  toolbar: 'hidden pb-3 md:flex md:flex-row md:flex-wrap md:items-center md:justify-between',
  toolbarMain: 'flex items-center gap-2',
  toolbarTools: 'flex items-center gap-2',
  period:
    'order-3 min-w-0 flex-1 truncate text-center text-lg font-bold tracking-tight first-letter:uppercase md:order-none md:flex-none md:text-left md:text-2xl',
  weekdays:
    'border-b border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  weekdaysMonth: 'grid grid-cols-7',
  weekdaysTimed: 'grid',
  // Hour gutter
  columnsDay: 'grid-cols-[2.75rem_minmax(0,1fr)] md:grid-cols-[4rem_minmax(0,1fr)]',
  columnsThreeDays:
    'grid-cols-[2.75rem_repeat(3,minmax(0,1fr))] md:grid-cols-[4rem_repeat(3,minmax(0,1fr))]',
  columnsWeek:
    'grid-cols-[2.75rem_repeat(7,minmax(0,1fr))] md:grid-cols-[4rem_repeat(7,minmax(0,1fr))]',
  weekday: 'px-0.5 py-2 text-center md:px-2',
  weekdayHead: 'flex flex-col items-center gap-1',
  month: 'flex flex-col',
  // One week of the month, titles lie over its seven days
  monthWeek: 'relative grid grid-cols-7',
  day: 'group relative flex min-h-16 flex-col gap-1 overflow-hidden md:touch-none border-r border-b border-[var(--color-border)] p-0.5 last:border-r-0 sm:min-h-24 sm:p-1.5 md:min-h-28',
  dayOutside: 'bg-[var(--color-surface)]/50',
  dayDrafted: 'ring-2 ring-[var(--color-pick)] ring-inset',
  dayNumber:
    'relative z-[2] mx-auto flex h-6 w-6 items-center justify-center text-xs font-semibold tabular-nums',
  dayNumberButton: 'cursor-pointer transition-colors hover:bg-[var(--color-hover)] rounded-full',
  dayNumberToday: 'rounded-full bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  // Day on screen below the month of a phone
  dayNumberPicked: 'ring-2 ring-[var(--color-pick)]',
  dayNumberOutside: 'text-[var(--color-ink-subtle)]',
  dayAdd:
    'absolute top-1 right-1 z-20 flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  // Zones tint the days from a desktop up
  zoneLayer: 'pointer-events-none absolute inset-0 hidden flex-col md:flex',
  zoneBand: 'flex-1',
  // Titles laid over the days a zone covers, under every box
  zoneTitleLayer: 'pointer-events-none absolute grid',
  zoneTitleSlot:
    'flex items-center justify-center overflow-hidden transition-opacity duration-150 [container-type:inline-size]',
  zoneTitle:
    'max-w-full px-2 text-center leading-[0.95] font-black tracking-tight uppercase opacity-10 [text-wrap:balance] [overflow-wrap:anywhere]',
  zoneLabel:
    'relative z-[2] hidden truncate rounded-[var(--radius-sm)] px-1.5 py-0.5 text-micro font-semibold tracking-wide uppercase md:block',
  // Frames laid around the entries of a period, behind them
  periodLayer: 'pointer-events-none absolute grid',
  periodSlot: 'relative m-px flex min-w-0 items-start justify-center',
  periodFrame:
    'pointer-events-none absolute inset-0 rounded-[1.25rem] border-2 shadow-[var(--shadow-lg),0_1.25rem_2.5rem_-0.5rem_rgb(0_0_0/0.18)]',
  // Title straddling the top edge, wide letters, heavy weight
  periodLegend:
    'pointer-events-auto absolute top-0 left-1/2 z-[3] max-w-[90%] -translate-x-1/2 -translate-y-1/2 cursor-pointer truncate rounded-full bg-[var(--color-surface-raised)] px-5 py-1 text-xs font-black tracking-[0.4em] whitespace-nowrap uppercase shadow-[var(--shadow-md)]',
  // Room a day keeps under the title of a period
  periodRoom: 'md:pt-6',
  // A period: one continuous box, a little taller than an entry, behind the entries, its tint lets the zone through
  bar: 'relative z-[1] flex h-2 min-h-2 cursor-grab items-center gap-1.5 border-y-2 border-dashed px-0 py-0 text-left text-xs text-[var(--color-ink)] md:h-auto md:min-h-11 md:px-2 md:py-1 transition-[filter] hover:brightness-95 active:cursor-grabbing',
  barStart: 'ml-0 rounded-l-[var(--radius-md)] border-l-2',
  barEnd: 'mr-0 rounded-r-[var(--radius-md)] border-r-2',
  // Reaches over the border and padding of the cell, no seam between two days
  barRunsIn: '-ml-0.5 sm:-ml-[calc(0.375rem+1px)]',
  barRunsOut: '-mr-0.5 sm:-mr-[calc(0.375rem+1px)]',
  // A band shows no words on a phone
  barTitle: 'hidden min-w-0 flex-1 font-medium break-words md:block',
  entry:
    'relative z-[2] flex w-full cursor-grab items-start gap-1.5 rounded-[var(--radius-sm)] px-1.5 py-1 text-left text-xs transition-[filter] hover:brightness-95 active:cursor-grabbing',
  // Month entry
  line: 'relative z-[2] flex min-h-4 w-full cursor-grab flex-col items-start gap-0.5 rounded-[var(--radius-sm)] px-1 py-px text-left text-micro leading-tight transition-[filter] hover:brightness-95 active:cursor-grabbing sm:min-h-2 sm:px-1.5 sm:py-0.5 sm:text-xs',
  // A phone shows the title on one line like Google Calendar, no time
  lineTime:
    'hidden shrink-0 text-micro leading-none font-extrabold tabular-nums text-[var(--color-ink)] sm:block',
  lineTitle:
    'w-full min-w-0 truncate font-medium sm:flex-1 sm:overflow-visible sm:text-clip sm:break-words sm:whitespace-normal',
  entryTime: 'shrink-0 text-micro leading-none font-extrabold tabular-nums text-[var(--color-ink)]',
  // Time sits above the title
  entryStacked: 'flex-col gap-0.5',
  // A long title wraps onto the next line rather than losing its end
  entryTitle: 'min-w-0 flex-1 font-medium break-words',
  // Soft tint, no edge, a light shadow lifts it
  entryTint: 'text-[var(--color-ink)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]',
  // Absences sit behind everything else
  entryMuted: 'border border-[var(--color-border)]',
  entrySelected: PICK_RING,
  // Seat of the minute grid
  entryFill: 'h-full overflow-hidden',
  entryCompact: 'items-center py-0',
  entryReadOnly: 'cursor-pointer border border-dashed',
  handle:
    'absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize rounded-b-[var(--radius-sm)] opacity-0 transition-opacity group-hover/entry:opacity-100',
  overflow:
    'relative z-[2] rounded-[var(--radius-sm)] px-1.5 text-left text-xs text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  week: 'grid',
  hour: 'border-r border-b border-[var(--color-border)] px-2 py-1 text-right text-xs text-[var(--color-ink-subtle)] tabular-nums',
  slot: 'relative flex min-h-12 flex-col md:touch-none gap-1 border-r border-b border-[var(--color-border)] p-1 last:border-r-0',
  allDay: 'grid border-b border-[var(--color-border)] bg-[var(--color-surface)]/60',
  allDayLabel:
    'border-r border-[var(--color-border)] px-0.5 py-1 text-center text-micro text-[var(--color-ink-subtle)] md:px-2 md:text-right md:text-xs',
  allDayCell:
    'flex min-h-8 flex-col gap-0.5 border-r border-[var(--color-border)] p-1 last:border-r-0',
  legend: 'flex flex-col gap-3 pt-3',
  legendGroup: 'flex flex-wrap items-center gap-2',
  legendTitle: 'text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  legendRow:
    'flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-xs transition-colors',
  legendRowMuted: 'opacity-40',
  legendDot: 'h-2 w-2 shrink-0 rounded-full',
  legendCount: 'tabular-nums opacity-60',
  selectionBar: SELECTION_BAR,
  selectionCount: 'font-semibold tabular-nums',
  // Detail modal
  detailList: 'flex list-disc flex-col gap-1 pl-5 text-sm',
  detailLink:
    'min-w-0 cursor-pointer text-left font-medium break-all underline underline-offset-2 transition-colors hover:text-[var(--color-ink)]',
  detailNote: 'text-sm text-[var(--color-ink-subtle)]',
  // Roll-call panel inside the detail modal
  chipMark: 'h-3 w-3 shrink-0 opacity-80',
  chipMarkRollCall: 'h-4 w-4 opacity-100',
  // Roll-call cards are roomier and lifted off the grid
  entryRollCall:
    'flex-wrap content-start gap-x-2 gap-y-0.5 px-2.5 py-2 text-sm shadow-[var(--shadow-md)] [&>span:first-child]:font-semibold',
  rollCall:
    'flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3',
  rollCallHead: 'flex items-center gap-2 text-sm font-semibold',
  rollCallAnswer: 'flex flex-wrap gap-2',
  rollCallCounts: 'flex flex-wrap gap-1.5',
  rollCallLists: 'flex flex-col gap-3',
  rollCallGroup: 'flex flex-col gap-2 rounded-[var(--radius-md)] p-2.5',
  rollCallPeople: 'grid grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-3',
  rollCallTitle:
    'flex items-center gap-2 text-sm font-bold tracking-wide text-[var(--color-ink)] uppercase',
  rollCallPerson:
    'flex min-w-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-1 py-0.5 text-xs',
  rollCallName: 'flex min-w-0 flex-col items-start leading-tight',
  rollCallHours: 'text-xs whitespace-nowrap italic text-[var(--color-ink-subtle)]',
  rollCallDrop: 'transition-shadow',
  // Drop target lights up with a ring, no dashed edge
  rollCallOver: 'ring-2 ring-[var(--color-border-strong)]',
  rollCallMovable: 'cursor-grab active:cursor-grabbing',
  rollCallDragged: 'opacity-40',
  // Hover preview card, raised bubble like a late-item notification
  preview:
    'fixed z-[70] flex w-72 flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] p-4 text-sm text-[var(--color-ink)] [filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.3))_drop-shadow(0_0.5rem_1rem_rgb(0_0_0/0.14))]',
  previewHead: 'flex items-center gap-2 font-bold',
  // Short rule under the title, clear of the card edges
  previewRule: 'mx-2 h-px bg-[var(--color-border)]',
  // Tip aimed at the entry
  previewArrow:
    'pointer-events-none absolute h-4 w-4 rotate-45 rounded-[3px] bg-[var(--color-surface-raised)]',
  previewLine: 'flex items-start gap-2',
  detailMeta: 'flex flex-col gap-2 text-sm text-[var(--color-ink-subtle)]',
  previewIcon: 'mt-0.5 h-4 w-4 shrink-0',
  previewTitle: 'min-w-0 break-words',
  previewMeta: 'flex flex-col gap-2 text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Minute grid styles
 * @type {Record<string, string>}
 */

export const CALENDAR_GRID_STYLES = {
  board: 'relative grid',
  painting: 'select-none',
  // Zero-size mark a phone scrolls to on arrival
  opening: 'pointer-events-none absolute inset-x-0 h-px scroll-mt-28',
  hourColumn: 'border-r border-[var(--color-border)]',
  hourCell: 'flex justify-end border-b border-[var(--color-border)] px-1 pt-0.5 md:px-2',
  hourLabel: 'text-micro text-[var(--color-ink-subtle)] tabular-nums md:text-xs',
  dayColumn: 'relative md:touch-none border-r border-[var(--color-border)] last:border-r-0',
  dayColumnToday: 'bg-[var(--color-brand-soft)]/25',
  rowLine: 'group/cell relative border-b border-[var(--color-border)]',
  rowHeight: 'h-14',
  past: 'pointer-events-none absolute inset-x-0 z-0 bg-[var(--color-surface-sunken)]/60',
  entryLayer: 'pointer-events-none absolute inset-0 z-10',
  entrySeat: 'pointer-events-auto absolute px-0.5 py-px',
  entryDragging: 'opacity-40',
  painted:
    'pointer-events-none absolute inset-x-0.5 z-20 rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--color-brand-600)] bg-[var(--color-brand-soft)]/60',
  paintedLabel:
    'absolute inset-x-0 top-1 text-center text-micro font-bold text-[var(--color-brand-800)] tabular-nums',
  dropTarget: 'bg-[var(--color-hover)] ring-2 ring-[var(--color-border-strong)] ring-inset',
  nowLine: 'pointer-events-none absolute inset-x-0 z-30 h-0.5 bg-[var(--color-danger)]',
  nowLabel:
    'absolute left-1 -translate-y-1/2 rounded-full bg-[var(--color-danger)] px-1.5 py-0.5 text-micro font-bold text-[var(--color-on-solid)] tabular-nums',
  cellAdd:
    'absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-ink-subtle)] opacity-0 transition-opacity group-hover/cell:opacity-100 hover:bg-[var(--color-hover)] hover:text-[var(--color-ink-accent)] focus-visible:opacity-100',
  cellAddIcon: 'h-4 w-4',
} as const

/**
 * Calendar shown under a meeting
 * @type {Record<string, string>}
 */

export const MEETING_CALENDAR = {
  card: 'flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm',
  cardWhen: 'min-w-0 flex-1 font-semibold first-letter:uppercase',
  // One month, as wide as the boxes above
  panel:
    'flex w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-sm)]',
  head: 'flex items-center justify-between gap-2',
  title: 'text-sm font-bold tracking-wide uppercase',
  steps: 'flex items-center gap-1',
  step: 'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-base transition-colors hover:bg-[var(--color-hover)]',
  grid: 'grid grid-cols-7 gap-1',
  weekday:
    'pb-1 text-center text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  day: 'flex h-11 cursor-pointer flex-col items-center justify-center gap-px rounded-[var(--radius-sm)] text-xs tabular-nums transition-colors hover:bg-[var(--color-hover)]',
  dayOutside: 'text-[var(--color-ink-subtle)] opacity-40',
  dayInPeriod: 'bg-[var(--color-brand-soft)] font-semibold',
  dayToday: 'ring-2 ring-[var(--color-pick)] ring-inset',
  dayCount: 'text-[0.625rem] leading-none font-bold text-[var(--color-ink-subtle)]',
}

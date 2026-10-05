/**
 * Table styles
 * @type {Record<string, string>}
 */

export const TABLE_STYLES = {
  wrapper:
    'w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface',
  // The grid is desktop only
  table: 'hidden w-full min-w-full border-collapse text-sm md:table',
  headRow:
    'border-b border-[var(--color-border)] text-left text-xs tracking-wide text-[var(--color-ink-subtle)] uppercase',
  headCell: 'px-4 py-3 font-semibold whitespace-nowrap',
  sortable: 'inline-flex items-center gap-1 transition-colors hover:text-[var(--color-ink)]',
  row: 'border-b border-[var(--color-border)] transition-colors last:border-0 hover:bg-[var(--color-surface)]',
  rowActive: 'bg-[var(--color-brand-soft)]',
  cell: 'px-4 py-3 align-middle',
  cards: 'flex flex-col gap-2 p-2 md:hidden',
  card: 'flex w-full flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 text-left transition-[border-color]',
  cardOpen: 'cursor-pointer hover:border-[var(--color-border-strong)]',
  cardActive: 'bg-[var(--color-brand-soft)]',
  cardHead: 'text-sm font-medium',
  cardMeta: 'flex flex-wrap items-center gap-2 text-xs',
} as const

/**
 * Card list styles
 * @type {Record<string, string>}
 */

export const LIST_STYLES = {
  // Glyph flagging a member who has private notes
  cardNotes: 'h-4 w-4 shrink-0 text-[var(--color-brand-600)]',
  stack: 'flex flex-col gap-2',
  item: 'flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 transition-[border-color,box-shadow] hover:border-[var(--color-border-strong)]',
  itemClickable:
    'cursor-pointer hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-sm)]',
  card: 'flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 transition-[border-color,box-shadow]',
  cardClickable:
    'cursor-pointer hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)]',
  cardMuted: 'opacity-60',
  // Absent member
  cardAbsent: 'border-transparent bg-[var(--color-surface-sunken)] shadow-none',
  cardAbsentName: 'text-[var(--color-ink-subtle)]',
  cardAbsentNote:
    'flex items-center gap-1 text-xs font-medium text-[var(--color-ink-subtle)] italic',
  cardAbsentGlyph: 'h-3.5 w-3.5 shrink-0',
  cardAbsentEmblems: 'opacity-50 grayscale',
  grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3',
} as const

/**
 * Roomy record row styles
 * @type {Record<string, string>}
 */

export const RECORD_ROW = {
  stack: 'flex flex-col gap-3',
  root: 'flex cursor-pointer items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface px-5 py-4 transition-[border-color,box-shadow] hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-sm)]',
  // Same row without the pointer
  static:
    'flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface px-5 py-4',
  body: 'flex min-w-0 flex-1 flex-col gap-1',
  title: 'truncate text-base font-bold',
  meta: 'truncate text-sm text-[var(--color-ink-subtle)]',
  link: 'shrink-0 rounded-full p-2 text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
} as const

/**
 * Planning styles
 * @type {Record<string, string>}
 */

export const CALENDAR_AGENDA = {
  list: 'flex flex-col divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface px-5',
  empty: 'py-16 text-center text-sm text-[var(--color-ink-subtle)]',
  day: 'grid grid-cols-[6rem_minmax(0,1fr)] gap-4 py-5',
  head: 'flex items-start gap-3',
  number:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-extrabold tabular-nums',
  numberToday: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  weekday:
    'flex flex-col pt-0.5 text-[11px] leading-tight font-extrabold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  month: 'font-semibold normal-case first-letter:uppercase',
  rows: 'flex flex-col',
  row: 'flex items-center gap-4 rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-hover)]',
  rowSelected: 'ring-2 ring-[var(--color-brand-600)] ring-inset',
  bullet: 'h-3.5 w-[3px] shrink-0 rounded-full bg-current',
  time: 'w-24 shrink-0 text-sm text-[var(--color-ink-subtle)] tabular-nums',
  title: 'min-w-0 flex-1 truncate text-sm font-semibold',
  meta: 'hidden shrink-0 text-sm text-[var(--color-ink-subtle)] md:inline',
} as const

/**
 * Calendar side rail styles
 * @type {Record<string, string>}
 */

export const CALENDAR_SIDEBAR = {
  // Folded rail of the screens without a sidebar
  rail: 'flex flex-col gap-4 md:hidden',
  railBody: 'flex-col gap-6',
  // Sidebar version
  panel: 'flex min-h-0 w-full flex-1 flex-col gap-5 overflow-y-auto px-3',
  back: 'flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 text-sm font-semibold transition-colors hover:bg-[var(--color-hover)]',
  toggle:
    'flex w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm font-semibold',
  mini: 'flex flex-col gap-2',
  miniHead: 'flex items-center justify-between gap-2',
  miniTitle: 'pl-2 text-sm font-extrabold first-letter:uppercase',
  miniGrid: 'grid grid-cols-7 gap-y-0.5 text-center',
  miniWeekday:
    'py-1 text-[10px] font-extrabold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  miniDay:
    'mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors hover:bg-[var(--color-hover)]',
  miniDayOutside: 'text-[var(--color-ink-subtle)]',
  miniDayToday:
    'bg-[var(--color-brand-600)] text-[var(--color-on-brand)] hover:bg-[var(--color-brand-700)]',
  miniDayInRange: 'bg-[var(--color-brand-100)]',
  miniDayPicked: 'ring-2 ring-[var(--color-brand-600)] ring-inset',
  group: 'flex flex-col gap-1',
  groupTitle: 'px-2 pb-1 text-xs font-black tracking-wide text-[var(--color-ink)] uppercase',
  row: 'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--color-hover)]',
  rowLabel: 'min-w-0 flex-1 truncate',
  box: 'flex h-5 w-5 shrink-0 items-center justify-center',
  boxCheck: 'h-5 w-5',
  // A switched off row reads in retreat
  rowOff: 'text-[var(--color-ink-subtle)]',
  rowGlyph: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  // Bar standing where the global search stands
  searchBar:
    'flex w-full items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] px-2.5 py-2 text-[var(--color-ink-subtle)] focus-within:text-[var(--color-ink)]',
  searchInput:
    'min-w-0 flex-1 bg-transparent text-[15px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-subtle)]',
  search:
    'w-full rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3 py-2 text-sm text-[var(--color-on-field)] outline-none placeholder:text-[var(--color-on-field-subtle)] focus:border-[var(--color-field-border-strong)]',
} as const

/**
 * Own absence page: a composer on top
 * @type {Record<string, string>}
 */

export const ABSENCE_PAGE = {
  page: 'mx-auto flex w-full max-w-5xl flex-col gap-14',
  months: 'flex flex-col',
  month: 'flex flex-col gap-3',
  monthHead: 'flex h-8 items-center justify-between',
  monthName: 'text-base font-bold capitalize',
  monthNav:
    'flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-600)]',
  grid: 'grid grid-cols-7 gap-y-0.5',
  weekday:
    'pb-2 text-center text-[11px] font-extrabold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  day: 'relative flex h-14 w-full items-center justify-center text-xl font-bold tabular-nums transition-colors',
  dayFree: 'cursor-pointer rounded-[var(--radius-md)] hover:bg-[var(--color-hover)]',
  dayPast: 'cursor-not-allowed text-[var(--color-ink-subtle)]/50',
  dayToday: 'rounded-[var(--radius-md)] ring-2 ring-[var(--color-ink)] ring-inset',
  dayBooked:
    'cursor-not-allowed text-[var(--color-ink-subtle)] bg-[repeating-linear-gradient(135deg,transparent_0_5px,var(--color-border)_5px_6px)]',
  dayRange: 'bg-[var(--color-brand-100)] text-[var(--color-ink)]',
  dayPreview: 'bg-[var(--color-brand-50)]',
  dayEdge:
    'cursor-pointer rounded-[var(--radius-md)] bg-[var(--color-brand-300)] text-[var(--color-ink)] hover:bg-[var(--color-brand-400)]',
  list: 'flex flex-col',
  listTitle: 'mb-2 text-[11px] font-black tracking-wide uppercase',
  row: 'grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-t border-[var(--color-border)] px-1 py-4 md:grid-cols-[13rem_5.5rem_minmax(0,1fr)_11rem]',
  rowDates: 'text-base font-bold',
  rowDuration: 'text-sm text-[var(--color-ink-subtle)]',
  rowReason: 'col-span-2 min-w-0 text-sm md:col-span-1',
  rowReasonEmpty: 'text-[var(--color-ink-subtle)] italic',
  rowStatus:
    'col-start-2 row-start-1 flex items-center justify-end gap-2 text-sm font-semibold md:col-start-auto md:row-start-auto',
  statusIcon: 'h-4 w-4',
  statusDone: 'text-[var(--color-success)]',
  statusClosed: 'text-[var(--color-danger)]',
  statusWaiting: 'text-[var(--color-warning)]',
  cancel:
    'whitespace-nowrap text-sm font-semibold text-[var(--color-ink-subtle)] underline-offset-4 transition-colors hover:text-[var(--color-ink)] hover:underline',
} as const

/**
 * Grouped card list styles
 * @type {Record<string, string>}
 */

export const GROUP_STYLES = {
  stack: 'flex flex-col',
  // Blocks of a page
  spaced: 'flex flex-col gap-12',
  section: 'flex flex-col gap-3',
  sectionDivided: 'border-t border-[var(--color-border)] mt-6 pt-6',
  // Page-level buckets
  ruledStack: 'flex flex-col divide-y divide-[var(--color-border)]',
  ruledSection: 'flex flex-col gap-4 py-8 first:pt-0 last:pb-0',
  heading: 'flex w-full items-center gap-2 text-left text-sm font-semibold text-[var(--color-ink)]',
  count: 'ml-auto font-normal text-[var(--color-ink-subtle)]',
  chevron: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform',
  chevronOpen: 'rotate-180',
} as const

/**
 * Kanban board styles
 * @type {Record<string, string>}
 */

export const BOARD_STYLES = {
  scroller: 'flex gap-4 overflow-x-auto pb-2',
  column:
    'flex w-72 shrink-0 flex-col gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-2.5',
  columnArchived: 'opacity-60',
  columnHead: 'flex items-center justify-between gap-2 px-2 py-1.5',
  columnTitle: 'flex items-center gap-2 text-sm font-bold',
  count:
    'rounded-[var(--radius-sm)] bg-[var(--color-surface-raised)] px-2 py-0.5 text-xs text-[var(--color-ink-subtle)]',
  body: 'flex min-h-24 flex-col gap-2 rounded-[var(--radius-md)] p-1',
  card: 'group flex cursor-grab flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3.5 shadow-[var(--shadow-sm)] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] active:cursor-grabbing motion-reduce:transition-none motion-reduce:hover:translate-y-0',
  // Card sits lighter than its column so the two glass layers do not muddy
  cardGlass: 'bg-[var(--color-surface-raised)]/70 backdrop-blur-md',
  cardTint: 'accent-tint accent-border backdrop-blur-md',
  cardTitle: 'text-[15px] leading-snug font-bold',
  // Glyph flowing before a title
  cardGlyph: 'mr-1.5',
} as const

/**
 * Timeline styles
 * @type {Record<string, string>}
 */

export const TIMELINE_STYLES = {
  list: 'flex flex-col',
  item: 'relative flex gap-3 pb-4 pl-6 last:pb-0',
  rail: 'absolute top-1.5 bottom-0 left-[7px] w-px bg-[var(--color-border)]',
  dot: 'absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-surface-raised)]',
  body: 'flex min-w-0 flex-col gap-0.5 text-sm',
  meta: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Journal styles
 * @type {Record<string, string>}
 */

export const JOURNAL_STYLES = {
  list: 'flex flex-col gap-3',
  item: 'flex flex-col gap-3',
  entry: 'flex gap-3',
  body: 'flex min-w-0 flex-1 flex-col gap-1',
  head: 'flex flex-wrap items-center gap-2',
  tick: 'h-3 w-px shrink-0 bg-[var(--color-border-strong)]',
  moment: 'text-xs tabular-nums text-[var(--color-ink-subtle)]',
  sentence: 'text-sm text-[var(--color-ink)]',
  verb: 'font-bold',
  // Short rule set under the portrait
  separator: 'ml-9 h-px w-10 bg-[var(--color-border)]',
} as const

/**
 * Horizontal timeline styles
 * @type {Record<string, string>}
 */

export const HORIZONTAL_TIMELINE_STYLES = {
  row: 'flex items-start',
  step: 'flex flex-1 flex-col items-center gap-2 text-center last:flex-none',
  dot: 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
  dotDone:
    'border-[var(--color-brand-600)] bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  dotCurrent:
    'border-[var(--color-brand-600)] bg-[var(--color-surface-raised)] text-[var(--color-brand-600)]',
  dotIdle:
    'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] text-[var(--color-ink-subtle)]',
  dotLate: 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  icon: 'h-4 w-4',
  connector: 'mt-4 h-0.5 flex-1',
  connectorDone: 'bg-[var(--color-brand-600)]',
  connectorIdle: 'bg-[var(--color-border)]',
  connectorLate: 'bg-[var(--color-danger)]',
  labelDone: 'text-[var(--color-ink)]',
  labelIdle: 'text-[var(--color-ink-subtle)]',
  label: 'max-w-24 text-xs font-medium',
} as const

/**
 * Calendar grid styles
 * @type {Record<string, string>}
 */

export const CALENDAR_STYLES = {
  frame:
    'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface',
  toolbar: 'flex flex-wrap items-center gap-2 pb-3',
  period: 'text-xl font-extrabold tracking-tight first-letter:uppercase sm:text-2xl',
  weekdays:
    'border-b border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  weekdaysMonth: 'grid grid-cols-7',
  weekdaysTimed: 'grid',
  // Hour gutter
  columnsDay: 'grid-cols-[4rem_minmax(0,1fr)]',
  columnsWeek: 'grid-cols-[4rem_repeat(7,minmax(0,1fr))]',
  weekday: 'px-2 py-2 text-center',
  weekdayHead: 'flex flex-col items-center gap-1',
  month: 'grid grid-cols-7',
  day: 'group relative flex min-h-28 touch-none flex-col gap-1 overflow-hidden border-r border-b border-[var(--color-border)] p-1.5 last:border-r-0',
  dayOutside: 'bg-[var(--color-surface)]/50',
  dayDrafted: 'ring-2 ring-[var(--color-brand-400)] ring-inset',
  dayNumber:
    'relative mx-auto flex h-6 w-6 items-center justify-center text-xs font-semibold tabular-nums',
  dayNumberButton: 'cursor-pointer transition-colors hover:bg-[var(--color-hover)] rounded-full',
  dayNumberToday: 'rounded-full bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  dayNumberOutside: 'text-[var(--color-ink-subtle)]',
  dayAdd:
    'absolute top-1 right-1 z-20 flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  zoneLayer: 'pointer-events-none absolute inset-0 flex flex-col',
  zoneBand: 'flex-1',
  zoneLabel:
    'relative truncate rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
  bar: 'relative flex min-h-6 cursor-grab items-center gap-1.5 px-1.5 py-0.5 text-left text-xs transition-[filter] hover:brightness-95 active:cursor-grabbing',
  barStart: 'ml-0 rounded-l-[var(--radius-sm)]',
  barEnd: 'mr-0 rounded-r-[var(--radius-sm)]',
  barRunsIn: '-ml-1.5',
  barRunsOut: '-mr-1.5',
  entry:
    'relative flex w-full cursor-grab items-start gap-1.5 rounded-[var(--radius-sm)] px-1.5 py-1 text-left text-xs transition-[filter] hover:brightness-95 active:cursor-grabbing',
  // Month entry
  line: 'relative flex w-full cursor-grab items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-left sm:justify-start text-xs transition-colors hover:bg-[var(--color-hover)] active:cursor-grabbing',
  lineBullet: 'h-3.5 w-[3px] shrink-0 rounded-full bg-current',
  // Phones keep the bullet alone
  lineTime: 'hidden shrink-0 tabular-nums text-[var(--color-ink-subtle)] sm:inline',
  lineTitle: 'hidden min-w-0 flex-1 truncate font-semibold sm:block',
  lineMuted: 'text-[var(--color-ink-subtle)]',
  entryTime: 'shrink-0 tabular-nums opacity-70',
  // A long title wraps onto the next line rather than losing its end
  entryTitle: 'min-w-0 flex-1 font-medium break-words',
  // Full-colour fill
  entrySolid: 'text-[var(--color-on-accent)]',
  // Absences sit behind everything else
  entryMuted: 'border border-[var(--color-border)] opacity-75',
  entrySelected:
    'ring-2 ring-[var(--color-brand-600)] ring-offset-1 ring-offset-[var(--color-surface-raised)]',
  // Seat of the minute grid
  entryFill: 'h-full overflow-hidden',
  entryCompact: 'items-center py-0',
  entryReadOnly: 'cursor-pointer border border-dashed',
  handle:
    'absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize rounded-b-[var(--radius-sm)] opacity-0 transition-opacity group-hover/entry:opacity-100',
  overflow:
    'relative rounded-[var(--radius-sm)] px-1.5 text-left text-xs text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  week: 'grid',
  hour: 'border-r border-b border-[var(--color-border)] px-2 py-1 text-right text-xs text-[var(--color-ink-subtle)] tabular-nums',
  slot: 'relative flex min-h-12 touch-none flex-col gap-1 border-r border-b border-[var(--color-border)] p-1 last:border-r-0',
  allDay: 'grid border-b border-[var(--color-border)] bg-[var(--color-surface)]/60',
  allDayLabel:
    'border-r border-[var(--color-border)] px-2 py-1 text-right text-xs text-[var(--color-ink-subtle)]',
  allDayCell:
    'flex min-h-8 flex-col gap-0.5 border-r border-[var(--color-border)] p-1 last:border-r-0',
  legend: 'flex flex-col gap-3 pt-3',
  legendGroup: 'flex flex-wrap items-center gap-2',
  legendTitle: 'text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  legendRow:
    'flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-xs transition-colors',
  legendRowMuted: 'opacity-40',
  legendDot: 'h-3.5 w-[3px] shrink-0 rounded-full',
  legendCount: 'tabular-nums opacity-60',
  selectionBar:
    'flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-brand-400)] bg-[var(--color-brand-soft)]/60 px-3 py-2 text-sm',
  selectionCount: 'font-semibold tabular-nums',
  // Detail modal
  detailList: 'flex list-disc flex-col gap-1 pl-5 text-sm',
  detailNote: 'text-sm text-[var(--color-ink-subtle)]',
  // Roll-call panel inside the detail modal
  chipMark: 'h-3 w-3 shrink-0 opacity-80',
  rollCall:
    'flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3',
  rollCallHead: 'flex items-center gap-2 text-sm font-semibold',
  rollCallAnswer: 'flex flex-wrap gap-2',
  rollCallCounts: 'flex flex-wrap gap-1.5',
  rollCallLists: 'flex flex-col gap-3',
  rollCallGroup: 'flex flex-col gap-1.5',
  rollCallPeople: 'flex flex-col gap-1',
  rollCallPerson: 'flex items-center gap-2 text-sm',
  // Hover preview card
  preview:
    'fixed z-[70] flex w-72 flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] glass-panel p-4 text-sm shadow-[var(--shadow-md)]',
  previewHead: 'flex items-center gap-2 font-bold',
  previewBullet: 'h-3.5 w-[3px] shrink-0 rounded-full bg-current',
  previewLine: 'flex items-center gap-2',
  detailMeta: 'flex flex-col gap-2 text-sm text-[var(--color-ink-subtle)]',
  previewIcon: 'h-4 w-4 shrink-0',
  previewTitle: 'truncate',
  previewMeta: 'flex flex-col gap-2 text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Minute grid styles
 * @type {Record<string, string>}
 */

export const CALENDAR_GRID_STYLES = {
  // Phone reads the agenda
  board: 'relative hidden md:grid',
  painting: 'select-none',
  hourColumn: 'border-r border-[var(--color-border)]',
  hourCell: 'flex justify-end border-b border-[var(--color-border)] px-2 pt-0.5',
  hourLabel: 'text-xs text-[var(--color-ink-subtle)] tabular-nums',
  dayColumn: 'relative touch-none border-r border-[var(--color-border)] last:border-r-0',
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
    'absolute inset-x-0 top-1 text-center text-[11px] font-bold text-[var(--color-brand-800)] tabular-nums',
  dropTarget: 'ring-2 ring-[var(--color-brand-400)] ring-inset',
  nowLine: 'pointer-events-none absolute inset-x-0 z-30 h-0.5 bg-[var(--color-danger)]',
  nowLabel:
    'absolute left-1 -translate-y-1/2 rounded-full bg-[var(--color-danger)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-on-brand)] tabular-nums',
  cellAdd:
    'absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-ink-subtle)] opacity-0 transition-opacity group-hover/cell:opacity-100 hover:bg-[var(--color-hover)] hover:text-[var(--color-brand-600)] focus-visible:opacity-100',
  cellAddIcon: 'h-4 w-4',
  // Phone fallback
  agenda: 'flex flex-col divide-y divide-[var(--color-border)] p-3 md:hidden',
  agendaDay: 'flex flex-col gap-2 py-4 first:pt-0 last:pb-0',
  agendaDayEmpty: 'py-2',
  agendaHead: 'flex min-h-9 items-center gap-2 px-1',
  agendaDayName: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  agendaToday:
    'inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-brand-600)] px-1.5 text-[11px] font-bold text-[var(--color-on-brand)]',
  agendaAdd:
    'touch-target ml-auto flex items-center justify-center rounded-full text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)]',
} as const

/**
 * Filter bar styles — a filter icon opening the dropdown sheet
 * @type {Record<string, string>}
 */

export const FILTER_STYLES = {
  bar: 'flex flex-wrap items-center gap-2',
  iconButton:
    'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-ink-subtle)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-ink)]',
  iconButtonActive: 'border-[var(--color-brand-400)] text-[var(--color-brand-600)]',
  glyph: 'h-4 w-4',
  tally:
    'absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand-600)] px-1 text-[10px] font-bold text-[var(--color-on-brand)] tabular-nums',
  searchGroup: 'flex items-center gap-2',
  searchInput:
    'search-expand w-0 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-2 text-sm text-[var(--color-ink)] opacity-0 outline-none placeholder:text-[var(--color-ink-subtle)]',
  searchInputOpen: 'w-48 px-3 opacity-100 sm:w-64',
  trailing: 'ml-auto flex items-center gap-2',
  // Divider lower
  panel: 'mt-3 flex flex-wrap items-start gap-3 border-t border-[var(--color-border)] pt-4',
  options: 'flex flex-1 flex-wrap items-start gap-3',
  reset: 'shrink-0',
  optionField: 'w-full sm:w-52',
} as const

/**
 * Permission toggle board styles — a page title
 * @type {Record<string, string>}
 */

export const PERMISSION_TOGGLE_STYLES = {
  wrapper: 'flex flex-col gap-6',
  head: 'flex flex-wrap items-center gap-2',
  search: 'w-full sm:max-w-xs',
  tally: 'text-xs text-[var(--color-ink-subtle)] tabular-nums',
  dirty:
    'rounded-[var(--radius-sm)] bg-[var(--color-brand-600)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-on-brand)] tabular-nums',
  section: 'flex flex-col gap-2',
  sectionTitle: 'text-sm font-bold',
  rows: 'rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface px-3',
  row: 'flex items-center gap-4 py-3',
  rowChild: 'pl-4',
  rootRow: 'flex flex-wrap items-center gap-x-3',
  rootActions: 'flex shrink-0 items-center gap-1',
  divider: 'h-px bg-[var(--color-border-strong)]',
  identity: 'flex min-w-0 flex-1 flex-col gap-0.5',
  name: 'flex flex-wrap items-center gap-2 text-sm font-medium',
  nameChild: 'font-normal',
  description: 'text-xs text-[var(--color-ink-subtle)]',
  control: 'shrink-0',
  empty: 'px-2 py-8 text-center text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Figure rule styles
 * @type {Record<string, string>}
 */

export const SUMMARY_BAR = {
  bar: 'grid grid-cols-2 gap-x-6 gap-y-4 border-y border-[var(--color-border)] py-4 sm:flex sm:flex-wrap sm:divide-x sm:divide-[var(--color-border)] sm:gap-0',
  item: 'flex min-w-0 flex-col gap-1 sm:flex-1 sm:px-5 sm:first:pl-0 sm:last:pr-0',
  label:
    'font-[family-name:var(--font-mono)] text-[11px] tracking-wide text-[var(--color-ink-subtle)] uppercase',
  value: 'flex items-baseline gap-2',
  figure: 'text-2xl font-black tracking-tight tabular-nums',
  hint: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Pagination styles
 * @type {Record<string, string>}
 */

export const PAGINATION_STYLES = {
  bar: 'flex flex-wrap items-center justify-between gap-3 pt-2',
  meta: 'text-xs text-[var(--color-ink-subtle)] tabular-nums',
  actions: 'flex gap-2',
} as const

/**
 * Absence declaration styles: a vertical timeline on the left
 * @type {Record<string, string>}
 */

export const ABSENCE_WIZARD = {
  root: 'surface-enter grid gap-5 md:grid-cols-[2rem_minmax(0,1fr)] md:gap-7',
  // Bare chips and dashed runs
  timeline: 'relative flex items-start justify-between gap-2 md:block',
  step: 'relative flex items-center md:absolute md:top-[var(--step-top)] md:left-0 md:-translate-y-1/2',
  // Dashed run between two chips
  rail: 'absolute left-4 hidden w-0 -translate-x-1/2 border-l-2 border-dashed border-[var(--color-border-strong)] transition-colors md:block',
  railDone: 'border-[var(--color-success)]',
  chip: 'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black tabular-nums transition-colors',
  chipCurrent: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  // The check glyph paints itself in the success tones
  chipDone: 'bg-[var(--color-success-soft)] ring-2 ring-[var(--color-success)] ring-inset',
  chipTodo:
    'border border-dashed border-[var(--color-border-strong)] text-[var(--color-ink-subtle)]',
  chipGlyph: 'h-5 w-5',
  // Box of the step
  stageBox:
    'relative flex min-h-[42rem] flex-col justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-6 sm:p-8',
  tail: 'bubble-tail hidden md:block',
  stage: 'course-pop flex min-w-0 flex-col gap-6',
  stageTitle: 'text-2xl font-black tracking-tight sm:text-3xl',
  hint: 'mt-1.5 text-[15px] text-[var(--color-ink-subtle)]',
  // Divider under the calendar
  summary: 'min-h-24 border-t border-[var(--color-border)] pt-6 text-center',
  sentence: 'text-xl font-bold tracking-tight text-balance',
  duration: 'mt-1 text-[var(--color-ink-subtle)]',
  warning: 'mt-1 text-sm font-semibold text-[var(--color-warning)]',
  placeholder: 'placeholder:italic placeholder:opacity-70',
  actions: 'flex flex-wrap items-center justify-center gap-3 pt-2',
  success: 'flex flex-col items-center gap-4 py-4 text-center',
  successGlyph: 'course-check h-20 w-20 text-[var(--color-success)]',
  thanks: 'text-2xl font-black tracking-tight sm:text-3xl',
  reasonBlock: 'flex w-full max-w-md flex-col gap-2 text-left',
  reasonLabel: 'text-[11px] font-black tracking-wide uppercase',
  reasonBox:
    'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[15px] leading-relaxed break-words whitespace-pre-wrap',
  header: 'flex justify-end',
} as const

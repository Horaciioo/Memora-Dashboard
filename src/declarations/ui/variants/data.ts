/**
 * Table styles
 * @type {Record<string, string>}
 */

export const TABLE_STYLES = {
  wrapper:
    'w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
  table: 'w-full min-w-full border-collapse text-sm',
  headRow:
    'border-b border-[var(--color-border)] text-left text-xs tracking-wide text-[var(--color-ink-subtle)] uppercase',
  headCell: 'px-4 py-3 font-semibold whitespace-nowrap',
  sortable: 'inline-flex items-center gap-1 transition-colors hover:text-[var(--color-ink)]',
  row: 'border-b border-[var(--color-border)] transition-colors last:border-0 hover:bg-[var(--color-surface)]',
  rowActive: 'bg-[var(--color-brand-soft)]',
  cell: 'px-4 py-3 align-middle',
} as const

/**
 * Card list styles
 * @type {Record<string, string>}
 */

export const LIST_STYLES = {
  stack: 'flex flex-col gap-2',
  item: 'flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 transition-[border-color,box-shadow] hover:border-[var(--color-border-strong)]',
  itemClickable:
    'cursor-pointer hover:border-[var(--color-brand-400)] hover:shadow-[var(--shadow-sm)]',
  card: 'flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition-[border-color,box-shadow]',
  cardClickable:
    'cursor-pointer hover:border-[var(--color-brand-400)] hover:shadow-[var(--shadow-md)]',
  cardMuted: 'opacity-60',
  grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3',
} as const

/**
 * Grouped card list styles, one heading per bucket
 * @type {Record<string, string>}
 */

export const GROUP_STYLES = {
  stack: 'flex flex-col',
  section: 'flex flex-col gap-3',
  sectionDivided: 'border-t border-[var(--color-border)] pt-6',
  // Page-level buckets, a rule centred in the gap between each
  ruledStack: 'flex flex-col divide-y divide-[var(--color-border)]',
  ruledSection: 'flex flex-col gap-4 py-8 first:pt-0 last:pb-0',
  heading: 'flex w-full items-center gap-2 text-left text-sm font-semibold text-[var(--color-ink)]',
  count: 'font-normal text-[var(--color-ink-subtle)]',
  bubble: 'inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand-600)]',
  chevron: 'ml-auto h-4 w-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform',
  chevronOpen: 'rotate-180',
} as const

/**
 * Kanban board styles
 * @type {Record<string, string>}
 */

export const BOARD_STYLES = {
  scroller: 'flex gap-4 overflow-x-auto pb-2',
  column:
    'flex w-72 shrink-0 flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-2',
  columnArchived: 'opacity-60',
  columnHead: 'flex items-center justify-between gap-2 px-2 py-1.5',
  columnTitle: 'flex items-center gap-2 text-sm font-semibold',
  count:
    'rounded-[var(--radius-sm)] bg-[var(--color-surface-raised)] px-2 py-0.5 text-xs text-[var(--color-ink-subtle)]',
  body: 'flex min-h-24 flex-col gap-2 rounded-[var(--radius-md)] p-1',
  card: 'group flex cursor-grab flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 transition-shadow hover:shadow-[var(--shadow-md)] active:cursor-grabbing',
  cardTitle: 'text-sm leading-snug font-medium',
  // Glyph flowing before a title, spaced by text rather than framed
  cardGlyph: 'mr-1.5',
  cardMeta: 'flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Authorship strip styles, the stamps of a record sitting above its journal
 * @type {Record<string, string>}
 */

export const AUTHORSHIP_STYLES = {
  strip: 'flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--color-ink-subtle)]',
  stamp: 'flex items-center gap-1.5',
  label: 'font-semibold tracking-wide uppercase',
  // Sidebar-style hairline, never a middot
  separator: 'h-3 w-px shrink-0 bg-[var(--color-border)]',
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
 * Journal styles, a portrait opening each recorded event rather than a bullet
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
  // Short rule set under the portrait, never a full width line across the panel
  separator: 'ml-9 h-px w-10 bg-[var(--color-border)]',
} as const

/**
 * Horizontal timeline styles, three steps connected by a rule
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
  hint: 'max-w-24 text-[10px] text-[var(--color-ink-subtle)]',
  label: 'max-w-24 text-xs font-medium',
} as const

/**
 * Calendar grid styles
 * @type {Record<string, string>}
 */

export const CALENDAR_STYLES = {
  frame:
    'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
  toolbar: 'flex flex-wrap items-center gap-2 pb-3',
  period: 'text-base font-bold first-letter:uppercase',
  weekdays:
    'border-b border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  weekdaysMonth: 'grid grid-cols-7',
  weekdaysWeek: 'grid grid-cols-[4rem_repeat(7,minmax(0,1fr))]',
  weekday: 'px-2 py-2 text-center',
  weekdayHead: 'flex flex-col items-center gap-1',
  month: 'grid grid-cols-7',
  day: 'group relative flex min-h-28 touch-none flex-col gap-1 overflow-hidden border-r border-b border-[var(--color-border)] p-1.5 last:border-r-0',
  dayOutside: 'bg-[var(--color-surface)]/50',
  dayDrafted: 'ring-2 ring-[var(--color-brand-400)] ring-inset',
  dayNumber:
    'relative mx-auto flex h-6 w-6 items-center justify-center text-xs font-semibold tabular-nums',
  dayNumberToday: 'rounded-full bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  dayNumberOutside: 'text-[var(--color-ink-subtle)]',
  dayAdd:
    'absolute top-1 right-1 z-20 flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-600)]',
  zoneLayer: 'pointer-events-none absolute inset-0 flex flex-col',
  zoneBand: 'flex-1',
  zoneLabel:
    'relative truncate rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
  bar: 'relative flex cursor-grab items-center gap-1.5 px-1.5 py-0.5 text-left text-xs transition-opacity hover:opacity-80 active:cursor-grabbing',
  barStart: 'ml-0 rounded-l-[var(--radius-sm)]',
  barEnd: 'mr-0 rounded-r-[var(--radius-sm)]',
  barRunsIn: '-ml-1.5',
  barRunsOut: '-mr-1.5',
  entry:
    'relative flex w-full cursor-grab items-center gap-1.5 rounded-[var(--radius-sm)] px-1.5 py-1 text-left text-xs transition-opacity hover:opacity-80 active:cursor-grabbing',
  entryTime: 'shrink-0 tabular-nums opacity-70',
  entryTitle: 'truncate font-medium',
  // Full-colour fill, black label — pastel is kept for zones only
  entrySolid: 'text-[var(--color-on-accent)]',
  entrySelected:
    'ring-2 ring-[var(--color-brand-600)] ring-offset-1 ring-offset-[var(--color-surface-raised)]',
  entryReadOnly: 'cursor-pointer border border-dashed',
  handle:
    'absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize rounded-b-[var(--radius-sm)] opacity-0 transition-opacity group-hover/entry:opacity-100',
  overflow: 'relative px-1.5 text-xs text-[var(--color-ink-subtle)]',
  week: 'grid grid-cols-[4rem_repeat(7,minmax(0,1fr))]',
  hour: 'border-r border-b border-[var(--color-border)] px-2 py-1 text-right text-xs text-[var(--color-ink-subtle)] tabular-nums',
  slot: 'relative flex min-h-12 touch-none flex-col gap-1 border-r border-b border-[var(--color-border)] p-1 last:border-r-0',
  allDay:
    'grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] border-b border-[var(--color-border)] bg-[var(--color-surface)]/60',
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
  legendDot: 'h-2.5 w-2.5 shrink-0 rounded-full',
  legendCount: 'tabular-nums opacity-60',
  selectionBar:
    'flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-brand-400)] bg-[var(--color-brand-soft)]/60 px-3 py-2 text-sm',
  selectionCount: 'font-semibold tabular-nums',
  // Detail modal, meeting subjects and birthday note
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
  // Hover preview card, portalled above the chip
  preview:
    'fixed z-[70] flex w-72 flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 text-sm shadow-[var(--shadow-md)]',
  previewHead: 'flex items-center gap-2 font-semibold',
  previewTitle: 'truncate',
  previewMeta: 'flex flex-col gap-1 text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Filter bar styles — a filter icon opening the dropdown sheet, a search icon expanding its
 * own field beside it
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
  // Divider lower, reset shares the row
  panel: 'mt-3 flex flex-wrap items-start gap-3 border-t border-[var(--color-border)] pt-4',
  options: 'flex flex-1 flex-wrap items-start gap-3',
  reset: 'shrink-0',
  optionField: 'w-full sm:w-52',
} as const

/**
 * Permission picker styles — a search header, then one collapsible block per group
 * @type {Record<string, string>}
 */

export const PERMISSION_PICKER_STYLES = {
  wrapper: 'flex flex-col gap-3',
  header: 'flex flex-wrap items-center gap-2',
  search: 'w-full sm:max-w-xs',
  tally: 'text-xs text-[var(--color-ink-subtle)] tabular-nums',
  dirty:
    'rounded-[var(--radius-sm)] bg-[var(--color-brand-600)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-on-brand)] tabular-nums',
  groups: 'flex flex-col gap-2',
  group:
    'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
  groupHead:
    'flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface)]',
  groupChevron: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform',
  groupChevronOpen: 'rotate-90',
  groupLabel: 'text-sm font-semibold',
  groupTally: 'ml-auto shrink-0 text-xs text-[var(--color-ink-subtle)] tabular-nums',
  groupActions: 'flex shrink-0 items-center gap-1',
  body: 'flex flex-col gap-1 border-t border-[var(--color-border)] p-2',
  row: 'flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[var(--radius-md)] px-2 py-1.5',
  identity: 'flex min-w-0 flex-1 flex-col gap-0.5',
  name: 'flex flex-wrap items-center gap-2 text-sm',
  description: 'text-xs text-[var(--color-ink-subtle)]',
  control: 'shrink-0',
  empty: 'px-2 py-6 text-center text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Sanction panel styles — a banner, a grid of title-only tiles, and the ladder table
 * @type {Record<string, string>}
 */

export const SANCTION_STYLES = {
  banner: 'flex flex-wrap items-start justify-between gap-4',
  level: 'flex items-center gap-3',
  levelNumber: 'text-4xl leading-none font-extrabold tabular-nums',
  levelIdentity: 'flex min-w-0 flex-col gap-0.5',
  levelName: 'truncate text-base font-bold',
  bannerActions: 'flex flex-wrap items-center gap-2',
  grid: 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  tile: 'flex min-h-16 items-center rounded-[var(--radius-lg)] border-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-[var(--color-surface)]',
  block: 'flex flex-col gap-1.5',
  blockLabel: 'text-[11px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  example: 'rounded-[var(--radius-md)] p-3 text-sm',
  warning:
    'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 font-[family-name:var(--font-mono)] text-xs',
  ladder: 'flex flex-col gap-1',
  rung: 'flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5',
  rungLabel: 'min-w-24 text-xs text-[var(--color-ink-subtle)]',
} as const

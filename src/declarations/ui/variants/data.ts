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
  item: 'flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 transition-colors hover:border-[var(--color-border-strong)]',
  itemClickable: 'cursor-pointer hover:border-[var(--color-brand-400)]',
  card: 'flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition-colors',
  cardClickable: 'cursor-pointer hover:border-[var(--color-brand-400)]',
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
  card: 'group flex cursor-grab flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] active:cursor-grabbing',
  cardTitle: 'text-sm leading-snug font-medium',
  cardMeta: 'flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-ink-subtle)]',
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
  weekdays:
    'border-b border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  weekdaysMonth: 'grid grid-cols-7',
  weekdaysWeek: 'grid grid-cols-[4rem_repeat(7,minmax(0,1fr))]',
  weekday: 'px-2 py-2 text-center',
  month: 'grid grid-cols-7',
  day: 'group relative flex min-h-28 flex-col gap-1 border-r border-b border-[var(--color-border)] p-1.5 last:border-r-0',
  dayOutside: 'bg-[var(--color-surface)]/50',
  dayToday: 'bg-[var(--color-brand-soft)]/40',
  dayNumber: 'text-xs font-semibold tabular-nums',
  dayNumberOutside: 'text-[var(--color-ink-subtle)]',
  dayAdd:
    'absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-600)]',
  entry:
    'flex w-full cursor-grab items-center gap-1.5 rounded-[var(--radius-sm)] px-1.5 py-1 text-left text-xs transition-opacity hover:opacity-80 active:cursor-grabbing',
  entryTime: 'shrink-0 tabular-nums opacity-70',
  entryTitle: 'truncate font-medium',
  overflow: 'px-1.5 text-xs text-[var(--color-ink-subtle)]',
  week: 'grid grid-cols-[4rem_repeat(7,minmax(0,1fr))]',
  hour: 'border-r border-b border-[var(--color-border)] px-2 py-1 text-right text-xs text-[var(--color-ink-subtle)] tabular-nums',
  slot: 'flex min-h-12 flex-col gap-1 border-r border-b border-[var(--color-border)] p-1 last:border-r-0',
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
  panel: 'flex flex-col gap-3 border-t border-[var(--color-border)] pt-4',
  options: 'flex flex-wrap items-start gap-3',
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
    'rounded-[var(--radius-sm)] bg-[var(--color-brand-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand-600)] tabular-nums',
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
  blockLabel:
    'text-[11px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  example: 'rounded-[var(--radius-md)] p-3 text-sm',
  warning:
    'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 font-[family-name:var(--font-mono)] text-xs',
  ladder: 'flex flex-col gap-1',
  rung: 'flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5',
  rungLabel: 'min-w-24 text-xs text-[var(--color-ink-subtle)]',
} as const

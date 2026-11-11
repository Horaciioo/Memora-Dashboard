// Ring around a picked card or entry
export const PICK_RING =
  'ring-2 ring-[var(--color-pick)] ring-offset-1 ring-offset-[var(--color-surface-raised)]'

// Bar listing what a selection can do
export const SELECTION_BAR =
  'flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-brand-400)] bg-[var(--color-brand-soft)]/60 px-3 py-2 text-sm'

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
  cardNotes: 'h-4 w-4 shrink-0 text-[var(--color-ink-accent)]',
  stack: 'flex flex-col gap-2',
  item: 'flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-3 md:gap-3 md:px-4 transition-[border-color,box-shadow] hover:border-[var(--color-border-strong)]',
  // Row washed in its stored colour on a phone
  itemAccent:
    'bg-linear-to-r from-[color-mix(in_srgb,var(--accent)_24%,transparent)] via-[color-mix(in_srgb,var(--accent)_8%,transparent)] to-transparent md:bg-none',
  // Words a phone drops
  desktopOnly: 'hidden md:inline-flex',
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
    'flex shrink-0 items-center gap-1 text-xs font-medium whitespace-nowrap text-[var(--color-ink-subtle)] italic',
  cardAbsentGlyph: 'h-3.5 w-3.5 shrink-0',
  cardAbsentEmblems: 'opacity-50 grayscale',
  // One box per row on a phone
  grid: 'grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3',
  // Glyphs stay on the right, the notes word goes on a phone
  cardExtra: 'contents',
  cardNotesWrap: 'hidden md:inline-flex',
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
  scroller: 'flex flex-col gap-3 md:flex-row md:gap-4 md:overflow-x-auto md:pb-2',
  columnShown: 'flex',
  column:
    'w-full shrink-0 flex-col gap-2 md:max-w-96 md:min-w-40 md:flex-1 md:basis-0 md:shrink rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-2.5',
  columnArchived: 'opacity-60',
  // Column glass tinted by its classic colour
  columnTint:
    'accent-tint accent-border border bg-clip-padding shadow-[inset_0_1px_0_var(--glass-line),var(--shadow-md)]',
  columnHead: 'flex items-center justify-between gap-2 px-2 py-1.5',
  // Folds the lane on a phone
  columnToggle:
    'flex min-h-11 w-full items-center justify-between gap-2 text-left md:min-h-0 md:cursor-default',
  columnChevron: 'size-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform md:hidden',
  columnTitle: 'text-sm font-bold tracking-wide text-[var(--color-ink)] uppercase',
  columnCount: 'ml-1.5 text-xs font-normal tracking-normal text-[var(--color-ink-subtle)] italic',
  count:
    'rounded-[var(--radius-sm)] bg-[var(--color-surface-raised)] px-2 py-0.5 text-xs text-[var(--color-ink-subtle)]',
  body: 'flex min-h-24 flex-col gap-2 rounded-[var(--radius-md)] p-1',
  card: 'group flex cursor-pointer flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3.5 shadow-[var(--shadow-sm)] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] md:cursor-grab md:active:cursor-grabbing motion-reduce:transition-none motion-reduce:hover:translate-y-0',
  // Card sits lighter than its column so the two glass layers do not muddy
  cardGlass: 'bg-[var(--color-surface-raised)]/70',
  cardTint: 'accent-border bg-[var(--color-surface-raised)]/70',
  cardTitle: 'text-body leading-snug font-bold',
  // Where a card comes from, under a divider
  cardOrigin: 'border-t border-[var(--color-border)] pt-2 text-xs text-[var(--color-ink-subtle)]',
  // Glyph flowing before a title
  cardGlyph: 'mr-1.5',
  cardSelected: PICK_RING,
  // Rectangle drawn over empty space
  marquee:
    'pointer-events-none fixed z-50 rounded-[var(--radius-sm)] border border-[var(--color-pick)] bg-[var(--color-pick)]/15',
} as const

/**
 * Filter bar styles — a filter icon opening the dropdown sheet
 * @type {Record<string, string>}
 */

export const FILTER_STYLES = {
  bar: 'flex flex-wrap items-center gap-2',
  iconButton:
    'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-ink-subtle)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-ink)]',
  iconButtonActive: 'border-[var(--color-brand-400)] text-[var(--color-ink-accent)]',
  iconButtonDanger:
    '!border-transparent !bg-[color-mix(in_srgb,var(--color-danger)_60%,#f4b0b0)] !text-black hover:!border-transparent hover:!text-black',
  glyph: 'h-4 w-4',
  tally:
    'absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand-600)] px-1 text-micro font-bold text-[var(--color-on-brand)] tabular-nums',
  searchGroup: 'flex items-center gap-2',
  searchInput:
    'search-expand w-0 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-2 text-sm text-[var(--color-ink)] opacity-0 outline-none placeholder:text-[var(--color-ink-subtle)]',
  searchInputOpen: 'w-48 px-3 opacity-100 sm:w-64',
  trailing: 'ml-auto flex items-center gap-2',
  // Divider lower
  panel: 'mt-3 flex flex-wrap items-start gap-3 border-t border-[var(--color-border)] pt-4',
  options: 'flex flex-1 flex-wrap items-start gap-3',
  reset: 'shrink-0',
  optionField: 'w-full sm:w-72',
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
    'rounded-[var(--radius-sm)] bg-[var(--color-brand-600)] px-2 py-0.5 text-micro font-semibold text-[var(--color-on-brand)] tabular-nums',
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
    'font-[family-name:var(--font-mono)] text-micro tracking-wide text-[var(--color-ink-subtle)] uppercase',
  value: 'flex items-baseline gap-2',
  figure: 'text-2xl font-bold tracking-tight tabular-nums',
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
 * Admin tab of a moderator file
 * @type {Record<string, string>}
 */

export const MEMBER_ADMIN = {
  stack: 'flex flex-col gap-6',
  // State lines and their button
  state: 'flex flex-col gap-3',
  stateLine: 'flex items-center gap-2 text-sm',
  stateGlyph: 'h-5 w-5 shrink-0',
  stateEmphasis: 'font-bold',
  stateTones: {
    success: 'text-[var(--color-success)]',
    caution: 'text-[var(--color-caution)]',
    danger: 'text-[var(--color-danger)]',
  },
  stateActions: 'flex flex-wrap gap-2 pt-1',
  // Gestures side by side, divider stops short of both ends
  split: 'flex flex-row',
  // Role box left, state box right
  pair: 'grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2',
  cell: 'relative flex min-w-0 flex-1 flex-col items-center gap-2 px-2 py-4 text-center not-first:before:absolute not-first:before:inset-y-4 not-first:before:left-0 not-first:before:w-px not-first:before:bg-[var(--color-border)] sm:px-4',
  cellNote: 'text-xs text-[var(--color-ink-subtle)]',
  // Sanction drawer fields
  form: 'flex flex-col gap-5',
} as const

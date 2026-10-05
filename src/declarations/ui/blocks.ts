import {
  EMPTY_VALUE,
  PROPERTY_LABEL,
  PROPERTY_SPACING,
  PROPERTY_VALUE,
} from '@/declarations/ui/variants/controls'

/**
 * Floating hint layer and bubble classes
 * @type {Record<string, string>}
 */

export const FLOATING_HINT = {
  layer: 'pointer-events-none fixed inset-0 z-[75]',
  bubble:
    'floating-hint-bubble pointer-events-none absolute flex -translate-x-1/2 -translate-y-full items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] glass-panel px-3 py-1.5 text-xs shadow-[var(--shadow-md)]',
  icon: 'h-3.5 w-3.5',
} as const

/**
 * Application shell classes
 * @type {Record<string, string>}
 */

export const APP_SHELL = {
  // Room right of the page for the rim
  frame: 'app-tone flex min-h-dvh bg-[var(--color-background)] md:pr-3',
  // Window the page shows through
  window:
    'app-frame pointer-events-none fixed inset-y-3 right-3 left-[var(--shell-sidebar-w)] z-[35] hidden md:block',
  // No rail
  windowBare: 'app-frame pointer-events-none fixed inset-3 z-[35] hidden md:block',
  // Scrollbar inside the window
  windowTrack:
    'group/track pointer-events-auto absolute top-[var(--radius-xl)] right-1 bottom-[var(--radius-xl)] w-2.5 cursor-pointer',
  windowThumb:
    'absolute inset-x-0.5 top-0 cursor-grab rounded-full bg-[var(--color-ink)]/25 transition-[background-color,left,right] duration-[var(--motion-duration-fast)] group-hover/track:inset-x-0 group-hover/track:bg-[var(--color-ink)]/40 active:cursor-grabbing active:bg-[var(--color-ink)]/50',
  // Positioned so the page banner can span the whole column
  main: 'relative flex min-w-0 flex-1 flex-col',
  // Gutters widen past md so a page never welds itself to either rail
  content:
    'shell-page mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 sm:px-6 sm:pt-8 md:px-8 md:pt-[calc(var(--banner-h)+2.5rem)]',
  breadcrumbs: 'hidden flex-wrap items-center gap-1 text-xs text-[var(--color-ink-subtle)] sm:flex',
  // Below sm the trail folds to a single back link to the parent
  breadcrumbsCompact: 'flex items-center gap-1 text-xs text-[var(--color-ink-subtle)] sm:hidden',
  crumbLink: 'transition-colors hover:text-[var(--color-ink)]',
  crumbCurrent: 'font-medium text-[var(--color-ink)]',
} as const

/**
 * Boxes opened from the rail
 * @type {Record<string, string>}
 */

export const RAIL_POPOVER = {
  scrim: 'fixed inset-0 z-[65]',
  panel:
    'rail-reset surface-enter fixed bottom-6 left-[calc(var(--shell-sidebar-w)+1.5rem)] z-[70] flex max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] glass-panel shadow-[var(--shadow-lg)]',
  bell: 'w-[26rem] max-w-[calc(100vw-var(--shell-sidebar-w)-3rem)]',
  account: 'w-80',
  // Glyph above the title
  head: 'relative flex shrink-0 flex-col items-center gap-1.5 border-b border-[var(--color-border)] px-4 pt-5 pb-4 text-center',
  headGlyph: 'h-8 w-8 shrink-0',
  headTitle: 'text-xl leading-none font-bold tracking-tight',
  headMeta: 'text-xs font-semibold text-[var(--color-ink-subtle)]',
  headAction: 'absolute top-2 right-2',
  body: 'min-h-0 flex-1 overflow-y-auto p-2',
} as const

/**
 * Left sidebar classes
 * @type {Record<string, string>}
 */

export const LEFT_SIDEBAR = {
  // Rail standing on the frame
  rail: 'rail-ground relative z-40 font-[family-name:var(--font-system)] hidden w-[var(--shell-sidebar-w)] shrink-0 flex-col py-3 md:sticky md:top-0 md:flex md:h-dvh',
  // Page panel in the rail
  slot: 'flex min-h-0 flex-1 flex-col px-3',
  // Creator switch
  creatorRow: 'flex shrink-0 justify-center px-3',
  // Search bar
  searchRow: 'flex shrink-0 px-3',
  // Pins footer down
  nav: 'flex min-h-0 w-full flex-1 flex-col gap-5 overflow-y-auto px-3 pt-7',
  navGroup: 'flex flex-col gap-1.5',
  navGroupLabel:
    'group flex w-full items-center gap-1 px-2.5 pb-1 text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase transition-colors hover:text-[var(--color-ink)]',
  navGroupChevron:
    'h-3.5 w-3.5 shrink-0 opacity-0 transition-[transform,opacity] group-hover:opacity-100 group-focus-visible:opacity-100',
  navGroupChevronCollapsed: '-rotate-90',
  navGroupItems: 'flex flex-col gap-0.5',
  navLink:
    'group flex items-center gap-3 rounded-[var(--radius-md)] py-1.5 pr-2.5 pl-4 text-lg font-medium text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface)]',
  navLinkActive: 'font-bold text-[var(--color-brand-600)]',
  navLabel: 'relative',
  navIcon: 'h-[18px] w-[18px] shrink-0 transition-colors',
  navIconActive: 'fill-[var(--color-brand-soft)] text-[var(--color-brand-600)]',
  // Account footer
  footer:
    'flex shrink-0 items-center justify-between gap-1 border-t border-[var(--color-border)] px-3 pt-3',
  footerAccount:
    'flex min-w-0 flex-1 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors hover:bg-[var(--color-hover)]',
  footerName: 'min-w-0 flex-1 truncate text-base font-semibold',
  footerActions: 'flex shrink-0 items-center gap-0.5',
  footerIcon: 'h-4 w-4 shrink-0',
  // Version under the nav
  version:
    'mx-3 mt-2 mb-1 shrink-0 self-start rounded-[var(--radius-sm)] px-2 py-1 font-[family-name:var(--font-mono)] text-micro tracking-wide text-[var(--color-ink-subtle)] uppercase transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  // View tints need a page plate
  footerPlate:
    'rail-reset bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-hover)]',
} as const

/**
 * Search launcher classes
 * @type {Record<string, string>}
 */

export const SEARCH_LAUNCHER = {
  bar: 'glass-panel flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  barLabel: 'flex-1 truncate text-body',
  barShortcut:
    'shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-hover)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-micro font-medium text-[var(--color-ink-subtle)]',
} as const

/**
 * Floating bottom nav pill classes — icon only
 * @type {Record<string, string>}
 */

export const MOBILE_NAV = {
  bar: 'fixed bottom-[calc(0.75rem_+_env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-0.5 rounded-[var(--radius-full)] bg-[var(--color-nav-surface)] px-2 py-1.5 shadow-[var(--shadow-lg)] md:hidden',
  link: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-full)] transition-colors',
  // No colour here — one of the two below always wins
  icon: 'h-5 w-5 shrink-0 transition-colors',
  iconIdle: 'text-[var(--color-nav-ink)]',
  iconActive: 'text-[var(--color-brand-600)]',
  // Round button flanking the pill
  fab: 'fixed bottom-[calc(0.75rem_+_env(safe-area-inset-bottom))] z-40 flex h-14 w-14 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-nav-surface)] text-[var(--color-nav-ink)] shadow-[var(--shadow-lg)] md:hidden',
  fabLeft: 'left-3',
  fabRight: 'right-3',
} as const

/**
 * Mobile top bar classes
 * @type {Record<string, string>}
 */

export const TOP_BAR = {
  bar: 'sticky top-0 z-40 flex h-[var(--shell-top-bar-h)] items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 md:hidden',
  creator: 'flex min-w-0 flex-1 items-center gap-2',
  creatorName: 'truncate text-sm font-semibold',
  actions: 'flex shrink-0 items-center gap-1',
  avatarButton:
    'shrink-0 rounded-full ring-2 ring-transparent transition-shadow hover:ring-[var(--color-border-strong)]',
} as const

/**
 * Account sheet classes
 * @type {Record<string, string>}
 */

export const ACCOUNT_SHEET = {
  stack: 'flex flex-col',
  row: 'flex flex-wrap items-center justify-between gap-2 pb-3',
  label: PROPERTY_LABEL,
  divider: 'h-px bg-[var(--color-border)]',
  // A single row of glyph-only actions
  iconRow: 'flex items-stretch pt-1',
  // Colour lives in the exclusive tones below
  iconButton: 'flex flex-1 items-center justify-center py-3 transition-colors',
  iconIdle: 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]',
  iconButtonDanger: 'text-[var(--color-danger)] hover:brightness-90',
  icon: 'h-5 w-5',
  iconDivider: 'w-px shrink-0 bg-[var(--color-border)]',
  dot: 'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--color-danger)] ring-2 ring-[var(--color-surface-raised)]',
  signOutForm: 'flex flex-1',
} as const

/**
 * More sheet classes
 * @type {Record<string, string>}
 */

export const MOBILE_MORE = {
  wrapper: 'flex flex-col gap-5',
  section: 'flex flex-col gap-2',
  sectionLabel:
    'px-1 text-micro font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  grid: 'grid grid-cols-3 gap-2',
  tile: 'flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3 text-center transition-colors hover:border-[var(--color-border-strong)]',
  tileIcon: 'h-5 w-5 text-[var(--color-ink-subtle)]',
  tileLabel: 'text-xs leading-tight font-medium',
} as const

/**
 * Account menu classes
 * @type {Record<string, string>}
 */

export const ACCOUNT_BLOCK = {
  trigger:
    'flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors hover:bg-[var(--color-surface)]',
  name: 'truncate text-sm font-semibold',
  meta: 'truncate font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-subtle)]',
} as const

/**
 * Detail sheet classes
 * @type {Record<string, string>}
 */

export const DETAIL_BLOCK = {
  grid: `grid grid-cols-1 sm:grid-cols-2 ${PROPERTY_SPACING.rows} ${PROPERTY_SPACING.columns}`,
  entry: `flex min-w-0 flex-col ${PROPERTY_SPACING.within}`,
  stack: `flex flex-col ${PROPERTY_SPACING.rows}`,
  // Long text runs edge to edge
  entryWide: `flex min-w-0 flex-col sm:col-span-2 ${PROPERTY_SPACING.within}`,
  label: PROPERTY_LABEL,
  value: `text-sm break-words ${PROPERTY_VALUE}`,
  empty: `text-sm ${EMPTY_VALUE}`,
} as const

/**
 * Statistic strip classes
 * @type {Record<string, string>}
 */

export const METRIC_BLOCK = {
  row: 'flex flex-wrap items-center gap-x-6 gap-y-2',
  entry: 'flex items-baseline gap-1.5',
  value: 'text-lg font-bold tabular-nums',
  label: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Moderator file classes
 * @type {Record<string, string>}
 */

export const MEMBER_BLOCK = {
  frame: 'relative',
  // Official logo on the portrait's corner
  divisionLogo: 'absolute -right-3 -bottom-3 h-14 w-14 drop-shadow-md',
  // Division stamped on the portrait's corner
  division:
    'absolute -right-1 -bottom-1 flex h-10 min-w-10 items-center justify-center rounded-full bg-[var(--color-brand-600)] px-1.5 text-sm font-bold text-[var(--color-on-brand)] ring-4 ring-[var(--color-surface-raised)]',
  portrait:
    'block shrink-0 rounded-full ring-4 ring-[var(--color-surface-raised)] transition-[filter] enabled:cursor-pointer enabled:hover:brightness-95 disabled:cursor-default',
  // Role glyph pinned to the portrait's corner
  emblem:
    'absolute -right-1 -bottom-1 h-9 w-9 rounded-full bg-[var(--color-surface)] p-1 ring-2 ring-[var(--color-surface)]',
  // Read-only function list
  marks: 'flex flex-wrap items-center gap-x-4 gap-y-2',
  mark: 'inline-flex items-center gap-2',
} as const

/**
 * Moderator file layout: an identity rail that stays put
 * @type {Record<string, string>}
 */

export const MEMBER_FILE = {
  layout: 'grid gap-8 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-start',
  main: 'flex min-w-0 flex-col gap-6',
  // Rail follows the scroll on wide screens only
  rail: 'flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface shadow-[var(--shadow-sm)] lg:sticky lg:top-6',
  head: 'flex flex-col items-center gap-2 px-5 pt-7 text-center',
  name: 'text-xl font-bold tracking-tight break-words',
  role: 'text-xs font-bold tracking-wide text-[var(--color-brand-800)] uppercase',
  status:
    'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink-subtle)]',
  // Dismissed or resigned
  departed: 'cursor-help text-xs font-bold tracking-wide text-[var(--color-danger)] uppercase',
  statusGlyph: 'h-4 w-4 shrink-0',
  functions: 'flex items-center justify-center gap-2',
  body: 'mt-5 border-t border-[var(--color-border)] p-5',
  groupTitle: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  lock: 'px-5 pt-3 text-center',
  // Property list of a rail
  railList: 'flex flex-col gap-5',
  railItem: 'flex flex-col gap-1.5',
  factValue: 'text-sm font-medium',
  factEmpty: 'text-sm text-[var(--color-ink-subtle)] italic',
  // Note card
  note: 'flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 shadow-[var(--shadow-sm)]',
  notePinned: 'border-[var(--color-brand-200)] bg-[var(--color-brand-50)]',
  noteHead: 'flex items-center gap-2 text-xs text-[var(--color-ink-subtle)]',
  noteBody: 'text-sm leading-relaxed whitespace-pre-wrap',
  notesGrid: 'grid gap-4 sm:grid-cols-2',
  // Social tile
  social:
    'flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-3 transition-colors hover:bg-[var(--color-hover)]',
  socialLogo:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)]',
  socialsGrid: 'grid gap-3 sm:grid-cols-2',
  more: 'self-start text-sm font-semibold text-[var(--color-brand-800)] underline-offset-4 hover:underline',
} as const

/**
 * Vertical list of stages joined by a rail
 * @type {Record<string, string>}
 */

export const STAGE_LIST = {
  stage: 'relative flex gap-4 pb-6 last:pb-0',
  stageRail: 'absolute top-12 bottom-0 left-[1.375rem] w-0.5 bg-[var(--color-border)]',
  stageChip:
    'z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)]',
  stageChipDone:
    'z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]',
  stageChipLate:
    'z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  stageChipOff:
    'z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--color-border-strong)] text-[var(--color-ink-subtle)]',
  stageBody: 'flex min-w-0 flex-1 flex-col gap-1.5 pt-1',
  stageHead: 'flex min-w-0 flex-wrap items-center gap-2.5',
  stageTitle: 'text-base font-bold tracking-tight',
  stageLead: 'text-sm text-[var(--color-ink-subtle)]',
  stageActions: 'flex flex-wrap items-center gap-3',
} as const

/**
 * Seal classes
 * @type {Record<string, string>}
 */

export const SEAL_BLOCK = {
  glyph:
    'h-6 w-24 shrink-0 text-[var(--color-ink-subtle)] transition-colors group-hover:text-[var(--color-brand-600)]',
  chain: 'opacity-60 transition-opacity duration-[var(--motion-duration-panel)]',
  chainOpen: 'opacity-20',
  // Each half slides away from the lock once the shackle lets go
  chainSide: 'transition-transform duration-[var(--motion-duration-panel)]',
  chainSlackLeft: '-translate-x-[3px]',
  chainSlackRight: 'translate-x-[3px]',
  lock: 'transition-transform duration-[var(--motion-duration-panel)]',
  body: 'fill-[var(--color-surface-sunken)]',
  trigger:
    'glyph-danger group inline-flex items-center gap-1.5 text-left text-[var(--color-danger)] transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-60',
  icon: 'h-4 w-4 shrink-0',
  hint: 'text-sm font-medium',
  value: 'flex flex-wrap items-center gap-2',
  window:
    'inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-micro text-[var(--color-ink-subtle)]',
} as const

/**
 * Enrolment classes
 * @type {Record<string, string>}
 */

export const TWO_FACTOR_BLOCK = {
  layout: 'flex flex-col gap-5 sm:flex-row sm:items-start',
  qr: 'shrink-0 self-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-scan-ground)] p-3 [&>svg]:h-40 [&>svg]:w-40',
  aside: 'flex min-w-0 flex-1 flex-col gap-3',
  secret:
    'flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm tracking-wide break-all',
  codes: 'grid grid-cols-2 gap-1.5 sm:grid-cols-3',
  code: 'rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] px-2 py-1 text-center font-[family-name:var(--font-mono)] text-xs tracking-wide',
  codeSpent: 'line-through opacity-40',
  digits:
    'w-full rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3 py-2 text-center font-[family-name:var(--font-mono)] text-lg tracking-wide text-[var(--color-on-field)] transition-colors hover:border-[var(--color-field-border-strong)]',
  panel: 'flex flex-col gap-4',
  field: 'flex flex-col gap-1.5',
  fieldLabel: PROPERTY_LABEL,
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  heading: 'text-xs font-semibold',
  note: 'text-xs text-[var(--color-ink-subtle)]',
  error: 'text-xs text-[var(--color-danger)]',
  footer: 'flex justify-end gap-2',
} as const

/**
 * Anchored responsables classes
 * @type {Record<string, string>}
 */

export const LEAD_BLOCK = {
  panel: 'flex flex-col gap-4',
  name: 'min-w-0 flex-1 truncate text-sm font-medium',
  note: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Console classes
 * @type {Record<string, string>}
 */

export const CONSOLE_BLOCK = {
  banner:
    'flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--view)]/35 bg-[var(--view)]/8 px-4 py-3',
  bannerGlyph:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--view)]/15 text-[var(--view)]',
  bannerIcon: 'h-4 w-4',
  bannerBody: 'flex min-w-0 flex-1 flex-col',
  bannerTitle: 'text-sm font-semibold text-[var(--color-ink)]',
  bannerLead: 'text-xs text-[var(--color-ink-subtle)]',
  grid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4',
  tile: 'flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4',
  tileLabel: 'text-xs font-medium tracking-wide text-[var(--color-ink-subtle)] uppercase',
  tileValue: 'font-[family-name:var(--font-display)] text-2xl leading-none',
  tileHint: 'text-xs text-[var(--color-ink-subtle)]',
  rows: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0',
  rowLabel: 'flex min-w-0 items-center gap-2 text-sm font-medium',
  rowIcon: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  rowMeta: 'font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
  rowStatus: 'flex flex-wrap items-center gap-2',
  cardHead: 'flex flex-wrap items-center gap-2',
  cardIcon: 'h-4 w-4 shrink-0 text-[var(--color-brand-600)]',
  cardTitle: 'font-bold',
  cardLead: 'text-sm text-[var(--color-ink-subtle)]',
  chooser: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3',
  choice:
    'flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 text-left transition-colors hover:border-[var(--view)] hover:bg-[var(--color-surface)]',
  choiceActive: 'border-[var(--view)] bg-[var(--view)]/8',
  choiceName: 'truncate text-sm font-semibold',
  choiceMeta: 'truncate text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Access console classes — a rail of roles that collapses into a three-tab panel
 * @type {Record<string, string>}
 */

export const ACCESS_CONSOLE = {
  shell: 'flex flex-col gap-6 lg:flex-row lg:items-start',
  rail: 'flex flex-col gap-5 lg:w-72 lg:shrink-0',
  railHidden: 'hidden lg:flex',
  category: 'flex flex-col gap-1',
  categoryHead:
    'flex items-center gap-2 px-1 pb-1 text-micro font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  row: 'group flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-sm transition-colors hover:bg-[var(--color-hover)]',
  rowActive: 'bg-[var(--color-hover)] font-medium',
  rowLocked: 'opacity-60',
  dot: 'h-3.5 w-[3px] shrink-0 rounded-full',
  rowIcon: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  rowLabel: 'min-w-0 flex-1 truncate',
  rowCount: 'shrink-0 text-xs tabular-nums text-[var(--color-ink-subtle)]',
  add: 'mt-1 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  addIcon: 'h-3.5 w-3.5',
  detail: 'min-w-0 flex-1',
  back: 'mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)] lg:hidden',
  toggle:
    'inline-flex items-center gap-1 text-sm text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  backIcon: 'h-4 w-4',
  detailHead: 'flex flex-wrap items-center gap-3 pb-8',
  detailActions: 'ms-auto flex shrink-0 items-center gap-2',
  detailDot: 'h-3 w-3 shrink-0 rounded-full',
  detailIcon: 'h-5 w-5 shrink-0 text-[var(--color-ink-subtle)]',
  detailName: 'text-lg font-bold',
  detailKind: 'text-xs text-[var(--color-ink-subtle)]',
  prompt:
    'rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] px-4 py-12 text-center text-sm text-[var(--color-ink-subtle)]',
  form: 'flex max-w-lg flex-col gap-4',
  members: 'flex flex-col gap-1',
  memberRow: 'flex items-center gap-1',
  simulation: 'flex max-h-[60vh] flex-col gap-4 overflow-y-auto',
  simulationSection: 'flex flex-col gap-2',
  simulationTitle: 'text-sm font-bold',
  simulationTags: 'flex flex-wrap gap-1.5',
  layerBar: 'pb-4',
  member:
    'flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-md)] px-2 py-1.5 transition-colors hover:bg-[var(--color-hover)]',
  memberName: 'min-w-0 flex-1 truncate text-sm',
  memberRole: 'shrink-0 text-xs text-[var(--color-ink-subtle)]',
  perimeter: 'flex flex-col gap-3',
  creator:
    'flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4',
  creatorHead: 'flex items-center gap-3',
  creatorName: 'min-w-0 flex-1 truncate text-sm font-semibold',
  creatorMeta: 'shrink-0 text-xs tabular-nums text-[var(--color-ink-subtle)]',
} as const

/**
 * Creator picker classes
 * @type {Record<string, string>}
 */

export const CREATOR_PICKER = {
  wrapper: 'flex flex-col gap-2',
  head: 'flex flex-wrap items-center gap-2',
  label: `px-0.5 ${PROPERTY_LABEL}`,
  list: 'flex flex-wrap items-center gap-1.5',
  option:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 transition-[opacity,box-shadow] hover:opacity-100 disabled:pointer-events-none disabled:opacity-40',
  optionIdle: 'opacity-50 ring-transparent',
  optionActive: 'opacity-100 ring-[var(--accent)]',
  optionIcon: 'h-5 w-5 shrink-0 text-[var(--color-ink-subtle)]',
} as const

/**
 * Creator switch classes
 * @type {Record<string, string>}
 */

export const CREATOR_SWITCH = {
  wrapper: 'relative flex shrink-0 items-center justify-center',
  trigger:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]',
  triggerIcon: 'h-5 w-5 shrink-0',
  panel:
    'rail-reset absolute top-1/2 left-full z-50 ml-2 flex -translate-y-1/2 items-center rounded-[var(--radius-full)] border border-[var(--color-border)] glass-panel p-1.5 shadow-[var(--shadow-md)] transition-[opacity,transform,visibility] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  panelOpen: 'visible translate-x-0 opacity-100',
  // Kept mounted so the way out animates like the way in
  panelShut: 'invisible -translate-x-3 opacity-0',
} as const

/**
 * Divider classes
 * @type {Record<string, string>}
 */

export const DIVIDER_BLOCK = {
  row: 'flex items-center gap-4 py-6',
  rule: 'h-px flex-1 bg-[var(--color-border)]',
  label: 'shrink-0 text-micro font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  // Standalone rule between two list rows
  medium: 'h-px w-full bg-[var(--color-border-strong)]',
} as const

/**
 * Release notes classes
 * @type {Record<string, string>}
 */

export const CHANGELOG_BOARD = {
  page: 'max-w-4xl',
  // Version pressed out
  hero: 'relative flex flex-col items-center gap-5 px-4 pt-6 pb-4 text-center',
  stage: 'flex flex-col items-center gap-1 [transform-style:preserve-3d]',
  eyebrow:
    'font-[family-name:var(--font-mono)] text-xs font-medium tracking-wide text-[var(--color-ink-subtle)] uppercase',
  numeral:
    'version-extrude font-[family-name:var(--font-display)] text-7xl leading-none font-bold tracking-tight tabular-nums sm:text-9xl',
  date: 'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-subtle)] uppercase',
  intro: 'max-w-2xl text-lg leading-relaxed text-balance text-[var(--color-ink)] sm:text-xl',
  // Three figures doubling as the way into each category
  counts: 'mt-2 flex flex-wrap items-stretch justify-center gap-3',
  count:
    'group flex min-w-36 flex-col items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface px-6 py-4 shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-[var(--motion-duration-moderate)] hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-600)]',
  countFigure: 'text-4xl leading-none font-bold tabular-nums',
  countLabel: 'text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  blocks: 'flex flex-col gap-16',
  category: 'flex scroll-mt-24 flex-col gap-8',
  categoryHead: 'flex items-center gap-4',
  categoryTitle: 'text-3xl font-bold tracking-tight sm:text-4xl',
  categoryRule: 'h-0.5 flex-1 rounded-full opacity-60',
  categoryCount:
    'font-[family-name:var(--font-mono)] text-sm tabular-nums text-[var(--color-ink-subtle)]',
  groups: 'flex flex-col gap-10',
  // Page name in the margin
  group: 'grid gap-3 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8',
  groupTitle:
    'flex items-center gap-2 text-sm font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase md:sticky md:top-24 md:self-start',
  groupIcon: 'h-4 w-4 shrink-0',
  groupBody: 'flex min-w-0 flex-col gap-4',
  comment:
    'border-l-4 border-[var(--color-brand-400)] pl-4 text-base leading-relaxed text-[var(--color-ink-subtle)] italic',
  commentLabel:
    'mb-1 block font-[family-name:var(--font-mono)] text-xs font-semibold tracking-wide text-[var(--color-brand-600)] uppercase not-italic',
  lines: 'flex flex-col divide-y divide-[var(--color-border)]',
  line: 'py-3 text-base leading-relaxed first:pt-0 last:pb-0',
  archive: 'flex flex-wrap justify-center gap-2',
  archiveHead: 'flex flex-col items-center gap-4 text-center',
  archiveTitle: 'text-xl font-bold tracking-tight',
  monthList: 'flex flex-col gap-1',
  releaseRow: 'flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2',
  releaseRowLink:
    'flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 transition-colors hover:bg-[var(--color-hover)]',
  releaseBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  releaseTitle: 'truncate text-sm font-semibold',
  releaseMeta:
    'font-[family-name:var(--font-mono)] text-micro tracking-wide text-[var(--color-ink-subtle)] uppercase',
  releaseCurrent:
    'shrink-0 font-[family-name:var(--font-mono)] text-micro tracking-wide text-[var(--color-brand-600)] uppercase',
  releaseChevron: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  empty: 'flex flex-col items-center gap-1 py-16 text-center',
  emptyTitle: 'text-base font-semibold',
  emptyLead: 'text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Release notice classes
 * @type {Record<string, string>}
 */

export const RELEASE_NOTICE = {
  wrap: 'relative',
  // Room above for the point
  wrapPointed: 'mx-3 pt-2.5 pb-1',
  // The ^ aimed at the version entry
  caret:
    'pointer-events-none absolute top-1 left-4 h-3 w-3 rotate-45 rounded-sm bg-[var(--color-halo-100)]',
  // Gold plate
  frame:
    'group/news relative z-10 overflow-hidden rounded-[var(--radius-lg)] bg-linear-to-br from-[var(--color-halo-100)] via-[var(--color-halo-300)] to-[var(--color-halo-400)] text-black shadow-[0_10px_28px_-10px_var(--color-halo-500)] ring-1 ring-white/40 ring-inset transition-shadow hover:shadow-[0_14px_34px_-10px_var(--color-halo-500)]',
  // Light white veil from the top left
  veil: 'pointer-events-none absolute inset-0 bg-linear-to-br from-white/50 via-white/10 to-transparent',
  link: 'relative block p-3.5 pr-10',
  sheen:
    'pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/55 to-transparent transition-[left] duration-[var(--motion-duration-celebrate)] ease-out group-hover/news:left-full motion-reduce:transition-none',
  kicker:
    'relative block font-[family-name:var(--font-mono)] text-micro font-bold tracking-wide text-black/70 uppercase',
  title: 'relative mt-1.5 line-clamp-2 block text-lg leading-tight font-bold tracking-tight',
  cta: 'relative mt-3 inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-micro font-bold text-[var(--color-halo-100)]',
  ctaIcon: 'h-3 w-3',
  dismiss:
    'absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full text-black/55 transition-colors hover:bg-white/35 hover:text-black',
  dismissIcon: 'h-3.5 w-3.5',
} as const

/**
 * Loading bar classes
 * @type {Record<string, string>}
 */

export const LOADING_BAR = {
  track: 'pointer-events-none fixed inset-x-0 top-0 z-[90] h-0.5 overflow-hidden',
  runner:
    'loading-bar-run absolute inset-y-0 w-2/5 rounded-full bg-linear-to-r from-transparent via-[var(--color-brand-500)] to-transparent',
} as const

/**
 * System screen classes
 * @type {Record<string, string>}
 */

export const SYSTEM_SCREEN = {
  // Alone on the page
  stage: 'flex min-h-dvh items-center justify-center px-4 py-16 sm:px-6',
  // Inside the shell
  inset: 'flex min-h-[60dvh] items-center justify-center py-12',
  column: 'flex w-full max-w-lg flex-col items-center gap-4 text-center',
  word: 'font-[family-name:var(--font-display)] text-8xl leading-none font-bold tracking-tight text-[var(--color-brand-600)] sm:text-9xl',
  title: 'text-2xl font-bold tracking-wide uppercase sm:text-3xl',
  description: 'max-w-sm text-sm leading-relaxed text-[var(--color-ink-subtle)] sm:text-base',
  reference: 'font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
  action: 'pt-2',
  // Word inked like a rubber stamp
  stampWord:
    'stamp-strike -rotate-12 rounded-[var(--radius-lg)] border-[6px] border-double border-current px-5 py-1 font-[family-name:var(--font-display)] text-7xl leading-none font-bold tracking-tight text-[var(--color-danger)] uppercase opacity-90 sm:text-8xl',
} as const

/**
 * Notification bubble classes
 * @type {Record<string, string>}
 */

export const NUDGE = {
  // Centred on the entry
  anchor: 'fixed z-[45] hidden -translate-y-1/2 md:block',
  // One shadow over bubble and tip
  bubble:
    'nudge-enter relative flex items-center gap-1 rounded-full bg-[var(--color-brand-800)] py-1 pr-1 pl-4 text-[var(--color-on-brand)] [filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.3))_drop-shadow(0_0.5rem_1rem_rgb(0_0_0/0.18))]',
  closing: 'nudge-close',
  // Tip aimed at the entry
  tail: 'pointer-events-none absolute top-1/2 -left-[0.5625rem] h-[1.125rem] w-3 -translate-y-1/2 text-[var(--color-brand-800)]',
  label: 'relative truncate py-1.5 text-left text-sm font-semibold',
  close:
    'relative flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-on-brand)]/80 transition-colors hover:bg-[var(--color-on-brand)]/15 hover:text-[var(--color-on-brand)]',
  closeIcon: 'h-4 w-4',
} as const

/**
 * Creator and account menu classes
 * @type {Record<string, string>}
 */

export const CREATOR_MENU = {
  wrapper: 'relative min-w-0 flex-1',
  trigger:
    'flex w-full min-w-0 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors hover:bg-[var(--color-hover)]',
  // Same footprint as a portrait
  noneGlyph: 'h-8 w-8 shrink-0 p-1',
  name: 'min-w-0 flex-1 truncate text-body font-medium',
  chevron: 'h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none',
  // Closed points down
  chevronShut: 'rotate-0',
  chevronOpen: 'rotate-180',
  body: 'flex flex-col gap-2 p-3',
  divider: 'h-px bg-[var(--color-border)]',
  heading: `px-1 pt-1 ${PROPERTY_LABEL}`,
  list: 'flex max-h-64 flex-col gap-0.5 overflow-y-auto',
  option:
    'flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-left text-sm transition-colors disabled:opacity-60',
  optionIdle: 'hover:bg-[var(--color-hover)]',
  optionActive: 'bg-[var(--color-hover)] font-semibold',
  optionName: 'min-w-0 flex-1 truncate',
  // Creator accent dot
  optionMark: 'h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]',
} as const

/**
 * Setting cards: theme, text size, colour vision
 * @type {Record<string, string>}
 */

export const PICKER_BLOCK = {
  pair: 'grid gap-6 lg:grid-cols-2',
  group: 'flex flex-col gap-2.5',
  title: 'flex items-center gap-2 text-sm font-semibold',
  three: 'grid grid-cols-3 gap-2',
  two: 'grid grid-cols-2 gap-2',
  option:
    'flex flex-col items-center justify-end gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-[border-color,transform] hover:-translate-y-px hover:border-[var(--color-border-strong)]',
  optionWide:
    'flex flex-col items-start gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition-[border-color,transform] hover:-translate-y-px hover:border-[var(--color-border-strong)]',
  active:
    'border-[var(--color-brand-600)] bg-[var(--color-brand-50)] ring-2 ring-[var(--color-brand-600)]/20',
  glyph: 'h-9 w-9',
  sample: 'leading-none font-bold tracking-tight',
  label: 'text-xs font-semibold text-[var(--color-ink-subtle)]',
  description: 'text-xs leading-snug text-[var(--color-ink-subtle)]',
} as const

/**
 * Glyph-led rows of the security tab
 * @type {Record<string, string>}
 */

export const SECURITY_LIST = {
  list: '-my-1 divide-y divide-[var(--color-border)]',
  row: 'flex items-center gap-3.5 py-3',
  glyph: 'h-9 w-9 shrink-0',
  body: 'min-w-0 flex-1 space-y-0.5',
  title: 'flex flex-wrap items-center gap-2 text-sm font-bold tracking-tight',
  current: 'text-xs font-semibold text-[var(--color-success)]',
  meta: 'flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--color-ink-subtle)]',
  time: 'shrink-0 text-xs text-[var(--color-ink-subtle)] tabular-nums',
  status: 'inline-flex items-center gap-1.5 text-xs font-semibold',
  on: 'text-[var(--color-success)]',
  off: 'glyph-danger text-[var(--color-danger)]',
  statusGlyph: 'h-4 w-4 shrink-0',
  footer: 'mt-3 flex flex-wrap justify-center gap-2 border-t border-[var(--color-border)] pt-4',
} as const

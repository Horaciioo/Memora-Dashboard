/**
 * Floating hint layer and bubble classes
 * @type {Record<string, string>}
 */

export const FLOATING_HINT = {
  layer: 'pointer-events-none fixed inset-0 z-[75]',
  bubble:
    'floating-hint-bubble pointer-events-none absolute flex -translate-x-1/2 -translate-y-full items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs shadow-[var(--shadow-md)]',
  icon: 'h-3.5 w-3.5',
} as const

/**
 * Application shell classes
 * @type {Record<string, string>}
 */

export const APP_SHELL = {
  frame: 'flex min-h-dvh bg-[var(--color-background)]',
  sidebar:
    'hidden w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-raised)] md:sticky md:top-0 md:flex md:h-dvh',
  brand:
    'flex items-center justify-center border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-4 py-6',
  brandLogo: 'h-auto w-40',
  search: 'px-3 pt-3',
  searchTrigger:
    'flex w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink-subtle)] transition-colors hover:border-[var(--color-border-strong)]',
  searchHint:
    'ml-auto hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] sm:block',
  nav: 'flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4',
  navGroup: 'flex flex-col gap-1',
  navGroupLabel:
    'px-2 pb-1 text-[11px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  navLink:
    'group flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface)]',
  navLinkActive: 'font-semibold text-[var(--color-brand-600)]',
  navLabel: 'relative',
  navLabelActive: 'nav-underline',
  navIcon: 'h-4 w-4 shrink-0 transition-colors',
  navIconActive: 'fill-[var(--color-brand-soft)] text-[var(--color-brand-600)]',
  navBadge:
    'ml-auto rounded-[var(--radius-sm)] bg-[var(--color-warning)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-on-brand)]',
  sidebarFooter: 'border-t border-[var(--color-border)] p-3',
  accountRow: 'grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-1',
  accountControls: 'flex shrink-0 items-center gap-1 [&_button]:h-8 [&_button]:w-8',
  accountControlsLeft: 'justify-end',
  accountControlsRight: 'justify-start',
  accountAvatar:
    'justify-self-center rounded-[var(--radius-sm)] transition-opacity hover:opacity-80',
  accountDivider: 'h-5 w-px shrink-0 bg-[var(--color-border)]',
  viewToggle:
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--bolt)] transition-colors hover:bg-[var(--color-surface)] disabled:pointer-events-none disabled:opacity-50',
  viewToggleIcon: 'h-[18px] w-[18px] shrink-0 fill-current',
  viewRibbon:
    'mx-3 mt-3 flex items-baseline gap-2 rounded-[var(--radius-md)] border-l-2 border-[var(--view)] bg-[var(--view)]/8 px-2.5 py-1.5',
  viewRibbonLabel: 'truncate text-[11px] font-semibold tracking-wide text-[var(--view)] uppercase',
  main: 'flex min-w-0 flex-1 flex-col',
  content: 'shell-page mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 sm:px-6 sm:pt-8',
  breadcrumbs: 'hidden flex-wrap items-center gap-1 text-xs text-[var(--color-ink-subtle)] sm:flex',
  // Below sm the trail folds to a single back link to the parent
  breadcrumbsCompact: 'flex items-center gap-1 text-xs text-[var(--color-ink-subtle)] sm:hidden',
  crumbLink: 'transition-colors hover:text-[var(--color-ink)]',
  crumbCurrent: 'font-medium text-[var(--color-ink)]',
} as const

/**
 * Floating bottom nav pill classes — icon only, dark surface in both themes
 * @type {Record<string, string>}
 */

export const MOBILE_NAV = {
  bar: 'fixed bottom-[calc(0.75rem_+_env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-0.5 rounded-[var(--radius-full)] bg-[var(--color-nav-surface)] px-2 py-1.5 shadow-[var(--shadow-lg)] md:hidden',
  link: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-full)] transition-colors',
  // No colour here — one of the two below always wins, cn() is clsx so order alone would not
  icon: 'h-5 w-5 shrink-0 transition-colors',
  iconIdle: 'text-[var(--color-nav-ink)]',
  iconActive: 'text-[var(--color-brand-600)]',
  // Round button flanking the pill, same dark surface and outer size (56px)
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
  avatarButton: 'shrink-0 rounded-full transition-opacity hover:opacity-80',
} as const

/**
 * Account sheet classes, opened from the mobile top bar avatar
 * @type {Record<string, string>}
 */

export const ACCOUNT_SHEET = {
  stack: 'flex flex-col',
  row: 'flex flex-wrap items-center justify-between gap-2 pb-3',
  label: 'text-sm font-medium',
  divider: 'h-px bg-[var(--color-border)]',
  // A single row of glyph-only actions, split by vertical hairlines
  iconRow: 'flex items-stretch pt-1',
  iconButton:
    'flex flex-1 items-center justify-center py-3 text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  iconButtonDanger: 'text-[var(--color-danger)] hover:text-[var(--color-danger)]',
  icon: 'h-5 w-5',
  iconDivider: 'w-px shrink-0 bg-[var(--color-border)]',
  dot: 'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--color-danger)] ring-2 ring-[var(--color-surface-raised)]',
} as const

/**
 * More sheet classes, opened from the nav pill
 * @type {Record<string, string>}
 */

export const MOBILE_MORE = {
  wrapper: 'flex flex-col gap-5',
  section: 'flex flex-col gap-2',
  sectionLabel:
    'px-1 text-[11px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
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
  grid: 'grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2',
  entry: 'flex min-w-0 flex-col gap-0.5',
  label: 'text-[11px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  value: 'text-sm break-words',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
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
  header: 'flex flex-wrap items-start gap-4',
  portrait:
    'shrink-0 rounded-[var(--radius-sm)] transition-opacity enabled:cursor-pointer enabled:hover:opacity-80 disabled:cursor-default',
  identity: 'flex min-w-0 flex-1 flex-col gap-2',
  tags: 'flex flex-wrap items-center gap-2',
  // Faces the portrait across the row, drawn at the same size
  crest: 'h-16 w-16 shrink-0 self-center object-contain',
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
    'group inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] px-2.5 py-1 text-left transition-colors hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-soft)]/40 disabled:pointer-events-none disabled:opacity-60',
  hint: 'text-xs text-[var(--color-ink-subtle)] transition-colors group-hover:text-[var(--color-brand-600)]',
  value: 'flex flex-wrap items-center gap-2',
  window:
    'inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-[11px] text-[var(--color-ink-subtle)]',
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
    'flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm tracking-[0.18em] break-all',
  codes: 'grid grid-cols-2 gap-1.5 sm:grid-cols-3',
  code: 'rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] px-2 py-1 text-center font-[family-name:var(--font-mono)] text-xs tracking-wider',
  codeSpent: 'line-through opacity-40',
  digits:
    'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-center font-[family-name:var(--font-mono)] text-lg tracking-[0.5em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-border-strong)]',
  panel: 'flex flex-col gap-4',
  field: 'flex flex-col gap-1.5',
  fieldLabel: 'text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
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
  tile: 'flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4',
  tileLabel: 'text-xs font-medium tracking-wide text-[var(--color-ink-subtle)] uppercase',
  tileValue: 'font-[family-name:var(--font-display)] text-2xl leading-none',
  tileHint: 'text-xs text-[var(--color-ink-subtle)]',
  rows: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0',
  rowLabel: 'flex min-w-0 items-center gap-2 text-sm font-medium',
  rowIcon: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  rowMeta: 'font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
  rowStatus: 'flex flex-wrap items-center gap-2',
  chooser: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3',
  choice:
    'flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 text-left transition-colors hover:border-[var(--view)] hover:bg-[var(--color-surface)]',
  choiceActive: 'border-[var(--view)] bg-[var(--view)]/8',
  choiceName: 'truncate text-sm font-semibold',
  choiceMeta: 'truncate text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Access matrix classes
 * @type {Record<string, string>}
 */

export const ACCESS_BLOCK = {
  locked: 'text-xs text-[var(--color-ink-subtle)]',
  badgeRow: 'pb-3',
} as const

/**
 * Creator picker classes
 * @type {Record<string, string>}
 */

export const CREATOR_SELECT = {
  wrapper: 'flex flex-col gap-1.5 px-3 pt-3',
  label: 'px-0.5 text-[11px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
} as const

/**
 * Divider classes
 * @type {Record<string, string>}
 */

export const DIVIDER_BLOCK = {
  row: 'flex items-center gap-4 py-6',
  rule: 'h-px flex-1 bg-[var(--color-border)]',
  label:
    'shrink-0 text-[11px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
} as const

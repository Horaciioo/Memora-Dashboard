import {
  EDITING_MARK,
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
  frame: 'app-tone page-ground flex min-h-dvh md:pr-3',
  // Page with no rail, no rim, nothing around it
  frameBare: 'app-tone flex min-h-dvh bg-[var(--twitch-ground)]',
  // Window the page shows through
  window:
    'app-frame pointer-events-none fixed inset-y-3 right-3 left-[var(--shell-sidebar-w)] z-[35] transition-[left] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none hidden md:block print:hidden',
  // No rail
  windowBare: 'app-frame pointer-events-none fixed inset-3 z-[35] hidden md:block print:hidden',
  // Scrollbar inside the window
  windowTrack:
    'group/track pointer-events-auto absolute top-[var(--radius-window)] right-1 bottom-[var(--radius-window)] w-2.5 cursor-pointer',
  windowThumb:
    'absolute inset-x-0.5 top-0 cursor-grab rounded-full bg-[var(--color-ink)]/25 transition-[background-color,left,right] duration-[var(--motion-duration-fast)] group-hover/track:inset-x-0 group-hover/track:bg-[var(--color-ink)]/40 active:cursor-grabbing active:bg-[var(--color-ink)]/50',
  // Positioned so the page banner can span the whole column
  main: 'page-wash relative flex min-w-0 flex-1 flex-col bg-[var(--color-page)] md:ml-[var(--shell-sidebar-w)] md:transition-[margin-left] md:duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  // Gutters widen past md so a page never welds itself to either rail
  content:
    'shell-page mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 sm:px-6 sm:pt-8 md:px-8 md:pt-[calc(var(--banner-h)+2.5rem)] print:max-w-none print:p-0',
  // Trail on the photograph, the foot of the path stays whole
  breadcrumbs: 'hidden min-w-0 items-center gap-1 text-sm font-medium md:flex',
  crumb: 'flex min-w-0 items-center gap-1',
  crumbSeparator: 'size-3 shrink-0 opacity-60',
  crumbLink:
    'shrink-0 text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  crumbCategory: 'shrink-0 text-[var(--color-ink-subtle)]',
  crumbCurrent: 'truncate font-semibold',
} as const

/**
 * Boxes opened from the rail
 * @type {Record<string, string>}
 */

export const RAIL_POPOVER = {
  // Dims the page so the box stands out
  scrim: 'overlay-enter fixed inset-0 z-[65] bg-[var(--color-scrim)]/40',
  panel:
    'rail-reset surface-enter fixed bottom-6 left-[calc(var(--shell-sidebar-w)+1.5rem)] z-[70] flex max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] glass-panel shadow-[var(--shadow-lg)]',
  // Lifted off the page by a layered shadow alone, no outline
  bell: 'w-[26rem] max-w-[calc(100vw-var(--shell-sidebar-w)-3rem)] border-transparent! shadow-[var(--shadow-lifted)]!',
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
  rail: 'rail-ground relative z-40 font-[family-name:var(--font-system)] hidden w-[var(--shell-sidebar-w)] shrink-0 flex-col py-3 md:fixed md:inset-y-0 md:left-0 md:flex md:transition-[width] md:duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none print:hidden',
  // Calendar menu or classic menu, plain buttons
  viewButtons: 'flex shrink-0 gap-2 px-4 pb-3',
  // Line between the page types and the shortcuts
  viewDivider: 'mx-4 h-px shrink-0 bg-[var(--color-border)]',
  viewButton:
    'flex h-8 flex-1 items-center justify-center rounded-[var(--radius-lg)] border border-transparent text-caption font-semibold text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]',
  viewButtonActive:
    'glass-panel !border-solid text-[var(--color-ink)] shadow-[var(--shadow-md)] hover:bg-transparent',
  // Panes gliding sideways
  slides: 'relative flex min-h-0 flex-1 overflow-hidden',
  slidesStrip:
    'flex h-full shrink-0 transition-transform duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)]',
  slidesPane: 'flex h-full min-w-0 flex-1 flex-col',
  // Page panel in the rail
  slot: 'flex min-h-0 flex-1 flex-col px-3',
  // Creator switch
  creatorRow: 'flex shrink-0 justify-center px-4 pb-3',
  // Search bar
  searchRow: 'flex shrink-0 px-4',
  // Search folded to a glyph box, as wide as the shortcuts
  searchGlyph:
    'glass-panel flex h-11 w-full items-center justify-center rounded-[var(--radius-lg)] border text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  // Glyph boxes under the search
  shortcuts: 'rail-shortcuts flex shrink-0 gap-2 px-4 pt-3',
  shortcut:
    'glass-panel flex h-11 flex-1 items-center justify-center rounded-[var(--radius-lg)] border text-[var(--color-ink)] transition-colors hover:text-[var(--color-ink-subtle)]',
  shortcutActive: 'shadow-[var(--shadow-md)]',
  // Unread note, painted in rail.css
  shortcutFresh: 'shortcut-fresh',
  shortcutIcon: 'size-5 shrink-0',
  // Pins footer down
  nav: 'rail-nav flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto px-4 pt-5 pb-4',
  navGroup: 'flex flex-col gap-2',
  navGroupLabel:
    'rail-fold group flex w-full items-center gap-1 px-3 pb-1 text-xs font-bold tracking-wide uppercase',
  // Greyed, fading toward the baseline like the page titles
  navGroupTitle:
    'bg-gradient-to-b from-[color-mix(in_srgb,var(--color-ink-subtle)_75%,transparent)] from-30% to-[color-mix(in_srgb,var(--color-ink-subtle)_30%,transparent)] bg-clip-text text-transparent',
  navGroupChevron:
    'h-4 w-4 shrink-0 opacity-70 transition-[transform,opacity] group-hover:opacity-100 group-focus-visible:opacity-100 md:h-3.5 md:w-3.5 md:opacity-0',
  navGroupChevronCollapsed: '-rotate-90',
  navGroupItems: 'flex flex-col gap-px',
  navLink:
    'group flex items-center gap-2.5 rounded-[var(--radius-lg)] px-3 py-1 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface)]',
  navLinkActive: 'font-semibold text-[var(--color-ink)]',
  navLabel: 'rail-fold relative',
  // A creator is on air: red text breathing a soft glow
  navLabelLive: 'live-glow font-semibold text-[var(--color-live-400)]',
  // Elbow joins each page opened under a destination: straight down, then a tight turn
  subPage:
    'relative ml-[1.375rem] pl-5 before:absolute before:top-0 before:left-0 before:h-4 before:w-3.5 before:rounded-bl-[0.5rem] before:border-b-2 before:border-l-2 before:border-[var(--color-ink-subtle)]/60',
  // First level starts right under the destination glyph
  subPageRoot: '-mt-1.5',
  subLink:
    'flex h-8 items-center rounded-[var(--radius-md)] px-2 text-caption font-medium text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]',
  subLinkActive: 'font-semibold text-[var(--color-ink)]',
  navIcon: 'size-[1.125rem] shrink-0 transition-colors',
  navIconActive: 'text-[var(--color-ink)]',
  // Pulse on the live entry, bubble anchored beside it
  livePulse: 'rail-fold relative ml-auto flex size-2.5 shrink-0',
  livePulseRing: 'live-halo absolute inset-0 rounded-full bg-[var(--color-live-400)]',
  livePulseDot: 'relative size-full rounded-full bg-[var(--color-live-400)]',
  // Unseen mentions counted beside the page
  navBadge:
    'rail-fold ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger)] text-xs font-bold text-[var(--color-on-solid)]',
  liveBubbleAnchor: 'fixed z-50 size-0',
  // Account footer
  footer: 'flex shrink-0 px-4 pt-3',
  // Bare glyph row above the search
  toolbar: 'flex shrink-0 items-center gap-1 px-4 pb-3',
  toolbarButton:
    'flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)] active:scale-95',
  toolbarIcon: 'size-[1.125rem] shrink-0',
  // Profile box, bell on its right
  footerBox:
    'rail-footer-box glass-panel flex min-w-0 flex-1 flex-col rounded-[var(--radius-xl)] border p-2',
  // Folded rail: the portrait alone, centred
  footerBare: 'flex min-w-0 flex-1 justify-center',
  // Level switch heading the profile box, a rule under it
  footerSwitch: 'px-1 pt-1',
  footerRule: 'mx-1 my-2 h-px bg-[var(--color-border)]',
  footerRow: 'flex min-w-0 items-center gap-1',
  footerName: 'min-w-0 flex-1 truncate text-base font-semibold',
  footerActions: 'flex shrink-0 items-center gap-0.5',
  footerIcon: 'size-5 shrink-0',
  // Version under the nav
  version:
    'rail-fold mx-4 mt-2 mb-1 shrink-0 self-start rounded-[var(--radius-sm)] px-2 py-1 font-[family-name:var(--font-mono)] text-micro tracking-wide text-[var(--color-ink-subtle)] uppercase transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  // View tints need a page plate
  footerPlate:
    'rail-reset bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-hover)]',
} as const

/**
 * Search launcher classes
 * @type {Record<string, string>}
 */

export const SEARCH_LAUNCHER = {
  bar: 'glass-panel flex w-full items-center gap-2.5 rounded-[var(--radius-lg)] px-3.5 py-3 text-left text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  // Slim bar beside the bell
  sheetBar:
    'glass-panel flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-left text-sm text-[var(--color-ink-subtle)]',
  barLabel: 'flex-1 truncate text-body',
  // Memora brain in the bar
  brain: 'h-5 shrink-0',
} as const

/**
 * Navigation sheet of the phone
 * @type {Record<string, string>}
 */

export const NAV_SHEET = {
  stack: 'nav-sheet flex flex-col gap-4',
  // Level switch sits first
  switch: 'w-full',
  // Search and bell share a line
  searchRow: 'flex items-center gap-2',
  notifications:
    'glass-panel relative flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-ink)]',
  notificationsIcon: 'size-5 shrink-0',
  dot: 'absolute top-2 right-2 size-2 rounded-full bg-[var(--color-danger)]',
  // Account sits last, under a rule
  divider: 'h-px border-0 bg-[var(--color-border)]',
  account:
    'flex min-h-11 items-center gap-3 rounded-[var(--radius-lg)] px-3 text-left text-body font-semibold transition-colors hover:bg-[var(--color-surface)]',
  accountName: 'min-w-0 flex-1 truncate',
} as const

/**
 * Phone dock, Home in the middle and the menu closing the row
 * @type {Record<string, string>}
 */

export const MOBILE_DOCK = {
  bar: 'dock-glass fixed inset-x-3 bottom-[calc(var(--shell-dock-gap)+env(safe-area-inset-bottom))] z-40 flex h-[var(--shell-dock-h)] items-center justify-around rounded-full border px-1.5 md:hidden print:hidden',
  item: 'relative flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full transition-colors active:bg-[var(--color-hover)] motion-reduce:transition-none',
  itemRest: 'text-[var(--color-ink-subtle)]',
  itemActive: 'text-[var(--color-ink-accent)]',
  icon: 'size-6 shrink-0',
  label: 'max-w-full truncate px-1 text-micro leading-none font-semibold',
  // Home sits raised in the middle
  home: 'relative flex size-12 shrink-0 items-center justify-center rounded-full shadow-[var(--shadow-md)] transition-transform active:scale-95 motion-reduce:transition-none',
  homeRest: 'bg-[var(--color-surface-raised)] text-[var(--color-ink)]',
  homeActive: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  homeIcon: 'size-6',
  dot: 'absolute top-2 left-[calc(50%+0.4rem)] size-2 rounded-full bg-[var(--color-danger)]',
} as const

/**
 * Mobile top bar classes
 * @type {Record<string, string>}
 */

export const TOP_BAR = {
  bar: 'mist sticky top-0 z-40 flex h-[calc(var(--shell-top-bar-h)+env(safe-area-inset-top))] items-center gap-2 border-b px-3 pt-[env(safe-area-inset-top)] md:hidden print:hidden',
  // Where the page trail lands
  crumbsHost: 'flex min-w-0 flex-1 items-center',
  crumbs: 'flex min-w-0 flex-1 items-center gap-1 text-sm font-medium',
  // Page options and star, at the right of the bar
  toolsHost: 'flex shrink-0 items-center',
  // Memora button
  assistant:
    'glass-panel flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-hover)]',
  crumbFold:
    'flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)]',
  // Pages behind the fold, in a box under the bar
  crumbList:
    'fixed inset-x-3 top-[calc(var(--shell-top-bar-h)+env(safe-area-inset-top)+0.25rem)] z-40 flex flex-col divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
  crumbRow:
    'flex min-h-11 items-center gap-2 px-4 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-hover)]',
  crumbRowStatic: 'flex min-h-11 items-center gap-2 px-4 text-sm text-[var(--color-ink-subtle)]',
  crumbScrim: 'fixed inset-0 z-30',
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
  // Bottom sheet version, every block on the middle axis
  sheet: 'flex flex-col items-stretch gap-6',
  sheetBlock: 'flex flex-col items-center gap-3',
  sheetLabel: PROPERTY_LABEL,
  sheetActions: 'grid grid-cols-2 gap-3',
  sheetAction:
    'flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-semibold transition-colors active:bg-[var(--color-hover)]',
  sheetActionDanger: 'text-[var(--color-danger)]',
  sheetActionIcon: 'size-5 shrink-0',
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
  // Two properties side by side from the narrowest screen
  grid: `grid grid-cols-2 ${PROPERTY_SPACING.rows} ${PROPERTY_SPACING.columns}`,
  entry: `flex min-w-0 flex-col ${PROPERTY_SPACING.within}`,
  stack: `flex flex-col ${PROPERTY_SPACING.rows}`,
  // Long text runs edge to edge
  entryWide: `flex min-w-0 flex-col col-span-2 ${PROPERTY_SPACING.within}`,
  label: PROPERTY_LABEL,
  value: `text-sm break-words ${PROPERTY_VALUE}`,
  empty: `text-sm ${EMPTY_VALUE}`,
  // Read value that opens its editor on click
  editable:
    '-mx-1.5 -my-0.5 cursor-pointer rounded-[var(--radius-sm)] px-1.5 py-0.5 transition-colors hover:bg-[var(--color-surface)]',
  // Same box while its editor is open
  editing: `relative ${EDITING_MARK}`,
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
  frameCompact: 'relative row-span-3 md:row-auto',
  // Official logo on the portrait's corner
  divisionLogo: 'absolute -right-3 -bottom-3 h-14 w-14 drop-shadow-md',
  // Division stamped on the portrait's corner
  division:
    'absolute -right-1 -bottom-1 flex h-10 min-w-10 items-center justify-center rounded-full bg-[var(--color-brand-600)] px-1.5 text-sm font-bold text-[var(--color-on-brand)] ring-4 ring-[var(--color-surface-raised)]',
  // Role on the portrait's corner
  roleMark: 'absolute -right-3 -bottom-3 drop-shadow-md',
  roleGlyph: 'h-14 w-14',
  // Smaller portrait on a phone
  roleMarkCompact: 'absolute -right-2 -bottom-2 drop-shadow-md md:-right-3 md:-bottom-3',
  roleGlyphCompact: 'h-9 w-9 md:h-14 md:w-14',
  portrait:
    'block shrink-0 rounded-full transition-[filter] enabled:cursor-pointer enabled:hover:brightness-95 disabled:cursor-default',
  // Role glyph pinned to the portrait's corner
  emblem:
    'absolute -right-1 -bottom-1 h-9 w-9 rounded-full bg-[var(--color-surface)] p-1 ring-2 ring-[var(--color-surface)]',
  // Read-only function list
  marks: 'flex flex-wrap items-center gap-x-4 gap-y-2',
  mark: 'inline-flex items-center gap-2',
  // Stacked rows of marks and the rule between them
  rows: 'flex flex-col gap-3',
  divider: 'block h-px w-full bg-[var(--color-border)]',
} as const

/**
 * Moderator file layout: an identity rail that stays put
 * @type {Record<string, string>}
 */

export const MEMBER_FILE = {
  layout: 'grid grid-cols-1 gap-8 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-start',
  main: 'flex min-w-0 flex-col gap-6',
  // Rail follows the scroll on wide screens only
  railStack: 'flex flex-col gap-3 lg:sticky lg:top-6',
  rail: 'flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface shadow-[var(--shadow-sm)]',
  head: 'grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 px-4 pt-4 text-left md:flex md:flex-col md:gap-2 md:px-5 md:pt-7 md:text-center',
  name: 'text-xl font-bold tracking-tight break-words',
  role: 'text-xs font-bold tracking-wide text-[var(--color-brand-800)] uppercase',
  status:
    'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink-subtle)]',
  // Dismissed or resigned
  departed: 'cursor-help text-xs font-bold tracking-wide text-[var(--color-danger)] uppercase',
  statusGlyph: 'h-4 w-4 shrink-0',
  functions: 'flex items-center gap-2 md:justify-center',
  body: 'mt-3 flex flex-col gap-5 border-t border-[var(--color-border)] p-4 md:mt-5 md:p-5',
  groupTitle: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  lock: 'px-5 pt-3 text-center',
  memoraId: 'font-[family-name:var(--font-mono)] text-xs',
  // Property list of a rail
  railList: 'flex flex-col gap-5',
  railItem: 'flex flex-col gap-1.5',
  factValue: 'text-sm font-medium',
  factEmpty: 'text-sm text-[var(--color-ink-subtle)] italic',
  // Note card
  note: 'flex min-h-24 flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 shadow-[var(--shadow-sm)]',
  notePinned: 'border-[var(--color-brand-200)] bg-[var(--color-brand-50)]',
  noteHead: 'flex items-center gap-2 text-xs text-[var(--color-ink-subtle)]',
  noteBody: 'text-sm leading-relaxed whitespace-pre-wrap',
  notesGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  // Pinned note under the rail details
  pinned: 'flex flex-col gap-1.5',
  pinnedNote: 'flex flex-col gap-1 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-4',
  pinnedLabel: 'text-xs font-bold tracking-wide uppercase',
  // Social tile
  social:
    'flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-3 transition-colors hover:bg-[var(--color-hover)]',
  socialLogo:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)]',
  socialsGrid: 'grid grid-cols-1 auto-rows-[4.5rem] gap-3 sm:grid-cols-2',
  socialAdd: 'h-full',
  more: 'self-start text-sm font-semibold text-[var(--color-brand-800)] underline-offset-4 hover:underline',
} as const

/**
 * Vertical list of stages joined by a rail
 * @type {Record<string, string>}
 */

export const STAGE_LIST = {
  stage: 'relative flex gap-4 pb-7 last:pb-0',
  // Thread running between two bare glyphs
  stageRail: 'absolute top-9 bottom-1 left-3 w-px -translate-x-1/2 bg-[var(--color-border-strong)]',
  stageRailDone: 'bg-[var(--color-success)]/50',
  stageChip:
    'z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-info)]',
  stageChipDone:
    'z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-success)]',
  stageChipLate:
    'z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-danger)]',
  stageChipOff:
    'z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-ink-subtle)]/60 opacity-50 grayscale',
  stageGlyph: 'h-6 w-6',
  stageBody: 'flex min-w-0 flex-1 flex-col gap-1.5',
  stageHead: 'flex min-w-0 flex-wrap items-center gap-2.5',
  stageTitle: 'text-base font-bold tracking-tight',
  stageTitleCurrent: 'text-[var(--color-info)]',
  stageLead: 'text-sm text-[var(--color-ink-subtle)]',
  stageActions: 'flex flex-wrap items-center gap-3',
} as const

/**
 * Discreet timeline laid in a corner
 * @type {Record<string, string>}
 */

export const STAGE_COMPACT = {
  root: 'opacity-80',
  stage: 'relative flex gap-2.5 pb-3 last:pb-0',
  stageRail:
    'absolute top-6 bottom-1 left-2 w-0 -translate-x-1/2 border-l border-dashed border-[var(--color-border-strong)]',
  stageRailDone: 'border-[var(--color-success)]/50',
  // Room a list takes when it does not fill its card
  stageSpaced: 'pb-8',
  stageChip: 'z-10 flex h-4 w-4 shrink-0 items-center justify-center',
  stageGlyph: 'h-4 w-4',
  stageTitle: 'text-sm leading-4 font-semibold',
  stageTitleDone: 'line-through decoration-[var(--color-ink-subtle)]/60',
  stageTitleCurrent: 'text-[var(--color-info)]',
  tone: {
    done: 'text-[var(--color-success)]',
    current: 'text-[var(--color-info)]',
    late: 'text-[var(--color-danger)]',
    upcoming: 'text-[var(--color-ink-subtle)]/60',
  },
} as const

/**
 * Seal classes
 * @type {Record<string, string>}
 */

export const SEAL_BLOCK = {
  glyph:
    'h-6 w-24 shrink-0 text-[var(--color-ink-subtle)] transition-colors group-hover:text-[var(--color-ink-accent)]',
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
  row: 'flex min-w-0 items-center gap-3',
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
  grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
  tile: 'flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4',
  tileLabel: 'text-xs font-medium tracking-wide text-[var(--color-ink-subtle)] uppercase',
  tileValue: 'font-[family-name:var(--font-display)] text-2xl leading-none',
  tileMax: 'font-sans text-sm text-[var(--color-ink-subtle)]',
  tileHint: 'text-xs text-[var(--color-ink-subtle)]',
  rows: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0',
  rowLabel: 'flex min-w-0 items-center gap-2 text-sm font-medium',
  rowIcon: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  rowMeta: 'font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
  rowStatus: 'flex flex-wrap items-center gap-2',
  cardHead: 'flex flex-wrap items-center gap-2',
  cardIcon: 'h-4 w-4 shrink-0 text-[var(--color-ink-accent)]',
  cardTitle: 'font-bold',
  cardLead: 'text-sm text-[var(--color-ink-subtle)]',
  chooser: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
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
  simulation: 'flex max-h-[60dvh] flex-col gap-4 overflow-y-auto',
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
  centered: 'items-center',
  headCentered: 'justify-center',
  listCentered: 'justify-center gap-2.5',
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
  // Version and day, read under the banner title
  meta: 'flex flex-wrap items-baseline gap-x-3',
  version: 'text-xs font-bold tracking-wide uppercase tabular-nums',
  date: 'text-xs font-semibold',
  // Build in use, closing the page
  running:
    'text-center font-[family-name:var(--font-mono)] text-micro tracking-wide text-[var(--color-ink-subtle)] uppercase',
  // Description box: lead, why, then one figure per category
  lead: 'text-lg font-semibold tracking-tight sm:text-xl',
  description: 'text-body leading-relaxed text-[var(--color-ink-subtle)]',
  descriptionBody: 'flex flex-col gap-4',
  rule: 'h-px w-full bg-[var(--color-border)]',
  figures: 'grid auto-cols-fr grid-flow-col divide-x divide-[var(--color-border)]',
  figure: 'flex min-w-0 flex-col items-center gap-1 px-2 text-center',
  figureValue: 'text-3xl leading-none font-bold tabular-nums',
  figureLabel: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  blocks: 'flex flex-col gap-10',
  // Pages of a category inside its card, apart by a hairline
  groups: 'divide-y divide-[var(--color-border)]',
  group: 'flex flex-col gap-2.5 py-5 first:pt-0 last:pb-0',
  groupTitle: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  comment:
    'border-l-2 border-[var(--color-border-strong)] pl-3.5 text-sm leading-relaxed text-[var(--color-ink-subtle)] italic',
  commentLabel: 'sr-only',
  lines: 'flex flex-col gap-1.5',
  line: 'flex gap-3 text-body leading-relaxed',
  lineDot: 'mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full',
  archive: 'flex flex-wrap justify-center gap-2',
  archiveHead: 'flex flex-col items-center gap-4 text-center',
  archiveTitle: 'text-xl font-bold tracking-tight',
  monthList: 'flex flex-col gap-1',
  releaseRow: 'flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2',
  releaseRowLink:
    'flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 transition-colors hover:bg-[var(--color-hover)]',
  releaseBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  releaseTitle: 'truncate text-sm font-semibold',
  releaseMeta: 'text-micro font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  releaseCurrent:
    'shrink-0 text-micro font-bold tracking-wide text-[var(--color-ink-accent)] uppercase',
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
  // Room above for the point, flush with the shortcut row
  wrapPointed: 'mx-4 pt-3 pb-1',
  // The ^ aimed at the shortcut box
  caret:
    'pointer-events-none absolute top-1.5 h-3 w-3 rotate-45 rounded-sm bg-[var(--color-gold-100)]',
  // Gradient plate
  frame:
    'group/news rail-reset relative z-10 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-gold-100)] via-[var(--color-gold-300)] to-[var(--color-gold-400)] text-black shadow-[var(--shadow-md)] ring-1 ring-white/40 ring-inset transition-shadow hover:shadow-[var(--shadow-lg)]',
  // Light veil from the top left
  veil: 'pointer-events-none absolute inset-0 bg-linear-to-br from-[var(--color-surface)]/50 via-[var(--color-surface)]/10 to-transparent',
  link: 'relative block p-3.5 pr-10',
  sheen:
    'pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-[var(--color-surface)]/55 to-transparent transition-[left] duration-[var(--motion-duration-celebrate)] ease-out group-hover/news:left-full motion-reduce:transition-none',
  kicker:
    'relative block font-[family-name:var(--font-mono)] text-micro font-bold tracking-wide text-black/70 uppercase',
  title: 'relative mt-1.5 line-clamp-2 block text-lg leading-tight font-bold tracking-tight',
  cta: 'relative mt-3 inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-micro font-bold text-[var(--color-gold-100)]',
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
  word: 'font-[family-name:var(--font-display)] text-8xl leading-none font-bold tracking-tight text-[var(--color-ink-accent)] sm:text-9xl',
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
    'nudge-enter relative flex items-center gap-1 rounded-full bg-[var(--color-ink)] py-1 pr-1 pl-4 text-[var(--color-surface)] [filter:drop-shadow(0_0.5rem_1rem_color-mix(in_srgb,var(--color-ink)_20%,transparent))]',
  closing: 'nudge-close',
  // Tip aimed at the entry
  tail: 'pointer-events-none absolute top-1/2 -left-[0.5625rem] h-[1.125rem] w-3 -translate-y-1/2 text-[var(--color-ink)]',
  label: 'relative truncate py-1.5 text-left text-sm font-semibold',
  close:
    'relative flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-surface)]/80 transition-colors hover:bg-[var(--color-surface)]/15 hover:text-[var(--color-surface)]',
  closeIcon: 'h-4 w-4',
} as const

/**
 * Creator and account menu classes
 * @type {Record<string, string>}
 */

export const CREATOR_MENU = {
  wrapper: 'relative min-w-0 flex-1',
  trigger:
    'flex w-full min-w-0 items-center gap-3 rounded-[var(--radius-lg)] px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-hover)]',
  // Folded rail, portrait alone
  triggerBare: 'w-auto flex-none justify-center gap-0 p-1',
  // Same footprint as a portrait
  noneGlyph: 'h-8 w-8 shrink-0 p-1',
  name: 'rail-fold min-w-0 flex-1 truncate text-body font-medium',
  chevron: 'rail-fold h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none',
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
 * Glyph-led rows of the security tab
 * @type {Record<string, string>}
 */

export const SECURITY_LIST = {
  list: '-my-1 divide-y divide-[var(--color-border-strong)]',
  row: 'flex items-center gap-3.5 py-3',
  glyph: 'h-9 w-9 shrink-0',
  body: 'min-w-0 flex-1 space-y-0.5',
  title: 'flex flex-wrap items-center gap-2 text-sm font-bold tracking-tight',
  current: 'text-xs font-semibold text-[var(--color-success)]',
  meta: 'flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--color-ink-subtle)]',
  link: 'w-fit max-w-full truncate text-[11px] italic hover:underline',
  actions: 'flex shrink-0 items-center gap-2',
  time: 'shrink-0 text-xs text-[var(--color-ink-subtle)] tabular-nums',
  status: 'inline-flex items-center gap-1.5 text-xs font-semibold',
  on: 'text-[var(--color-success)]',
  off: 'glyph-danger text-[var(--color-danger)]',
  statusGlyph: 'h-4 w-4 shrink-0',
  footer:
    'mt-3 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4 sm:flex-row *:flex-1',
} as const

/**
 * Creator channel cards, side by side
 * @type {Record<string, string>}
 */

export const CHANNEL_BLOCK = {
  list: 'flex flex-wrap gap-3',
  card: 'flex min-h-16 min-w-56 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3',
  glyph: 'h-9 w-9 shrink-0',
  body: 'min-w-0 space-y-0.5',
  name: 'text-sm font-bold tracking-tight',
  link: 'block truncate text-xs text-[var(--color-ink-subtle)] hover:underline',
  empty: 'text-sm italic text-[var(--color-ink-subtle)]',
} as const

/**
 * Auth shell classes: a gradient figure beside the form
 * @type {Record<string, string>}
 */

export const AUTH_SHELL = {
  page: 'grid grid-cols-1 min-h-dvh lg:grid-cols-2',
  // Gradient band above the form on mobile, the half page from lg
  art: 'relative flex h-36 items-center justify-center overflow-hidden bg-[image:var(--gradient-frame)] lg:h-auto',
  figure: 'hidden w-3/5 max-w-md lg:block',
  main: 'flex flex-col items-center justify-center px-6 py-12',
  column: 'flex w-full max-w-sm flex-col gap-6',
  logo: 'flex items-center justify-center',
  wordmark: 'h-auto w-40',
  card: 'card-surface rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-md)] sm:p-8',
  title: 'mb-6 text-2xl font-bold tracking-tight',
} as const

/**
 * Splash screen classes
 * @type {Record<string, string>}
 */

export const SPLASH = {
  overlay: 'splash cursor-pointer select-none',
  ground: 'splash-ground pointer-events-none absolute inset-0 overflow-hidden',
  stage: 'splash-stage absolute inset-0 grid place-items-center',
  halo: 'splash-halo pointer-events-none',
  brain: 'splash-brain relative',
  piece: 'splash-piece absolute',
} as const

/**
 * Simulated view pill
 * @type {Record<string, string>}
 */

export const SIMULATION_BLOCK = {
  fold: 'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  foldOpen:
    'grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  clip: 'min-h-0 overflow-hidden',
  pill: 'mb-2 flex flex-col gap-2 rounded-xl border border-[var(--view)]/40 bg-[var(--view)]/10 p-3 text-xs',
  text: 'text-[var(--color-ink)]',
  leave:
    'self-start rounded-full bg-[var(--view)]/20 px-3 py-1 font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--view)]/30 disabled:opacity-50',
}

/**
 * Creator file, identity box beside the teams
 * @type {Record<string, string>}
 */

export const CREATOR_FILE = {
  root: 'flex flex-col gap-6',
  designStack: 'flex flex-col divide-y divide-[var(--color-border)]',
  designTitle: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  designTop: 'flex flex-wrap items-start divide-x divide-[var(--color-border)] pb-6',
  designCell: 'flex flex-col gap-3 px-6 first:pl-0 last:pr-0',
  designGallery: 'flex flex-col gap-3 pt-6',
  bannerGrid: 'grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5',
  designCard:
    'group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--motion-duration-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] disabled:cursor-default disabled:hover:translate-y-0',
  designBanner: 'aspect-[3/1] w-full',
  designBannerTall: 'aspect-[3/4] w-full',
  designCaption:
    'absolute inset-x-0 bottom-0 bg-[var(--color-media-shade)] px-3 py-2 text-xs font-semibold text-[var(--color-on-media)]',
  designAvatar: 'size-24',
  designLogo: 'aspect-[2/1] h-24',
  designImage: 'h-full w-full object-cover',
  designLogoImage: 'h-full w-full object-contain p-3',
  designAvatarImage: 'h-full w-full object-cover',
  designEmpty:
    'flex-col gap-2 border-dashed text-sm text-[var(--color-ink-subtle)] shadow-none hover:translate-y-0 hover:bg-[var(--color-hover)]',
  grid: 'grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3',
  column: 'flex flex-col gap-3',
  railHead:
    'relative isolate flex items-center gap-4 overflow-hidden bg-[var(--color-media-shade)] p-4 text-[var(--color-on-media)] md:p-5',
  railBody: 'flex flex-col gap-6 p-4 md:p-5',
  railPortrait: 'shrink-0 shadow-[var(--shadow-lg)] ring-4 ring-[var(--color-on-media)]',
  railName: 'min-w-0 text-xl font-bold tracking-tight break-words',
  box: 'flex min-w-0 flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface shadow-[var(--shadow-sm)]',
  boxHead:
    'flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-[var(--radius-xl)] p-3 text-left transition-colors hover:bg-[var(--color-hover)]',
  boxName: 'min-w-0 flex-1 truncate text-sm font-semibold text-[var(--color-ink)]',
  boxMeta: 'truncate text-xs text-[var(--color-ink-subtle)]',
  boxMetaEmpty: 'truncate text-xs text-[var(--color-ink-subtle)] italic',
  chevron: 'size-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform',
  chevronOpen: 'rotate-180',
  fold: 'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  foldOpen:
    'grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  foldClip: 'min-h-0 overflow-hidden',
  foldBody: 'flex flex-col gap-2 px-3 pb-3',
  stack: 'flex flex-col gap-4',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
}

/**
 * Creator group of the moderator list: a wide banner, then the box of its moderators
 * @type {Record<string, string>}
 */

export const CREATOR_GROUP = {
  root: 'flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-md)]',
  banner:
    'relative isolate flex min-h-24 w-full cursor-pointer items-center gap-4 overflow-hidden bg-[var(--color-media-shade)] px-4 py-3 text-left text-[var(--color-on-media)] sm:px-6',
  portrait: 'shrink-0 shadow-[var(--shadow-lg)] ring-2 ring-[var(--color-on-media)]',
  name: 'min-w-0 flex-1 truncate text-xl font-bold tracking-tight sm:text-2xl',
  chevron:
    'size-5 shrink-0 transition-transform duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)]',
  chevronOpen: 'rotate-180',
  // Rows slide, the content fades and settles a beat later
  fold: 'grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
  foldOpen:
    'grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
  foldClip: 'min-h-0 overflow-hidden',
  box: 'card-surface p-4 opacity-0 -translate-y-3 transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none sm:p-5',
  boxOpen:
    'card-surface p-4 opacity-100 translate-y-0 transition-[opacity,translate] delay-100 duration-400 ease-out motion-reduce:transition-none sm:p-5',
  // Sections inside a box
  sections: 'flex flex-col gap-5',
  section: 'flex flex-col gap-3',
  sectionHeading: 'text-xs font-bold tracking-wider text-[var(--color-ink-subtle)] uppercase',
} as const

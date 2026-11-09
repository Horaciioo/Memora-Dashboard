import { EMPTY_VALUE, PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

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
  // Wide, not tall
  account: 'w-[26rem] max-w-[calc(100vw-var(--shell-sidebar-w)-3rem)]',
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
  // A live is on air, painted in rail.css
  shortcutLive: 'shortcut-live',
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
    'rail-footer-box glass-panel flex min-w-0 flex-1 flex-col rounded-[var(--radius-xl)] border p-1.5',
  // Folded rail: the portrait alone, centred
  footerBare: 'flex min-w-0 flex-1 justify-center',
  // Level switch heading the profile box, a rule under it
  footerSwitch: 'px-1 pt-1',
  footerRow: 'flex min-w-0 items-center gap-1',
  footerName: 'min-w-0 flex-1 truncate text-base font-semibold',
  footerActions: 'flex shrink-0 items-center gap-0.5',
  footerIcon: 'size-5 shrink-0',
  // Creator pick under the account row
  footerRule: 'mx-1 my-1.5 h-px bg-[var(--color-border)]',
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
  // Portrait of the file before its name
  crumbLead: 'flex size-6 shrink-0 items-center justify-center [&_svg]:size-6! [&>*]:size-6!',
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
  row: 'flex flex-wrap items-center justify-between gap-2 pb-2',
  label: PROPERTY_LABEL,
  divider: 'h-px bg-[var(--color-border)]',
  // View switch, set apart from the theme row
  switchRule: 'my-3 h-px bg-[var(--color-border)]',
  // A single row of glyph-only actions
  iconRow: 'flex items-stretch',
  // Colour lives in the exclusive tones below
  iconButton: 'flex flex-1 items-center justify-center py-2 transition-colors',
  iconIdle: 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]',
  // Softened red
  iconButtonDanger: 'text-[var(--color-danger)]/65 hover:text-[var(--color-danger)]',
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
    'flex w-full min-w-0 items-center gap-2 rounded-[var(--radius-lg)] px-1.5 py-1 text-left transition-colors hover:bg-[var(--color-hover)]',
  // Folded rail, portrait alone
  triggerBare: 'w-auto flex-none justify-center gap-0 p-1',
  portrait: 'relative shrink-0',
  // Unopened notifications, softened red
  dot: 'absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-[var(--color-danger)]/70 ring-2 ring-[var(--color-surface-raised)]',
  name: 'rail-fold min-w-0 flex-1 truncate text-sm font-medium',
  chevron: 'rail-fold h-3.5 w-3.5 shrink-0 transition-transform motion-reduce:transition-none',
  // Closed points down
  chevronShut: 'rotate-0',
  chevronOpen: 'rotate-180',
  // Portrait beside the name, not above
  head: 'flex shrink-0 flex-col items-center gap-1 border-b border-[var(--color-border)] px-4 py-3 text-center',
  body: 'flex flex-col gap-1 p-2',
  divider: 'h-px bg-[var(--color-border)]',
} as const

/**
 * Creator view unrolled above the account row
 * @type {Record<string, string>}
 */

export const CREATOR_VIEW = {
  // Height unrolls from nothing
  fold: 'grid transition-[grid-template-rows] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  foldOpen: 'grid-rows-[1fr]',
  foldShut: 'grid-rows-[0fr]',
  foldInner: 'min-h-0 overflow-hidden',
  list: 'flex max-h-48 flex-col overflow-y-auto',
  row: 'flex w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] px-1.5 py-1 text-left text-sm transition-colors',
  rowPick: 'hover:bg-[var(--color-hover)]',
  rowCurrent: 'font-semibold',
  rowGlyph: 'size-6 shrink-0',
  label: 'min-w-0 flex-1 truncate',
  rule: 'mx-1 my-1.5 h-px bg-[var(--color-border)]',
  button:
    'flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  buttonIcon: 'size-[1.125rem]',
} as const

/**
 * Latest notifications of the account box
 * @type {Record<string, string>}
 */

export const ACCOUNT_NOTIFICATIONS = {
  wrapper: 'flex flex-col gap-1',
  head: 'flex items-center justify-between gap-2 px-1 pt-1',
  heading: PROPERTY_LABEL,
  seeAll:
    'text-xs font-semibold text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  empty: `px-1 py-2 text-sm ${EMPTY_VALUE}`,
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

/**
 * Centred title of every dialog and drawer
 * @type {Record<string, string>}
 */

export const MODAL_HEADER = {
  root: 'relative flex shrink-0 flex-col items-center gap-3 px-14 pt-7 pb-5 text-center sm:px-16',
  close: 'absolute top-3 right-3',
  glyph:
    'flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink)]',
  glyphIcon: 'size-6',
  title: 'min-w-0 text-lg leading-tight font-bold tracking-wide text-balance uppercase',
} as const

/**
 * Dialog styles
 * @type {Record<string, string>}
 */

export const DIALOG_STYLES = {
  overlay:
    'overlay-enter fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-scrim)] p-4 backdrop-blur-sm sm:p-6',
  panel:
    'surface-enter relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--glass-line)] bg-[var(--color-surface-raised)]/90 shadow-[var(--shadow-lg)] backdrop-blur-2xl backdrop-saturate-150',
  // Line under the banner
  subheader: 'px-5 pt-4 sm:px-8',
  body: 'flex-1 overflow-y-auto border-t border-[var(--color-border)] px-5 py-5 sm:px-8 sm:py-6',
  // Tabs already rule the top
  bodyFlush: 'border-t-0 pt-1',
  footer:
    'flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40 px-5 py-3 sm:px-8 sm:py-4',
} as const

/**
 * Floating sheet rising from the bottom edge
 * @type {Record<string, string>}
 */

export const BOTTOM_SHEET = {
  overlay:
    'overlay-enter fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-scrim)] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden',
  frame: 'sheet-enter relative flex w-full max-w-lg flex-col items-center gap-4',
  // Title laid on the scrim, over the panel
  figure: 'w-full px-12 text-center text-[var(--color-on-media)]',
  panel:
    'relative flex max-h-[calc(100dvh-9rem)] w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--glass-line)] bg-[var(--color-surface-raised)]/95 shadow-[var(--shadow-lg)]',
  // Pulled down to close
  grip: 'flex shrink-0 cursor-grab touch-none justify-center pt-2.5 pb-1',
  gripBar: 'h-1 w-10 rounded-full bg-[var(--color-ink)]/20',
  close: 'absolute -top-1 right-0 !text-[var(--color-on-media)] hover:!bg-white/15',
  body: 'min-h-0 flex-1 overflow-y-auto p-4',
  figureTitle:
    'text-4xl leading-none font-bold tracking-tight uppercase italic drop-shadow-[0_2px_10px_rgb(0_0_0/0.5)]',
  figureLine: 'text-sm font-medium opacity-80 drop-shadow-[0_1px_6px_rgb(0_0_0/0.5)]',
} as const

/**
 * Panel width per dialog size
 * @type {Record<string, string>}
 */

export const DIALOG_SIZES = {
  xs: 'sm:max-w-xs',
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
} as const

export type DialogSize = keyof typeof DIALOG_SIZES

/**
 * Drawer styles
 * @type {Record<string, string>}
 */

export const DRAWER_STYLES = {
  // Dims the page window only
  overlay:
    'overlay-enter fixed inset-0 z-[45] bg-[var(--color-scrim)] md:inset-y-3 md:right-3 md:left-[var(--shell-sidebar-w)] md:rounded-[var(--radius-xl)]',
  // Floating sheet rising from the bottom on mobile, side card from md
  panel:
    'drawer-enter fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 flex h-[var(--drawer-mobile-h)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)] md:top-0 md:right-[var(--drawer-page-right)] md:bottom-0 md:left-auto md:my-auto md:h-[var(--drawer-page-h)] md:w-[var(--drawer-page-w)] md:rounded-[var(--radius-xl)]',
  // Wider footprint from md
  wide: 'md:w-[var(--drawer-page-wide-w)]',
  // Page of its own on a phone
  fullScreen:
    'max-md:inset-0 max-md:h-dvh max-md:rounded-none max-md:border-0 max-md:pt-[env(safe-area-inset-top)] max-md:pb-[env(safe-area-inset-bottom)]',
  // Form on the left, live result on the right, same width and height
  split:
    'flex min-h-full flex-col gap-6 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-8',
  // Tabs and the result switch share a line
  subheaderRow: 'flex items-center justify-between gap-3',
  subheaderTabs: 'min-w-0 flex-1',
  asideToggle:
    'min-h-11 shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-3 text-xs font-semibold text-[var(--color-ink-subtle)] md:hidden',
  asideToggleOn: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  splitDivider: 'hidden w-px self-stretch bg-[var(--color-border)] md:block',
  // Section tabs under the header
  sections: 'shrink-0 px-6 pb-2',
  body: 'min-h-0 flex-1 overflow-y-auto px-6 py-5',
  // Fields of the section on screen
  section: 'drawer-section-enter',
  footer:
    'shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40 px-3 py-3',
} as const

/**
 * Form drawer footer
 * @type {Record<string, string>}
 */

export const DRAWER_ACTIONS = {
  // One row of glyphs on a phone, stacked lines from md
  stack: 'flex items-center gap-2 p-1 md:flex-col md:items-stretch',
  // Previous at the far left
  steps: 'contents md:flex md:items-center md:justify-between md:gap-2',
  step: 'group flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full px-2 text-sm font-bold transition-colors hover:bg-[var(--color-hover)] md:min-h-0 md:min-w-0 md:justify-start md:rounded-[var(--radius-md)] md:py-2.5',
  stepBack: 'mr-auto',
  stepNext: 'ml-auto',
  stepLabel: 'hidden min-w-0 truncate md:block',
  stepIcon: 'h-5 w-5 shrink-0 text-[var(--color-ink-accent)] md:h-4 md:w-4',
  // Filled gestures
  line: 'flex size-11 shrink-0 items-center justify-center gap-2.5 rounded-full text-sm font-bold text-[var(--color-on-brand)] transition-[filter] hover:brightness-90 disabled:pointer-events-none disabled:opacity-60 md:size-auto md:w-full md:rounded-[var(--radius-md)] md:px-4 md:py-3',
  lineLabel: 'hidden md:inline',
  // No glyph: the label stays, the line keeps its width on a phone
  linePlain:
    '!size-auto min-w-0 flex-1 !rounded-[var(--radius-md)] px-4 py-3 md:w-full md:flex-none',
  lineLabelPlain: 'inline',
  save: 'bg-[var(--color-success)] !text-[var(--color-on-solid)]',
  cancel: 'bg-[var(--color-danger)] !text-[var(--color-on-solid)]',
  neutral: 'bg-[var(--color-hover)] !text-[var(--color-ink)]',
  icon: 'h-5 w-5 shrink-0 md:h-4.5 md:w-4.5',
  // One slim row of glyphs at every width, leaves the room to a wide form
  slimStack: 'flex items-center justify-end gap-2 p-1',
  slimSteps: 'contents',
  slimLine:
    'flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--color-on-brand)] transition-[filter] hover:brightness-90 disabled:pointer-events-none disabled:opacity-60',
  slimIcon: 'h-5 w-5 shrink-0',
  // One row at every width: steps, then save and cancel always there
  compactStack: 'flex items-center gap-2 p-1',
  compactSteps: 'flex flex-1 items-center gap-2',
  compactLine:
    'flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold text-[var(--color-on-brand)] transition-[filter] hover:brightness-90 disabled:pointer-events-none disabled:opacity-60 md:px-4',
  divider: 'mx-1 hidden h-px bg-[var(--color-border)] md:block',
  note: 'mb-4 text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Menu styles
 * @type {Record<string, string>}
 */

export const MENU_STYLES = {
  panel:
    'surface-enter fixed z-[70] min-w-52 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] glass-panel py-1 shadow-[var(--shadow-lg)]',
  item: 'flex min-h-11 w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors hover:bg-[var(--color-surface)] disabled:pointer-events-none disabled:opacity-40 md:min-h-0',
  danger: 'text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]',
  icon: 'h-4 w-4 shrink-0 opacity-70',
  separator: 'my-1 h-px bg-[var(--color-border)]',
  label: 'px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  shortcut: 'ml-auto text-xs text-[var(--color-ink-subtle)]',
  search:
    'mx-2 mt-1 mb-1.5 w-[calc(100%-1rem)] rounded-[var(--radius-sm)] border border-[var(--color-pick)] bg-[var(--color-field)] px-2.5 py-1.5 text-sm outline-none placeholder:text-[var(--color-ink-subtle)]',
  heading: 'px-3 pt-1.5 pb-1 text-xs font-semibold text-[var(--color-ink-subtle)]',
  chevron: 'ml-auto h-4 w-4 shrink-0 opacity-60',
  empty: 'px-3 py-2 text-sm text-[var(--color-ink-subtle)]',
  scroll: 'max-h-[min(70vh,28rem)] overflow-y-auto',
} as const

/**
 * Selection menu styles
 * @type {Record<string, string>}
 */

export const SELECTION_MENU_STYLES = {
  panel:
    'surface-enter fixed z-[60] flex w-64 flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] glass-panel p-1.5 shadow-[var(--shadow-lg)]',
  search:
    'w-full rounded-[var(--radius-md)] border border-[var(--color-pick)] bg-[var(--color-field)] px-2.5 py-1.5 text-sm outline-none placeholder:text-[var(--color-ink-subtle)]',
  heading: 'px-2.5 pt-2 pb-1 text-xs font-semibold text-[var(--color-ink-subtle)]',
  item: 'flex min-h-9 w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-[var(--color-surface)] focus-visible:bg-[var(--color-surface)] focus-visible:outline-none',
  danger: 'text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]',
  icon: 'h-4 w-4 shrink-0 opacity-70',
  separator: 'mx-1 my-0.5 h-px bg-[var(--color-border)]',
  shortcut: 'ml-auto text-xs text-[var(--color-ink-subtle)]',
  footer: 'px-2.5 pt-1 pb-1.5 text-xs text-[var(--color-ink-subtle)]',
  empty: 'px-2.5 py-2 text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Command palette styles
 * @type {Record<string, string>}
 */

export const PALETTE_STYLES = {
  overlay:
    'overlay-enter fixed inset-0 z-[80] flex items-center justify-center bg-[var(--color-scrim)] p-4 backdrop-blur-sm',
  panel:
    'card-surface surface-enter flex max-h-[70dvh] w-full max-w-xl flex-col overflow-hidden rounded-[var(--radius-xl)] border',
  // Memora's badge, then a tinted pill like the chat bar
  field: 'flex items-center gap-3 p-3',
  fieldBadge: 'flex shrink-0 items-center justify-center pl-1',
  fieldBrain: 'h-7 shrink-0',
  fieldPill:
    'flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)] py-2.5 pr-3 pl-5',
  input:
    'min-w-0 flex-1 bg-transparent text-body outline-none focus-visible:border-transparent focus-visible:shadow-none placeholder:text-[var(--color-ink-subtle)]',
  kbd: 'inline-flex h-6 min-w-6 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-2 text-micro font-semibold text-[var(--color-ink-subtle)]',
  results: 'flex-1 overflow-y-auto px-2 pb-2',
  group:
    'px-3 pt-6 pb-2 text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  result:
    'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-sm transition-colors duration-150',
  resultActive: 'bg-[var(--color-hover)]',
  suggestion:
    'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-sm font-semibold transition-colors duration-150 hover:bg-[var(--color-hover)]',
  suggestionIcon: 'size-5 shrink-0 text-[var(--color-ink-accent)]',
  chip: 'inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3.5 py-1.5 text-sm font-semibold transition-[transform,background-color] duration-150 hover:-translate-y-0.5 hover:bg-[var(--color-hover)]',
  chips: 'flex flex-wrap gap-2 px-3 pb-3',
  chipIcon: 'size-4 text-[var(--color-ink-accent)]',
  hint: 'flex items-center gap-4 px-5 pt-1 pb-4 text-caption text-[var(--color-ink-subtle)]',
} as const

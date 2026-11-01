// Shared field look of the page screens
const FIELD =
  'min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3.5 py-2 text-sm text-[var(--color-on-field)] transition-colors placeholder:text-[var(--color-on-field-subtle)] hover:border-[var(--color-field-border-strong)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]'

// Floating glass panel
const FLOATING =
  'glass-panel rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-lg)]'

/**
 * Block editor chrome
 * @type {Record<string, string>}
 */

export const PAGE_EDITOR_UI = {
  // Room on the left for the handle
  frame: 'relative w-full text-body md:pl-14',
  formatActive: 'bg-[var(--color-hover)] text-[var(--color-ink)]',
  handle: 'absolute left-0 z-10 hidden items-center gap-0.5 pt-0.5 md:flex',
  handleButton:
    'flex size-6 cursor-pointer items-center justify-center rounded-[var(--radius-xs)] text-[var(--color-ink-subtle)] transition-colors duration-[var(--motion-duration-fast)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  handleGrip:
    'flex size-6 cursor-grab items-center justify-center rounded-[var(--radius-xs)] text-[var(--color-ink-subtle)] transition-colors duration-[var(--motion-duration-fast)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] active:cursor-grabbing',
  handleGlyph: 'size-4',
  mobileBar:
    'glass-panel fixed inset-x-0 z-[70] flex items-center gap-2 border-t border-[var(--color-border)] px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-md)]',
  mobileTools: 'flex min-w-0 flex-1 items-center gap-1 overflow-x-auto',
  mobileButton:
    'flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink-subtle)] active:bg-[var(--color-hover)]',
  mobileGlyph: 'size-5',
  mobileDone: 'min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold text-[var(--color-ink-accent)]',
  linkPopover: `${FLOATING} fixed z-[85] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-1.5 p-3`,
  linkLabel: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  linkInput: FIELD,
  linkError: 'text-xs text-[var(--color-danger)]',
} as const

/**
 * Custom blocks inside the document
 * @type {Record<string, string>}
 */

export const PAGE_BLOCK_STYLES = {
  callout:
    'my-1 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-4 py-3',
  calloutIcon: 'shrink-0 cursor-pointer text-xl leading-7 select-none disabled:cursor-default',
  calloutBody: 'min-w-0 flex-1',
  subpage: 'my-0.5',
  subpageLink:
    'inline-flex max-w-full items-center gap-2 rounded-[var(--radius-sm)] px-1.5 py-1 font-medium text-[var(--color-ink)] underline decoration-[var(--color-border-strong)] underline-offset-4 transition-colors hover:bg-[var(--color-hover)]',
  subpageEmoji: 'text-lg leading-none',
  subpageGlyph: 'size-5 shrink-0 text-[var(--color-ink-subtle)]',
  subpageTitle: 'truncate',
  subpageMissing: 'text-[var(--color-ink-subtle)] italic no-underline',
} as const

/**
 * Page screen
 * @type {Record<string, string>}
 */

export const PAGE_VIEW_STYLES = {
  column: 'mx-auto flex w-full max-w-3xl flex-col gap-6',
  columnWide: 'max-w-none',
  topBar: 'flex items-center gap-1',
  shareHost: 'relative',
  shareButton:
    'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-2 text-sm font-medium transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  shareButtonOpen: 'bg-[var(--color-hover)]',
  barIcon:
    'inline-flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  barGlyph: 'size-4',
  sync: 'mr-1 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-subtle)]',
  syncAlert: 'text-[var(--color-caution)]',
  syncGlyph: 'size-4 shrink-0',
  syncLabel: 'hidden whitespace-nowrap lg:inline',
  syncRetry: 'font-semibold underline underline-offset-2',
  banner:
    'flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] card-surface p-4 sm:flex-row sm:items-center sm:justify-between',
  bannerText: 'flex flex-col gap-1 text-sm',
  bannerTitle: 'font-semibold text-[var(--color-ink)]',
  bannerMeta: 'text-xs text-[var(--color-ink-subtle)]',
  bannerActions: 'flex shrink-0 flex-wrap gap-2',
  heading: 'flex flex-col gap-2',
  trail: 'text-sm',
  trailList: 'flex flex-wrap items-center gap-1 text-[var(--color-ink-subtle)]',
  trailItem: "flex items-center gap-1 after:content-['/'] after:opacity-50 last:after:content-none",
  trailLink: 'inline-flex items-center gap-1 rounded-[var(--radius-xs)] px-1 hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  readOnly: 'text-sm text-[var(--color-ink-subtle)] italic',
  // Rail floating on the right edge, one icon until opened
  commentsHost: 'fixed top-1/2 right-3 z-40 flex -translate-y-1/2 flex-col items-end gap-2',
  commentsToggle: `${FLOATING} flex size-11 cursor-pointer items-center justify-center text-[var(--color-ink)] transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]`,
  commentsToggleOpen: 'bg-[var(--color-hover)]',
  commentsGlyph: 'size-5',
  commentsRail: `${FLOATING} popover-enter fixed top-24 right-3 bottom-4 z-40 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col gap-3 p-3`,
  commentsTitle: 'px-1 text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  commentsEmpty: 'px-1 text-sm text-[var(--color-ink-subtle)] italic',
  commentList: 'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto',
  comment: 'flex items-start gap-2.5',
  commentResolved: 'opacity-60',
  commentBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  commentAuthor: 'truncate text-sm font-semibold text-[var(--color-ink)]',
  commentDate: 'text-xs text-[var(--color-ink-subtle)] italic',
  commentText: 'text-sm whitespace-pre-wrap text-[var(--color-ink)]',
  commentActions: 'flex shrink-0 items-center gap-0.5',
  commentAction:
    'inline-flex size-6 cursor-pointer items-center justify-center rounded-[var(--radius-xs)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  commentActionGlyph: 'size-3.5',
  commentForm: 'flex flex-col items-end gap-2',
  commentInput: `${FIELD} min-h-20 resize-y leading-relaxed`,
} as const

/**
 * Share popover
 * @type {Record<string, string>}
 */

export const SHARE_PANEL_STYLES = {
  panel: `${FLOATING} popover-enter fixed inset-x-4 top-20 z-[60] flex max-h-[80dvh] flex-col gap-2 overflow-y-auto p-3 text-sm md:absolute md:inset-x-auto md:top-[calc(100%+0.5rem)] md:right-0 md:w-[26rem]`,
  invite: 'relative',
  inviteInput: FIELD,
  suggestions: 'mt-1 flex max-h-64 flex-col gap-0.5 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1',
  suggestion: 'flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] px-2 text-left hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  group: 'px-2 pt-1.5 pb-0.5 text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  empty: 'px-2 py-2 text-[var(--color-ink-subtle)] italic',
  section: 'px-1 pt-2 text-micro font-bold tracking-wide text-[var(--color-ink)] uppercase',
  list: 'flex flex-col gap-0.5',
  row: 'flex min-h-11 items-center gap-2.5 rounded-[var(--radius-sm)] px-1',
  rowTile: 'flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-sunken)]',
  rowGlyph: 'size-4 shrink-0 text-[var(--color-ink-subtle)]',
  rowText: 'flex min-w-0 flex-1 flex-col',
  name: 'truncate font-medium text-[var(--color-ink)]',
  hint: 'truncate text-xs text-[var(--color-ink-subtle)]',
  fixed: 'shrink-0 text-xs text-[var(--color-ink-subtle)]',
  link: 'shrink-0 text-xs font-semibold text-[var(--color-ink-accent)] underline-offset-2 hover:underline',
  level:
    'min-h-9 shrink-0 cursor-pointer rounded-[var(--radius-sm)] border-0 bg-transparent px-1.5 text-xs font-medium text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] disabled:cursor-default',
  inherit: 'flex flex-col gap-1 border-t border-[var(--color-border)] pt-2',
  footer: 'border-t border-[var(--color-border)] px-1 pt-2 text-xs text-[var(--color-ink-subtle)]',
  matrix: 'rounded-[var(--radius-md)] px-1',
  matrixSummary: 'cursor-pointer py-1.5 text-xs font-semibold text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]',
  matrixTable: 'w-full border-collapse text-xs',
  matrixHead: 'px-1 pb-1 text-center font-semibold text-[var(--color-ink-subtle)]',
  matrixRow: 'py-1 pr-2 text-left font-medium text-[var(--color-ink)]',
  matrixCell: 'border-t border-[var(--color-border)] py-1 text-center',
  matrixCheck: 'mx-auto size-4 text-[var(--color-ink)]',
} as const

/**
 * Private space index and trash
 * @type {Record<string, string>}
 */

export const PAGES_HOME_STYLES = {
  column: 'mx-auto flex w-full max-w-3xl flex-col gap-8',
  intro: 'flex flex-col gap-4',
  lead: 'text-body text-[var(--color-ink-subtle)]',
  search: FIELD,
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
  templates: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  template:
    'flex h-full w-full cursor-pointer flex-col items-start gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 text-left transition-[border-color,box-shadow] duration-[var(--motion-duration-base)] hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  templateIcon: 'text-2xl leading-none',
  templateLabel: 'pt-1 text-sm font-semibold text-[var(--color-ink)]',
  templateHint: 'text-xs text-[var(--color-ink-subtle)]',
  list: 'flex flex-col gap-1',
  row: 'flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  rowEmoji: 'w-6 shrink-0 text-center text-lg leading-none',
  rowGlyph: 'size-5 shrink-0 text-[var(--color-ink-subtle)]',
  rowBody: 'flex min-w-0 flex-1 flex-col',
  rowTitle: 'truncate text-sm font-medium text-[var(--color-ink)]',
  rowHint: 'line-clamp-2 text-xs text-[var(--color-ink-subtle)]',
  rowDate: 'shrink-0 text-xs text-[var(--color-ink-subtle)]',
  trashLink: 'self-start text-sm font-semibold text-[var(--color-ink-subtle)] underline-offset-4 hover:text-[var(--color-ink)] hover:underline',
  trashRow: 'flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] card-surface px-3 py-2',
} as const

/**
 * Developer registry of pages
 * @type {Record<string, string>}
 */

export const PAGE_REGISTRY_STYLES = {
  column: 'flex flex-col gap-4',
  sealed: 'text-sm text-[var(--color-ink-subtle)]',
  toolbar: 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
  search: `${FIELD} sm:max-w-xs`,
  page: 'flex min-w-0 flex-col',
  title: 'truncate font-medium text-[var(--color-ink)]',
  hint: 'text-xs text-[var(--color-ink-subtle)] italic',
  owner: 'inline-flex items-center gap-2 whitespace-nowrap',
  access: 'flex flex-col gap-0.5 text-xs',
} as const

/**
 * Private section of the rail
 * @type {Record<string, string>}
 */

export const PAGE_RAIL_STYLES = {
  head: 'group/pages flex items-center gap-1 pr-1',
  headLink: 'w-auto flex-1 hover:text-[var(--color-ink)]',
  create: 'w-full cursor-pointer text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]',
  divider: 'mx-3 my-1 h-px border-0 bg-[var(--color-border)]',
  subhead: 'px-3 pt-3 pb-1 text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  row: 'group/page flex items-center gap-0.5 rounded-[var(--radius-lg)] pr-1 transition-colors hover:bg-[var(--color-surface)]',
  rowActive: 'bg-[var(--color-surface)] font-semibold',
  toggle:
    'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  chevron: 'size-3.5 transition-transform duration-[var(--motion-duration-base)]',
  link: 'flex min-h-8 min-w-0 flex-1 items-center gap-2 py-1 text-caption font-medium text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  emoji: 'w-5 shrink-0 text-center leading-none',
  glyph: 'size-4 shrink-0',
  title: 'truncate',
  add:
    'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] opacity-100 hover:text-[var(--color-ink)] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] md:opacity-0 md:group-hover/page:opacity-100',
  children: 'flex flex-col gap-px',
  empty: 'py-1 text-xs text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Offline reading
 * @type {Record<string, string>}
 */

export const PAGE_OFFLINE_STYLES = {
  column: 'mx-auto mt-6 flex w-full max-w-2xl flex-col gap-4 px-4 text-left',
  title: 'text-section font-bold text-[var(--color-ink)]',
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  back: 'self-start text-sm font-semibold underline underline-offset-4',
  draft: 'text-xs font-semibold text-[var(--color-caution)]',
} as const

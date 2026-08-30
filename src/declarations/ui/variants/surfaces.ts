/**
 * Section and panel styles
 * @type {Record<string, string>}
 */

export const SECTION_STYLES = {
  wrapper: 'flex flex-col gap-3',
  header: 'flex flex-wrap items-end justify-between gap-3',
  heading: 'flex flex-col gap-1',
  title: 'text-xl font-bold tracking-tight italic sm:text-2xl',
  description: 'text-sm italic text-[var(--color-ink-subtle)]',
  actions: 'flex shrink-0 flex-wrap items-center gap-2',
  panel:
    'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
  panelPadded: 'p-4 sm:p-5',
} as const

/**
 * Page header styles
 * @type {Record<string, string>}
 */

export const PAGE_STYLES = {
  wrapper: 'flex flex-col gap-8',
  header: 'flex flex-wrap items-start justify-between gap-4',
  eyebrow:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-accent)] uppercase',
  title: 'text-2xl font-extrabold tracking-tight italic sm:text-3xl',
  // Title and its glyph sharing one line
  heading: 'flex min-w-0 items-center gap-2',
  headingTitle: 'min-w-0 flex-1',
  titleEditable:
    '-mx-1 cursor-pointer rounded-[var(--radius-sm)] px-1 transition-colors hover:bg-[var(--color-surface)]',
  titleInput:
    'rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-1 outline-none ring-2 ring-[var(--color-brand-600)]',
  lead: 'max-w-2xl text-sm italic text-[var(--color-ink-subtle)]',
  toolbar: 'flex flex-wrap items-center gap-2',
} as const

/**
 * Badge styles
 * @type {Record<string, string>}
 */

export const BADGE_STYLES = {
  base: 'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  outline: 'border',
  dot: 'h-1.5 w-1.5 rounded-full',
  icon: 'h-3 w-3',
} as const

/**
 * Glyph sizes, a record's emoji sitting on the surface without a frame
 * @type {Record<string, string>}
 */

export const GLYPH_STYLES = {
  base: 'shrink-0 bg-transparent leading-none',
  chip: 'text-xs',
  row: 'text-sm',
  card: 'text-base',
  title: 'text-2xl',
} as const

export type GlyphSize = keyof Omit<typeof GLYPH_STYLES, 'base'>

/**
 * Dialog styles
 * @type {Record<string, string>}
 */

export const DIALOG_STYLES = {
  overlay:
    'overlay-enter fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-ink)]/50 p-0 backdrop-blur-md sm:items-center sm:p-6',
  panel:
    'surface-enter relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)] sm:rounded-[var(--radius-xl)]',
  grip: 'mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-[var(--color-border-strong)] sm:hidden',
  header: 'flex items-start gap-3 px-5 pt-5 pb-4 sm:px-6',
  heading: 'flex min-w-0 flex-1 flex-col gap-1',
  title: 'text-lg leading-tight font-bold tracking-tight',
  description: 'line-clamp-1 text-sm text-[var(--color-ink-subtle)] italic',
  close: '-mt-1 -mr-2 shrink-0',
  body: 'flex-1 overflow-y-auto border-t border-[var(--color-border)] px-5 py-5 sm:px-6',
  // Tabs already rule the top, drop the body border
  bodyFlush: 'border-t-0 pt-1',
  footer: 'flex flex-wrap items-center justify-end gap-2 px-5 pt-1 pb-5 sm:px-6',
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
  overlay: 'overlay-enter fixed inset-0 z-50 bg-[var(--color-ink)]/40 backdrop-blur-sm',
  panel:
    'drawer-enter fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
} as const

/**
 * Menu styles, shared by context menu and dropdown
 * @type {Record<string, string>}
 */

export const MENU_STYLES = {
  panel:
    'surface-enter fixed z-[70] min-w-52 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-1 shadow-[var(--shadow-lg)]',
  item: 'flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors hover:bg-[var(--color-surface)] disabled:pointer-events-none disabled:opacity-40',
  danger: 'text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]',
  icon: 'h-4 w-4 shrink-0 opacity-70',
  separator: 'my-1 h-px bg-[var(--color-border)]',
  label: 'px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  shortcut: 'ml-auto text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Tab styles
 * @type {Record<string, string>}
 */

export const TABS_STYLES = {
  list: 'relative flex gap-1 overflow-x-auto border-b border-[var(--color-border)]',
  tab: 'shrink-0 px-3 py-2 text-sm font-medium text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  active: 'text-[var(--color-brand-600)]',
  flagged: 'text-[var(--color-danger)]',
  indicator:
    'tab-indicator pointer-events-none absolute bottom-0 left-0 h-0.5 bg-[var(--color-brand-600)]',
  panel: 'pt-4',
} as const

/**
 * Command palette styles
 * @type {Record<string, string>}
 */

export const PALETTE_STYLES = {
  overlay:
    'overlay-enter fixed inset-0 z-[80] flex items-start justify-center bg-[var(--color-ink)]/50 p-4 pt-[12vh] backdrop-blur-sm',
  panel:
    'surface-enter flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
  field: 'flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3',
  input: 'w-full bg-transparent text-base outline-none placeholder:text-[var(--color-ink-subtle)]',
  results: 'flex-1 overflow-y-auto py-2',
  group: 'px-4 py-1 text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  result: 'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
  resultActive: 'bg-[var(--color-brand-soft)]',
  hint: 'flex items-center justify-between border-t border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Avatar styles
 * @type {Record<string, string>}
 */

export const AVATAR_STYLES = {
  base: 'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-brand-600)] font-semibold text-[var(--color-on-brand)] select-none',
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  stack: 'flex items-center -space-x-2',
  ring: 'ring-2 ring-[var(--color-surface-raised)]',
} as const

export type AvatarSize = Extract<keyof typeof AVATAR_STYLES, 'xs' | 'sm' | 'md' | 'lg'>

/**
 * Corner ribbon styles, a folded band cutting across a card's corner
 * @type {Record<string, string>}
 */

export const RIBBON_STYLES = {
  wrap: 'pointer-events-none absolute top-0 right-0 h-28 w-28 overflow-hidden',
  band: 'absolute top-6 -right-8 flex w-[150px] items-center justify-center gap-1 rotate-45 py-1.5 text-[11px] font-bold tracking-wide uppercase',
  fold: 'absolute -bottom-1.5 h-0 w-0 border-[6px] border-transparent border-t-[var(--color-ink)]/30',
  foldLeft: 'left-0',
  foldRight: 'right-0',
} as const

/**
 * Inline edit styles
 * @type {Record<string, string>}
 */

export const INLINE_EDIT_STYLES = {
  block:
    '-mx-2 -my-1 cursor-text rounded-[var(--radius-sm)] px-2 py-1 transition-colors hover:bg-[var(--color-surface)]',
  text: '-mx-1 cursor-text rounded-[var(--radius-sm)] px-1 transition-colors hover:bg-[var(--color-surface)]',
  input:
    'w-full rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-1 outline-none ring-2 ring-[var(--color-brand-600)]',
  placeholder: 'text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Personal settings page styles
 * @type {Record<string, string>}
 */

export const PREFERENCE_STYLES = {
  stack: 'flex flex-col gap-6',
  rows: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0',
  label: 'text-sm font-medium',
  notice: 'pt-3 text-xs text-[var(--color-ink-subtle)] italic',
  identity: 'flex items-center gap-4 pb-4',
  footer: 'flex justify-end pt-4',
} as const

/**
 * Sign-in screen styles
 * @type {Record<string, string>}
 */

export const SIGN_IN_STYLES = {
  stack: 'flex flex-col gap-5',
  alert:
    'rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-danger)]',
  divider: 'flex items-center gap-3 text-[11px] text-[var(--color-ink-subtle)] uppercase',
  rule: 'h-px flex-1 bg-[var(--color-border)]',
  notice: 'text-xs text-[var(--color-ink-subtle)] italic',
  footer: 'pt-1 text-center text-xs',
  link: 'text-[var(--color-ink-subtle)] underline underline-offset-2 hover:text-[var(--color-ink)]',
} as const

/**
 * Privacy notice styles
 * @type {Record<string, string>}
 */

export const PRIVACY_STYLES = {
  page: 'mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12',
  section: 'flex flex-col gap-3',
  heading: 'text-lg font-bold tracking-tight',
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  card: 'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 text-sm',
  scroller: 'overflow-x-auto',
  table: 'w-full min-w-[40rem] border-collapse text-left text-sm',
  head: 'border-b border-[var(--color-border)] pb-2 text-xs font-semibold uppercase text-[var(--color-ink-subtle)]',
  cell: 'border-b border-[var(--color-border)] py-3 pr-4 align-top',
  footer: 'text-sm',
} as const

/**
 * History consent screen styles
 * @type {Record<string, string>}
 */

export const CONSENT_STYLES = {
  stack: 'flex flex-col gap-4',
  heading: 'text-base font-bold tracking-tight',
  body: 'flex flex-col gap-3 text-sm text-[var(--color-ink-subtle)]',
  choice: 'flex items-start gap-3 text-sm',
  // Both answers sit centred on one column, the rule between them matching their width
  actions: 'mx-auto flex w-full max-w-xs flex-col items-stretch gap-3 pt-2',
  action: 'w-full justify-center',
  divider: 'h-px w-full bg-[var(--color-border)]',
  error: 'text-center text-xs text-[var(--color-danger)]',
} as const

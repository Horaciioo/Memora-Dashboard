/**
 * Section and panel styles
 * @type {Record<string, string>}
 */

export const SECTION_STYLES = {
  wrapper: 'flex flex-col gap-3',
  header: 'flex flex-wrap items-end justify-between gap-3',
  heading: 'flex flex-col gap-1',
  title: 'text-xl font-extrabold tracking-tight sm:text-2xl',
  description: 'text-sm italic text-[var(--color-ink-rose)]',
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
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-subtle)]',
  title: 'text-2xl font-extrabold tracking-tight sm:text-3xl',
  lead: 'max-w-2xl text-sm italic text-[var(--color-ink-rose)]',
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
  badge: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]',
  glyph: 'h-5 w-5',
  heading: 'flex min-w-0 flex-1 flex-col gap-1',
  title: 'text-lg leading-tight font-bold tracking-tight',
  description: 'text-sm text-[var(--color-ink-rose)] italic',
  close: '-mt-1 -mr-2 shrink-0',
  body: 'flex-1 overflow-y-auto border-t border-[var(--color-border)] px-5 py-5 sm:px-6',
  footer:
    'flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)]/60 px-5 py-4 sm:px-6',
} as const

/**
 * Panel width per dialog size
 * @type {Record<string, string>}
 */

export const DIALOG_SIZES = {
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
  base: 'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-brand-soft)] font-semibold text-[var(--color-brand-600)] select-none',
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
  band: 'absolute top-6 -right-8 flex w-[150px] items-center justify-center gap-1 rotate-45 py-1.5 text-[11px] font-bold tracking-wide uppercase shadow-[var(--shadow-md)]',
  sheen:
    'pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-[var(--color-ink)]/10',
  fold: 'absolute -bottom-1.5 h-0 w-0 border-[6px] border-transparent border-t-[var(--color-ink)]/30',
  foldLeft: 'left-0',
  foldRight: 'right-0',
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

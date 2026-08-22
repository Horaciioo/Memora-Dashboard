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
  frame: 'flex min-h-screen bg-[var(--color-background)]',
  sidebar:
    'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-raised)] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
  sidebarHidden: '-translate-x-full',
  brand: 'flex items-center gap-2.5 border-b border-[var(--color-border)] px-4 py-4',
  brandMark: 'h-8 w-8 rounded-[var(--radius-md)]',
  brandName: 'text-base leading-none font-extrabold tracking-tight',
  brandCompany: 'text-[11px] tracking-wide text-[var(--color-ink-subtle)] uppercase',
  nav: 'flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4',
  navGroup: 'flex flex-col gap-1',
  navGroupLabel:
    'px-2 pb-1 text-[11px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  navLink:
    'group flex items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-sm font-medium text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]',
  navLinkActive: 'bg-[var(--color-brand-soft)] text-[var(--color-brand-600)]',
  navIcon: 'h-4 w-4 shrink-0',
  navBadge:
    'ml-auto rounded-full bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] text-[var(--color-ink-subtle)]',
  sidebarFooter: 'border-t border-[var(--color-border)] p-3',
  scrim: 'fixed inset-0 z-30 bg-[var(--color-ink)]/40 backdrop-blur-sm lg:hidden',
  main: 'flex min-w-0 flex-1 flex-col',
  topbar:
    'sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/85 px-4 py-3 backdrop-blur sm:px-6',
  searchTrigger:
    'flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-sm text-[var(--color-ink-subtle)] transition-colors hover:border-[var(--color-border-strong)] sm:max-w-sm',
  searchHint:
    'ml-auto hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] sm:block',
  content: 'mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8',
  breadcrumbs: 'flex flex-wrap items-center gap-1 text-xs text-[var(--color-ink-subtle)]',
  crumbLink: 'transition-colors hover:text-[var(--color-ink)]',
  crumbCurrent: 'font-medium text-[var(--color-ink)]',
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

/**
 * Skeleton shapes
 * @type {Record<string, string>}
 */

export const SKELETON_SHAPES = {
  line: 'h-4 w-full',
  row: 'h-11 w-full',
  tile: 'h-24 w-full',
  card: 'h-32 w-full',
  sheet: 'h-48 w-full',
  board: 'h-72 w-full',
} as const

export type SkeletonShape = keyof typeof SKELETON_SHAPES

/** @type {string} */

export const SKELETON_BASE = 'skeleton-shimmer rounded-[var(--radius-md)] bg-[var(--color-surface)]'

/**
 * Empty state styles
 * @type {Record<string, unknown>}
 */

export const EMPTY_STATE_STYLES = {
  frame:
    'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)]/40 px-6 py-12 text-center',
  frameCompact:
    'flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)]/40 px-6 py-8 text-center',
  start: { illustration: 'h-28 w-28' },
  filter: { illustration: 'h-24 w-24' },
  compact: { illustration: 'h-16 w-16' },
} as const

/**
 * Progress bar styles, the fill width being the only inline style allowed
 * @type {Record<string, string>}
 */

export const PROGRESS_STYLES = {
  frame: 'flex flex-col gap-1.5',
  label: 'flex items-center justify-between gap-2 text-xs text-[var(--color-ink-subtle)]',
  value: 'font-semibold tabular-nums',
  track: 'h-2 w-full overflow-hidden rounded-full bg-[var(--color-neutral-soft)]',
  trackCompact: 'h-1',
  fill: 'h-full rounded-full transition-[width] duration-[var(--motion-duration-moderate)]',
} as const

/**
 * Toast styles
 * @type {Record<string, string>}
 */

export const TOAST_STYLES = {
  // Above the floating nav pill on mobile, pinned top-right from md
  stack:
    'pointer-events-none fixed inset-x-4 bottom-[calc(var(--shell-bottom-nav-h)_+_1.5rem_+_env(safe-area-inset-bottom))] z-[60] flex flex-col gap-2 md:inset-x-auto md:top-4 md:right-4 md:bottom-auto md:w-[min(23rem,calc(100vw-2rem))]',
  toast:
    'surface-enter pointer-events-auto flex touch-pan-y items-start gap-3 rounded-[var(--radius-lg)] border border-l-4 border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm shadow-[var(--shadow-lg)]',
  badge: 'flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
  glyph: 'h-4 w-4',
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  title: 'font-semibold',
  description: 'text-xs text-[var(--color-ink-subtle)]',
  dismiss:
    'shrink-0 text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
} as const

/**
 * Inline creation row styles
 * @type {Record<string, string>}
 */

export const ADD_ROW_STYLES = {
  base: 'flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-4 py-3 text-sm font-medium text-[var(--color-ink-subtle)] transition-colors hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-600)] disabled:pointer-events-none disabled:opacity-50',
  tile: 'min-h-24 flex-col',
  icon: 'h-4 w-4',
} as const

/**
 * Maturity tag styles, a toned pill pointing at the explainer page
 * @type {Record<string, string>}
 */

export const MATURITY_STYLES = {
  tag: 'inline-flex shrink-0 items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase',
  link: 'transition-opacity hover:opacity-80',
  row: 'flex items-start gap-3 text-sm',
  meaning: 'text-[var(--color-ink-subtle)]',
} as const

/**
 * Notification bell, its panel and its rows
 * @type {Record<string, string>}
 */

export const NOTIFICATION_STYLES = {
  // The pastille sits on the bell itself, so the trigger keeps its square footprint
  trigger: 'relative',
  pastille:
    'pointer-events-none absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-bold tabular-nums text-[var(--color-on-brand)]',
  scrim: 'fixed inset-0 z-[65]',
  panel:
    'surface-enter fixed z-[70] flex max-h-[min(28rem,70vh)] w-[min(21rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
  header:
    'flex shrink-0 items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-2.5',
  title: 'text-sm font-bold',
  body: 'flex-1 overflow-y-auto p-2',
  footer: 'shrink-0 border-t border-[var(--color-border)]',
  footerLink:
    'flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[var(--color-brand-600)] transition-colors hover:bg-[var(--color-surface)]',
  footerIcon: 'h-3.5 w-3.5',
  list: 'flex flex-col',
  // Inset rule between two rows, never reaching either edge of the panel
  divider: 'mx-4 block h-px bg-[var(--color-border)]',
  row: 'flex gap-3 rounded-[var(--radius-md)] px-2 py-2.5 transition-colors',
  rowUnread: 'bg-[var(--color-brand-soft)]/40',
  portrait: 'relative shrink-0',
  glyph:
    'absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-[var(--color-surface-raised)]',
  glyphIcon: 'h-2.5 w-2.5',
  content: 'flex min-w-0 flex-1 flex-col gap-0.5',
  sentence: 'text-sm leading-snug text-[var(--color-ink)]',
  verb: 'font-bold',
  subject: 'truncate text-xs font-medium text-[var(--color-ink-subtle)]',
  foot: 'flex items-center gap-2 pt-1',
  moment: 'text-xs tabular-nums text-[var(--color-ink-subtle)]',
  action:
    'ml-auto inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-0.5 text-xs font-semibold transition-colors hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-600)]',
  actionIcon: 'h-3 w-3',
} as const

/**
 * Last resort error screen styles, standing without the app shell
 * @type {Record<string, string>}
 */

export const CRITICAL_ERROR_STYLES = {
  body: 'bg-[var(--color-background)] text-[var(--color-ink)] antialiased',
  frame:
    'mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center',
  title: 'text-xl font-extrabold tracking-tight',
  description: 'text-sm text-[var(--color-ink-subtle)]',
  reference: 'font-mono text-xs text-[var(--color-ink-subtle)]',
  action:
    'mt-2 rounded-[var(--radius-md)] bg-[var(--color-brand-600)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)]',
} as const

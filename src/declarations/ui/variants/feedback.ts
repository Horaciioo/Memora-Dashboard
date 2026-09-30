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
    'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-12 text-center',
  frameCompact:
    'flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-8 text-center',
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
  // Above the nav pill on mobile, top-right from md; the pile sets its own height
  stack:
    'toast-pile pointer-events-auto fixed inset-x-4 bottom-[calc(var(--shell-bottom-nav-h)_+_1.5rem_+_env(safe-area-inset-bottom))] z-[60] md:inset-x-auto md:top-4 md:right-4 md:bottom-auto md:w-[min(23rem,calc(100vw-2rem))]',
  stackSpread: 'toast-pile-spread',
  // Placed by .toast-pile
  item: 'absolute inset-x-0',
  // Space once spread
  gapPx: 8,
  toast:
    'toast-enter relative flex touch-pan-y items-start gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-l-4 border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm shadow-[var(--shadow-lg)]',
  settle: 'transition-[transform,opacity] motion-reduce:transition-none',
  badge: 'flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
  glyph: 'h-4 w-4',
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  title: 'font-semibold',
  description: 'text-xs text-[var(--color-ink-subtle)]',
  dismiss:
    'shrink-0 text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  // Duration set inline
  countdown: 'toast-countdown absolute inset-x-0 bottom-0 h-0.5 origin-left',
  countdownPaused: '[animation-play-state:paused]',
} as const

/**
 * Inline creation row styles
 * @type {Record<string, string>}
 */

export const ADD_ROW_STYLES = {
  base: 'flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-4 py-3 text-sm font-medium text-[var(--color-ink-subtle)] transition-colors hover:border-[var(--color-brand-400)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] disabled:pointer-events-none disabled:opacity-50',
  tile: 'min-h-24 flex-col',
  icon: 'h-4 w-4',
} as const

/**
 * Maturity tag styles
 * @type {Record<string, string>}
 */

export const MATURITY_STYLES = {
  // Outlined, never filled
  tag: 'inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] leading-none font-medium tracking-wide text-[var(--color-ink)] uppercase',
  progress: 'text-[var(--color-ink-subtle)]',
  link: 'transition-colors hover:border-[var(--color-ink)]',
  row: 'flex items-start gap-3 text-sm',
  meaning: 'text-[var(--color-ink-subtle)]',
} as const

/**
 * Notification bell
 * @type {Record<string, string>}
 */

export const NOTIFICATION_STYLES = {
  // The pastille sits on the bell itself
  trigger: 'relative',
  // Unread dot, never a number
  pastille:
    'pointer-events-none absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-danger)] ring-2 ring-[var(--color-surface-raised)]',
  scrim: 'fixed inset-0 z-[65]',
  panel:
    'rail-reset surface-enter fixed z-[70] flex max-h-[min(28rem,70vh)] w-[min(21rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-lg)]',
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
    'ml-auto inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-0.5 text-xs font-semibold transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  actionIcon: 'h-3 w-3',
} as const

/**
 * Last resort error screen styles, standing without the app shell
 * @type {Record<string, string>}
 */

export const CRITICAL_ERROR_STYLES = {
  body: 'bg-[var(--color-background)] text-[var(--color-ink)] antialiased',
  action:
    'rounded-[var(--radius-md)] bg-[var(--color-brand-600)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)] transition-colors hover:bg-[var(--color-brand-700)]',
} as const

/**
 * Info hint styles
 * @type {Record<string, string>}
 */

export const INFO_HINT = {
  wrapper: 'group/info relative inline-flex shrink-0',
  trigger:
    'inline-flex items-center justify-center rounded-full transition-colors duration-[var(--motion-duration-fast)]',
  triggerTone:
    'text-[var(--color-ink-subtle)] hover:text-[var(--color-brand-600)] focus-visible:text-[var(--color-brand-600)]',
  icon: 'h-4 w-4',
  // Shown on hover or focus
  pop: 'invisible absolute top-[calc(100%+0.5rem)] z-[60] w-max max-w-64 translate-y-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-1.5 text-left text-xs leading-snug font-normal tracking-normal text-[var(--color-ink)] normal-case opacity-0 shadow-[var(--shadow-md)] transition-[opacity,transform,visibility] duration-[var(--motion-duration-fast)] group-focus-within/info:visible group-focus-within/info:translate-y-0 group-focus-within/info:opacity-100 group-hover/info:visible group-hover/info:translate-y-0 group-hover/info:opacity-100 motion-reduce:transition-none',
  // Exclusive anchors
  popCenter: 'left-1/2 -translate-x-1/2',
  popStart: '-left-2',
} as const

/**
 * Change mark styles
 * @type {Record<string, string>}
 */

export const DELTA_MARK = {
  wrap: 'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
  glyph: 'h-3.5 w-3.5',
} as const

/**
 * Failed load styles
 * @type {Record<string, string>}
 */

export const QUERY_ERROR = {
  frame:
    'flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-4 py-3',
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  title: 'text-sm font-semibold text-[var(--color-danger)]',
  hint: 'text-xs text-[var(--color-ink-subtle)]',
} as const

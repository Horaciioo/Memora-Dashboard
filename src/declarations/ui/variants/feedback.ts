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

/**
 * Animated brand loader
 * @type {Record<string, string>}
 */

export const BRAND_LOADER = {
  // Bare mark, no box
  tile: 'inline-flex shrink-0 items-center justify-center',
  tileMark: 'h-10',
  // Centred in a panel waiting on its data
  block: 'flex min-h-48 w-full flex-col items-center justify-center gap-3 py-10',
  blockTile: 'inline-flex items-center justify-center',
  blockMark: 'h-16',
  // Inside a pink button
  inline: 'brain-mark-white h-4 shrink-0',
  // On a light surface
  ink: 'h-6 shrink-0',
  caption: 'text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Route skeleton layouts
 * @type {Record<string, string>}
 */

export const PAGE_SKELETON = {
  page: 'flex flex-col gap-8',
  // Banner stand-in and its title
  bannerFill: 'absolute inset-0',
  bannerTitle: 'h-8 w-56 max-w-full',
  stack: 'flex flex-col gap-3',
  // Raised box like the real sections
  box: 'flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-5 shadow-[var(--shadow-sm)]',
  grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3',
  gridWide: 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4',
  group: 'flex flex-col gap-4',
  groupHead: 'flex items-center gap-3',
  columns: 'grid grid-cols-1 gap-4 md:grid-cols-3',
  column: 'flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3',
  split: 'grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]',
  file: 'grid grid-cols-1 gap-8 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-start',
  tabs: 'flex gap-2',
  hero: 'flex items-center gap-4',
} as const

/** @type {string} */

export const SKELETON_BASE = 'skeleton-shimmer rounded-[var(--radius-md)] bg-[var(--color-surface)]'

/**
 * Empty state styles
 * @type {Record<string, unknown>}
 */

export const EMPTY_STATE_STYLES = {
  frame:
    'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center',
  frameCompact:
    'flex flex-col items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center',
  start: { illustration: 'course-pop h-32 w-32' },
  filter: { illustration: 'course-pop h-28 w-28' },
  compact: { illustration: 'course-pop h-20 w-20' },
} as const

/**
 * Progress bar styles
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
  // Top right, under the top bar on mobile
  stack:
    'toast-pile pointer-events-auto fixed inset-x-4 top-[calc(var(--shell-top-bar-h)_+_env(safe-area-inset-top)_+_0.75rem)] z-[60] md:inset-x-auto md:top-6 md:right-6 md:w-[min(26rem,calc(100vw-2rem))] print:hidden',
  stackSpread: 'toast-pile-spread',
  // Placed by .toast-pile
  item: 'absolute inset-x-0',
  // Space once spread
  gapPx: 8,
  toast:
    'toast-enter relative flex touch-pan-y items-start gap-3 overflow-hidden rounded-[var(--radius-xl)] glass-toast px-4 py-3 text-sm',
  settle: 'transition-[transform,opacity] motion-reduce:transition-none',
  badge: 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
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
  base: 'flex w-full items-center justify-center gap-2 border border-dashed border-[var(--color-border-strong)] text-sm font-medium text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] disabled:pointer-events-none disabled:opacity-50',
  row: 'rounded-[var(--radius-md)] px-4 py-3',
  // Same radius, padding and min height as the card it sits beside
  tiles: {
    session: 'min-h-28 flex-col rounded-[var(--radius-xl)] p-5',
    candidate: 'min-h-18 flex-col rounded-[var(--radius-lg)] p-4',
    note: 'min-h-24 flex-col rounded-[var(--radius-lg)] p-4',
    column: 'min-h-24 flex-col rounded-[var(--radius-xl)] p-2.5',
    channel: 'min-h-16 flex-col rounded-[var(--radius-lg)] px-4 py-3',
    offense: 'min-h-16 flex-col rounded-[var(--radius-md)] px-4 py-3',
  },
  icon: 'h-4 w-4',
} as const

/**
 * Maturity tag styles
 * @type {Record<string, string>}
 */

export const MATURITY_STYLES = {
  // Solid box, white word, a star on the right edge
  tag: 'relative isolate inline-flex shrink-0 items-center overflow-hidden rounded-[0.45rem] pt-[0.34rem] pr-3 pb-[0.3rem] pl-2 text-[0.625rem] leading-none font-bold tracking-[0.14em] text-white uppercase shadow-[0_1px_2px_rgb(0_0_0/0.18)] [text-shadow:0_1px_0_rgb(0_0_0/0.18)]',
  // Rail size keeps a line of navigation wider than its tag
  compact: 'rounded-[0.35rem] pt-[0.24rem] pr-2 pb-[0.2rem] pl-1.5 text-[0.5rem] tracking-[0.1em]',
  // Four-pointed star, never on the very corner
  star: 'pointer-events-none absolute top-[2px] right-[7%] h-[0.4rem] w-[0.4rem] text-white/90',
  // Softer light over the top half
  sheen:
    'pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/25 to-transparent',
  fills: {
    alpha: 'bg-gradient-to-br from-slate-500 to-slate-700',
    beta: 'bg-gradient-to-br from-[var(--color-brand-700)] to-[var(--color-brand-800)]',
    // Same gold as the news cards, the star in white to show on it
    new: 'bg-gradient-to-br from-[var(--color-gold-100)] via-[var(--color-gold-300)] to-[var(--color-gold-400)] text-black [text-shadow:none] ring-1 ring-inset ring-[var(--color-gold-400)]/40 [&>svg]:text-white',
    deprecated: 'bg-gradient-to-br from-red-600 to-red-800',
  },
  link: 'transition-[transform,filter] hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  // Tag column of one width, so every meaning starts at the same place
  list: 'flex flex-col gap-4',
  row: 'grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-4 text-sm',
  meaning: 'text-[var(--color-ink-subtle)]',
  rule: 'h-px w-full bg-[var(--color-border)]',
  actions: 'flex flex-col gap-4',
} as const

/**
 * Notification bell
 * @type {Record<string, string>}
 */

export const NOTIFICATION_STYLES = {
  // The unread count sits on the bell itself
  trigger: 'relative',
  // Small red dot on the bell corner
  pastille:
    'pointer-events-none absolute top-1 right-1 size-2.5 rounded-full bg-[var(--color-danger)] ring-2 ring-[var(--color-surface-raised)]',
  scrim: 'fixed inset-0 z-[65]',
  panel:
    'rail-reset surface-enter fixed z-[70] flex max-h-[min(28rem,70vh)] w-[min(21rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] glass-panel shadow-[var(--shadow-lg)]',
  header:
    'flex shrink-0 items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-2.5',
  title: 'text-sm font-bold',
  body: 'flex-1 overflow-y-auto p-2',
  footer: 'flex shrink-0 flex-col gap-3 px-3 pb-3',
  // Rule stopping short of the box edges
  footerRule: 'mx-3 block h-px bg-[var(--color-border)]',
  footerLink:
    'flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-600)] px-5 py-3 text-base font-bold text-[var(--color-on-brand)] transition-colors hover:bg-[var(--color-brand-700)]',
  footerIcon: 'h-4 w-4',
  list: 'flex flex-col',
  // Inset rule between two rows
  divider: 'mx-4 block h-px bg-[var(--color-border)]',
  row: 'flex gap-3 rounded-[var(--radius-md)] px-2 py-2.5 transition-colors',
  rowUnread: 'bg-[var(--color-brand-soft)]/40',
  // Wraps the avatar exactly so the glyph sits on its bottom right corner
  portrait: 'relative flex shrink-0 self-start',
  glyph:
    'absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-[var(--color-surface-raised)]',
  glyphIcon: 'h-2.5 w-2.5',
  content: 'flex min-w-0 flex-1 flex-col gap-0.5',
  sentence: 'text-sm leading-snug text-[var(--color-ink)]',
  verb: 'font-bold',
  subject: 'truncate text-xs font-medium text-[var(--color-ink-subtle)]',
  foot: 'flex items-center gap-2 pt-1',
  moment: 'text-xs tabular-nums text-[var(--color-ink-subtle)]',
  // Whole row opens its target, one invisible link laid over it
  rowLinked: 'hover:bg-[var(--color-hover)]',
  rowLink:
    'absolute inset-0 z-10 rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  // Arrow showing on the row under the pointer, away from the remove control
  rowArrow:
    'pointer-events-none absolute right-3 bottom-2.5 h-4 w-4 text-[var(--color-ink-subtle)] opacity-0 transition-opacity group-hover/row:opacity-100',
  // Small way back to unread, above the row link
  markUnread:
    'relative z-20 cursor-pointer text-xs font-semibold text-[var(--color-ink-subtle)] underline underline-offset-2 transition-colors hover:text-[var(--color-ink)]',
  // Shows on the row under the pointer
  remove:
    'absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-ink-subtle)] opacity-0 transition-[opacity,background-color] group-hover/row:opacity-100 hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] focus-visible:opacity-100',
  removeIcon: 'h-3.5 w-3.5',
  // Board toolbar and its older-entries button
  tools: 'flex flex-wrap items-center justify-between gap-3 pb-3',
  filters: 'flex items-center gap-1',
  more: 'flex justify-center pt-4',
} as const

/**
 * Last resort error screen styles
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
  // Info marks only exist from md up
  wrapper: 'group/info relative hidden shrink-0 md:inline-flex',
  trigger:
    'inline-flex items-center justify-center rounded-full transition-colors duration-[var(--motion-duration-fast)]',
  triggerTone:
    'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-accent)] focus-visible:text-[var(--color-ink-accent)]',
  icon: 'h-4 w-4',
  // Shown on hover or focus
  pop: 'invisible absolute top-[calc(100%+0.5rem)] z-[60] w-max max-w-64 translate-y-1 rounded-[var(--radius-md)] border border-[var(--color-border)] glass-panel px-2.5 py-1.5 text-left text-xs leading-snug font-normal tracking-normal text-[var(--color-ink)] normal-case opacity-0 shadow-[var(--shadow-md)] transition-[opacity,transform,visibility] duration-[var(--motion-duration-fast)] group-focus-within/info:visible group-focus-within/info:translate-y-0 group-focus-within/info:opacity-100 group-hover/info:visible group-hover/info:translate-y-0 group-hover/info:opacity-100 motion-reduce:transition-none',
  // Exclusive anchors
  popCenter: 'left-1/2 -translate-x-1/2',
  popStart: '-left-2',
} as const

/**
 * Instant label pointing at its glyph
 * @type {Record<string, string>}
 */

export const TIP = {
  wrapper: 'group/tip relative inline-flex shrink-0',
  // Hover only, a touch screen never draws it
  pop: 'pointer-events-none invisible absolute bottom-[calc(100%+0.5rem)] left-1/2 z-[60] -translate-x-1/2 translate-y-1 rounded-[var(--radius-sm)] bg-[var(--color-ink)] px-2 py-1 text-xs leading-none font-semibold tracking-normal whitespace-nowrap text-[var(--color-surface-raised)] normal-case opacity-0 shadow-[var(--shadow-md)] transition-[opacity,transform,visibility] duration-75 group-focus-within/tip:visible group-focus-within/tip:translate-y-0 group-focus-within/tip:opacity-100 group-hover/tip:visible group-hover/tip:translate-y-0 group-hover/tip:opacity-100 motion-reduce:transition-none [@media(hover:none)]:hidden',
  arrow:
    'absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[var(--color-ink)]',
  // Same bubble drawn on the body, centred above its anchor
  floating:
    'pointer-events-none fixed z-[90] -translate-x-1/2 -translate-y-full rounded-[var(--radius-sm)] bg-[var(--color-ink)] px-2 py-1 text-xs leading-none font-semibold tracking-normal whitespace-nowrap text-[var(--color-surface-raised)] normal-case shadow-[var(--shadow-md)]',
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

/**
 * Glyph unfolding into its words styles
 * @type {Record<string, string>}
 */

export const REVEAL_MARK = {
  root: 'group inline-flex items-center gap-1.5 rounded-full text-sm font-semibold outline-none',
  glyph: 'h-4 w-4 shrink-0',
  // Track grows from nothing
  track:
    'grid grid-cols-[0fr] transition-[grid-template-columns] duration-[var(--motion-duration-panel)] ease-out group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr] motion-reduce:transition-none',
  text: 'overflow-hidden whitespace-nowrap not-italic',
} as const

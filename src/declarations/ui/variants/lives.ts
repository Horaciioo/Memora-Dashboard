import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Livecon page
 * @type {Record<string, string>}
 */

export const LIVE_BOARD = {
  wrapper: 'mx-auto flex w-full max-w-5xl flex-col gap-10',
  toolbar: 'flex flex-wrap items-center justify-center gap-3',
  list: 'flex flex-col gap-6',
  // Raised card
  strip:
    'card-glow relative flex flex-col gap-5 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-6',
  stripLive: 'border-[var(--color-danger)] shadow-[var(--shadow-md)]',
  head: 'flex min-w-0 items-center gap-5',
  creator: 'text-3xl font-bold tracking-tight sm:text-4xl',
  identity: 'flex min-w-0 flex-col gap-1',
  title: 'text-body text-[var(--color-ink-subtle)]',
  onAir:
    'flex items-center gap-2 text-xs font-bold tracking-wide text-[var(--color-danger)] uppercase',
  dotPulse: 'live-pulse h-3.5 w-3.5',
  // Coordinator and times on one line
  facts: 'flex flex-wrap items-center gap-x-6 gap-y-4 border-y border-[var(--color-border)] py-4',
  fact: 'flex min-w-0 flex-col gap-0.5',
  factDivider: 'hidden h-10 w-px bg-[var(--color-border)] sm:block',
  factLabel: PROPERTY_LABEL,
  factClock: 'text-2xl leading-none font-bold tracking-tight tabular-nums',
  factClockLive: 'text-[var(--color-danger)]',
  factDay: 'text-xs font-semibold text-[var(--color-ink-subtle)] first-letter:uppercase',
  coordinator: 'flex items-center gap-3',
  coordinatorPortrait: 'relative shrink-0',
  coordinatorBadge:
    'absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)]',
  coordinatorGlyph: 'h-4 w-4',
  coordinatorName: 'truncate text-lg leading-tight font-bold tracking-tight',
  coordinatorEmpty: 'text-sm text-[var(--color-ink-subtle)] italic',
  // Buttons side by side with dividers
  actions: 'flex flex-wrap items-center gap-x-1 gap-y-2',
  actionDivider: 'h-5 w-px shrink-0 bg-[var(--color-border-strong)]',
  confirm: 'w-full text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Live entry on the rail
 * @type {Record<string, string>}
 */

export const LIVE_NAV = {
  dotPulse: 'live-pulse',
} as const

/**
 * Urgent live call on the home
 * @type {Record<string, string>}
 */

export const LIVE_URGENT = {
  section: 'flex flex-col gap-3',
  label: PROPERTY_LABEL,
  list: 'flex flex-col gap-2',
  row: 'flex items-center gap-4 rounded-[var(--radius-lg)] border card-surface px-4 py-3 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  rowLive: 'border-[var(--color-danger)]',
  rowAnnounced: 'border-[var(--color-border)]',
  dot: 'h-7 w-7 shrink-0',
  text: 'min-w-0 flex-1 truncate font-bold tracking-tight',
  go: 'shrink-0 text-sm font-bold text-[var(--color-danger)]',
} as const

/**
 * Coordinator requests on the home and seats on a live
 * @type {Record<string, string>}
 */

export const LIVE_COORDINATION = {
  answer: 'flex flex-col gap-4',
  label: PROPERTY_LABEL,
  lead: 'text-body font-bold tracking-tight',
  meta: 'text-sm text-[var(--color-ink-subtle)]',
  times: 'grid gap-3 sm:grid-cols-2',
  timeField: 'flex flex-col gap-1.5',
  timeLabel: PROPERTY_LABEL,
  actions: 'flex flex-wrap items-center gap-3',
  // Seats listed on a live
  seats: 'flex flex-col gap-2',
  seat: 'flex items-center gap-3',
  seatText: 'flex min-w-0 flex-col',
  seatName: 'truncate font-bold tracking-tight',
  seatMeta: 'text-xs text-[var(--color-ink-subtle)]',
  seatMuted: 'opacity-60',
  gap: 'text-sm font-bold text-[var(--color-danger)]',
} as const

/**
 * Report of a live: figures, timeline, moderators, log
 * @type {Record<string, string>}
 */

export const LIVE_REPORT = {
  wrapper: 'mx-auto flex w-full max-w-5xl flex-col gap-10',
  toolbar: 'flex flex-wrap items-center justify-center gap-3 print:hidden',
  notice:
    'rounded-[var(--radius-lg)] border-l-4 border-[var(--color-caution)] bg-[var(--color-caution-soft)] px-4 py-3 text-sm',
  figures: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
  figure:
    'flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 py-4',
  figureLabel: PROPERTY_LABEL,
  figureValue: 'text-3xl font-bold tracking-tight tabular-nums',
  // Timeline
  chart: 'flex h-40 items-end gap-0.5',
  bar: 'group relative flex h-full flex-1 items-end',
  barFill:
    'w-full rounded-t-sm bg-[var(--color-brand-600)] transition-colors group-hover:bg-[var(--color-brand-800)]',
  barEmpty: 'h-px w-full bg-[var(--color-border)]',
  barTip:
    'pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-[var(--radius-sm)] bg-[var(--color-ink)] px-2 py-1 text-xs whitespace-nowrap text-[var(--color-surface)] group-hover:block',
  axis: 'mt-2 flex justify-between text-xs text-[var(--color-ink-subtle)] tabular-nums',
  peak: 'mt-3 text-sm font-semibold',
  // Livecon frise under the timeline
  frise: 'mt-4 flex h-3 overflow-hidden rounded-full bg-[var(--color-border)]',
  friseSlice: 'h-full border-r-2 border-[var(--color-surface)] last:border-r-0',
  friseLegend: 'mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-ink-subtle)]',
  friseKey: 'inline-flex items-center gap-1.5',
  friseDot: 'h-2.5 w-2.5 rounded-full',
  // Moderators
  rows: 'flex flex-col',
  row: 'grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_auto] items-center gap-4 border-t border-[var(--color-border)] py-3 first:border-t-0',
  rowName: 'truncate font-semibold',
  rowNameMuted: 'truncate font-semibold text-[var(--color-ink-subtle)]',
  rowTrack: 'h-2.5 overflow-hidden rounded-full bg-[var(--color-border)]',
  rowFill: 'block h-full rounded-full bg-[var(--color-brand-600)]',
  rowValue: 'text-right text-sm tabular-nums',
  rowMeta: 'block text-xs text-[var(--color-ink-subtle)]',
  kinds: 'grid gap-2 sm:grid-cols-2',
  kind: 'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2',
  kindIcon: 'h-6 w-6 shrink-0',
  kindLabel: 'flex-1 text-sm',
  kindCount: 'text-sm font-bold tabular-nums',
  // Log
  logHead: 'flex flex-wrap items-center justify-between gap-3',
  log: 'flex flex-col',
  line: 'grid grid-cols-[3.5rem_minmax(0,9rem)_minmax(0,1fr)] items-start gap-3 border-t border-[var(--color-border)] py-2.5 text-sm first:border-t-0',
  lineTime: 'text-xs text-[var(--color-ink-subtle)] tabular-nums pt-0.5',
  lineActor: 'truncate font-semibold',
  lineBody: 'flex min-w-0 flex-col gap-0.5',
  lineWhat: 'flex flex-wrap items-center gap-x-2',
  lineIcon: 'h-4 w-4 shrink-0',
  lineDetail: 'truncate text-xs text-[var(--color-ink-subtle)]',
  lineFailed: 'text-xs font-semibold text-[var(--color-danger)]',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
  // Past lives on the lives page
  pastWrap: 'mx-auto w-full max-w-5xl',
  past: 'flex flex-col',
  pastRow:
    'flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] py-3 first:border-t-0',
  pastName: 'font-semibold',
  pastMeta: 'text-sm text-[var(--color-ink-subtle)]',
  pastLinks: 'flex flex-wrap gap-2',
  // Creator report reads like a letter
  letter: 'mx-auto flex w-full max-w-3xl flex-col gap-8',
  sentence: 'text-lg leading-relaxed',
} as const

/**
 * Moderation view of a member's file
 * @type {Record<string, string>}
 */

export const MEMBER_MODERATION = {
  stack: 'flex flex-col gap-6',
  switch: 'flex justify-center',
  hours: 'flex items-baseline gap-3',
  hoursLabel: PROPERTY_LABEL,
  hoursValue: 'text-2xl font-bold tracking-tight tabular-nums',
  list: 'flex flex-col',
  item: 'border-t border-[var(--color-border)] first:border-t-0',
  row: 'flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-[var(--radius-md)] px-2 py-3 text-left transition-colors hover:bg-[var(--color-hover)]',
  rowIcon: 'h-6 w-6 shrink-0',
  rowMain: 'flex min-w-0 flex-1 flex-col',
  rowTitle: 'font-semibold',
  rowMeta: 'text-sm text-[var(--color-ink-subtle)]',
  rowTime: 'text-sm tabular-nums',
  details: 'course-erase-in flex flex-col gap-3 px-2 pb-4',
  detailsLink: 'self-start text-sm font-semibold text-[var(--color-ink-accent)] hover:underline',
} as const

/**
 * Roll-call board of a live: three columns
 * @type {Record<string, string>}
 */

export const LIVE_ROSTER = {
  root: 'flex w-full flex-col gap-4 border-t border-[var(--color-border)] pt-5',
  head: 'flex flex-wrap items-baseline justify-between gap-2',
  title: PROPERTY_LABEL,
  lead: 'text-xs text-[var(--color-ink-subtle)]',
  columns: 'grid gap-3 sm:grid-cols-3',
  column:
    'flex min-h-28 flex-col gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-3 transition-colors',
  columnOver: 'border-[var(--color-brand-600)] bg-[var(--color-brand-100)]',
  columnHead: 'flex items-center gap-2 text-xs font-bold tracking-wide uppercase',
  columnGlyph: 'h-4 w-4 shrink-0',
  columnEmpty: 'text-xs text-[var(--color-ink-subtle)] italic',
  person:
    'flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-sm font-semibold',
  personMovable: 'cursor-grab active:cursor-grabbing',
  personDragged: 'opacity-40',
  junior: 'ml-auto text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  toggle: 'self-start',
} as const

/**
 * Instructions screen read before the Mod View
 * @type {Record<string, string>}
 */

export const LIVE_GATE = {
  root: 'mx-auto flex w-full max-w-3xl flex-col gap-6',
  card: 'flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-sm)]',
  title: 'text-2xl font-bold tracking-tight',
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  actions: 'flex flex-wrap items-center justify-center gap-3',
  reread: 'self-end',
} as const

/**
 * Bubble telling a live just started
 * @type {Record<string, string>}
 */

export const LIVE_STARTED_BUBBLE = {
  // Pill beside the entry, one shadow over pill and tip
  root: 'rail-reset nudge-enter absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 cursor-pointer rounded-full bg-[var(--color-surface-raised)] px-4 py-2 text-left text-caption font-semibold whitespace-nowrap text-[var(--color-ink)] [filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.3))_drop-shadow(0_0.5rem_1rem_rgb(0_0_0/0.14))] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  tail: 'pointer-events-none absolute top-1/2 -left-[0.5625rem] h-[1.125rem] w-3 -translate-y-1/2 text-[var(--color-surface-raised)]',
} as const

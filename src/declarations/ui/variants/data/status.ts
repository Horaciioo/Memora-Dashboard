/**
 * Journal styles
 * @type {Record<string, string>}
 */

export const JOURNAL_STYLES = {
  list: 'flex flex-col gap-3',
  item: 'flex flex-col gap-3',
  entry: 'flex gap-3',
  body: 'flex min-w-0 flex-1 flex-col gap-1',
  head: 'flex flex-wrap items-center gap-2',
  tick: 'h-3 w-px shrink-0 bg-[var(--color-border-strong)]',
  moment: 'text-xs tabular-nums text-[var(--color-ink-subtle)]',
  sentence: 'text-sm text-[var(--color-ink)]',
  verb: 'font-bold',
  // What the entry is about
  subject: 'flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-[var(--color-ink-muted)]',
  subjectLogo: 'size-3.5 shrink-0',
  // Glyph leading the line
  glyph: 'mt-0.5 size-5 shrink-0',
  // Short rule set under the glyph
  separator: 'ml-8 h-px w-10 bg-[var(--color-border)]',
  // Compact box under the sentence
  box: 'mt-1 flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-xs text-[var(--color-ink-muted)]',
  boxError: 'border-[var(--color-danger)] bg-[var(--color-danger-soft)]',
  line: 'flex min-w-0 flex-wrap items-baseline gap-x-1.5',
  lineLabel: 'font-bold uppercase text-[var(--color-ink-subtle)]',
  lineBefore: 'truncate text-[var(--color-ink-subtle)] line-through',
  lineAfter: 'truncate text-[var(--color-ink)]',
  errorMessage: 'line-clamp-1 break-words text-[var(--color-ink)]',
  more: 'text-[var(--color-ink-subtle)]',
  trace:
    'max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[var(--color-surface-sunken)] p-3 text-xs text-[var(--color-ink-muted)]',
  dialogBody: 'flex flex-col gap-3',
} as const

/**
 * Horizontal timeline styles
 * @type {Record<string, string>}
 */

export const HORIZONTAL_TIMELINE_STYLES = {
  row: 'flex items-start',
  step: 'flex flex-1 flex-col items-center gap-2 text-center last:flex-none',
  dot: 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
  dotDone:
    'border-[var(--color-brand-600)] bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  dotCurrent:
    'border-[var(--color-brand-600)] bg-[var(--color-surface-raised)] text-[var(--color-ink-accent)]',
  dotIdle:
    'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] text-[var(--color-ink-subtle)]',
  dotLate: 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  icon: 'h-4 w-4',
  connector: 'mt-4 h-0.5 flex-1',
  connectorDone: 'bg-[var(--color-brand-600)]',
  connectorIdle: 'bg-[var(--color-border)]',
  connectorLate: 'bg-[var(--color-danger)]',
  labelDone: 'text-[var(--color-ink)]',
  labelIdle: 'text-[var(--color-ink-subtle)]',
  label: 'max-w-24 text-xs font-medium',
} as const

/**
 * Admin journal styles
 * @type {Record<string, string>}
 */

export const JOURNAL_TABLE_STYLES = {
  filters: 'flex flex-wrap items-center gap-2',
  search: 'min-w-56 flex-1',
  select: 'w-48',
  list: 'flex flex-col',
  head: 'hidden grid-cols-[11rem_6rem_12rem_10rem_1fr] gap-3 border-b border-[var(--color-border)] px-4 py-2 text-xs font-bold uppercase text-[var(--color-ink-subtle)] lg:grid',
  row: 'border-b border-[var(--color-border)] last:border-b-0',
  summary:
    'grid cursor-pointer list-none grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 px-4 py-2.5 text-sm hover:bg-[var(--color-hover)] lg:grid-cols-[11rem_6rem_12rem_10rem_1fr]',
  moment: 'text-xs tabular-nums text-[var(--color-ink-subtle)]',
  cell: 'min-w-0 truncate text-[var(--color-ink)]',
  muted: 'min-w-0 truncate text-[var(--color-ink-subtle)]',
  detail:
    'flex flex-col gap-2 border-t border-dashed border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-4 py-3 text-xs',
  facts: 'grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1',
  factLabel: 'font-bold uppercase text-[var(--color-ink-subtle)]',
  factValue: 'min-w-0 break-words text-[var(--color-ink)]',
} as const

/**
 * Service history styles
 * @type {Record<string, string>}
 */

export const STATUS_HISTORY_STYLES = {
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  service: 'flex flex-col gap-2 py-3 first:pt-0 last:pb-0',
  head: 'flex flex-wrap items-center justify-between gap-2',
  name: 'text-sm font-medium',
  lead: 'text-xs text-[var(--color-ink-subtle)]',
  meta: 'flex items-center gap-3',
  mono: 'font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
  bars: 'flex h-7 gap-px',
  column: 'group/bar relative flex min-w-px flex-1',
  bar: 'w-full rounded-[2px] transition-opacity group-hover/bar:opacity-70',
  pop: 'invisible absolute bottom-[calc(100%+0.5rem)] z-[60] w-max max-w-64 rounded-[var(--radius-md)] border border-[var(--color-border)] glass-panel px-3.5 py-2.5 text-left opacity-0 shadow-[var(--shadow-md)] transition-[opacity,visibility] duration-[var(--motion-duration-fast)] group-hover/bar:visible group-hover/bar:opacity-100',
  popStart: 'left-0',
  popCenter: 'left-1/2 -translate-x-1/2',
  popEnd: 'right-0',
  popDay: 'text-sm font-semibold',
  popText: 'mt-1 text-xs text-[var(--color-ink-subtle)]',
  axis: 'flex items-center gap-3 text-xs text-[var(--color-ink-subtle)]',
  rule: 'h-px flex-1 bg-[var(--color-border-strong)]',
  incident: 'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2 text-sm',
  incidentWhen: 'text-xs tabular-nums text-[var(--color-ink-subtle)]',
} as const

/**
 * Colour of a day bar per health
 * @type {Record<'up' | 'minor' | 'degraded' | 'down' | 'outage' | 'none', string>}
 */

export const STATUS_BAR_COLOURS = {
  up: 'bg-[var(--color-success)]',
  minor: 'bg-[var(--color-status-minor)]',
  degraded: 'bg-[var(--color-status-degraded)]',
  down: 'bg-[var(--color-status-down)]',
  outage: 'bg-[var(--color-status-outage)]',
  none: 'bg-[var(--color-border-strong)]',
} as const

/**
 * Daily bars styles
 * @type {Record<string, string>}
 */

export const DAILY_BARS_STYLES = {
  chart: 'flex h-32 items-end gap-1',
  column: 'group relative flex h-full min-w-0 flex-1 items-end',
  bar: 'w-full rounded-t-[3px] bg-[var(--color-brand-500)] transition-colors group-hover:bg-[var(--color-brand-700)]',
  empty: 'w-full border-b border-dashed border-[var(--color-border-strong)]',
  axis: 'mt-1 flex justify-between text-xs tabular-nums text-[var(--color-ink-subtle)]',
  split: 'grid gap-6 md:grid-cols-2',
  share: 'flex items-center justify-between gap-3 py-2 text-sm',
  track: 'h-1.5 w-24 overflow-hidden rounded-full bg-[var(--color-surface-sunken)]',
  fill: 'h-full rounded-full bg-[var(--color-brand-500)]',
} as const

/**
 * Public status page styles
 * @type {Record<string, string>}
 */

export const PUBLIC_STATUS_STYLES = {
  page: 'mx-auto flex w-full max-w-3xl flex-col gap-6',
  // Alone on the screen, outside the app shell
  bare: 'px-4 pt-8 pb-10 sm:px-6 sm:pt-12',
  // In the app shell, takes back the room kept for a banner
  embedded: 'md:-mt-[calc(var(--banner-h)-0.5rem)]',
  brand: 'mb-4 flex items-center gap-3',
  logo: 'size-10 shrink-0 object-contain',
  brandName: 'text-section font-bold tracking-tight sm:text-page',
  version: 'ml-auto shrink-0 text-xs tabular-nums text-[var(--color-ink-subtle)]',
  banner:
    'mb-7 flex flex-col gap-1 rounded-[var(--radius-xl)] px-6 py-5 text-white dark:text-[var(--color-page)]',
  bannerTitle: 'text-section font-bold',
  bannerLead: 'text-sm opacity-90',
  card: 'rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-5',
  cardTitle: 'mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-subtle)]',
} as const

/**
 * Banner colour per overall health
 * @type {Record<'up' | 'degraded' | 'down', string>}
 */

export const PUBLIC_STATUS_BANNERS = {
  up: 'bg-[var(--color-success)]',
  degraded:
    'border-[var(--color-warning)] bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)]',
  down: 'bg-[var(--color-status-down)]',
} as const

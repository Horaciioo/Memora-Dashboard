import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Seal classes
 * @type {Record<string, string>}
 */

export const SEAL_BLOCK = {
  glyph:
    'h-6 w-24 shrink-0 text-[var(--color-ink-subtle)] transition-colors group-hover:text-[var(--color-ink-accent)]',
  chain: 'opacity-60 transition-opacity duration-[var(--motion-duration-panel)]',
  chainOpen: 'opacity-20',
  // Each half slides away from the lock once the shackle lets go
  chainSide: 'transition-transform duration-[var(--motion-duration-panel)]',
  chainSlackLeft: '-translate-x-[3px]',
  chainSlackRight: 'translate-x-[3px]',
  lock: 'transition-transform duration-[var(--motion-duration-panel)]',
  body: 'fill-[var(--color-surface-sunken)]',
  trigger:
    'glyph-danger group inline-flex items-center gap-1.5 text-left text-[var(--color-danger)] transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-60',
  icon: 'h-4 w-4 shrink-0',
  hint: 'text-sm font-medium',
  value: 'flex flex-wrap items-center gap-2',
  window:
    'inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-micro text-[var(--color-ink-subtle)]',
} as const

/**
 * Enrolment classes
 * @type {Record<string, string>}
 */

export const TWO_FACTOR_BLOCK = {
  layout: 'flex flex-col gap-5 sm:flex-row sm:items-start',
  qr: 'shrink-0 self-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-scan-ground)] p-3 [&>svg]:h-40 [&>svg]:w-40',
  aside: 'flex min-w-0 flex-1 flex-col gap-3',
  secret:
    'flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm tracking-wide break-all',
  codes: 'grid grid-cols-2 gap-1.5 sm:grid-cols-3',
  code: 'rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] px-2 py-1 text-center font-[family-name:var(--font-mono)] text-xs tracking-wide',
  codeSpent: 'line-through opacity-40',
  digits:
    'w-full rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3 py-2 text-center font-[family-name:var(--font-mono)] text-lg tracking-wide text-[var(--color-on-field)] transition-colors hover:border-[var(--color-field-border-strong)]',
  panel: 'flex flex-col gap-4',
  field: 'flex flex-col gap-1.5',
  fieldLabel: PROPERTY_LABEL,
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  heading: 'text-xs font-semibold',
  note: 'text-xs text-[var(--color-ink-subtle)]',
  error: 'text-xs text-[var(--color-danger)]',
  footer: 'flex justify-end gap-2',
} as const

/**
 * Console classes
 * @type {Record<string, string>}
 */

export const CONSOLE_BLOCK = {
  banner:
    'flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--view)]/35 bg-[var(--view)]/8 px-4 py-3',
  bannerGlyph:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--view)]/15 text-[var(--view)]',
  bannerIcon: 'h-4 w-4',
  bannerBody: 'flex min-w-0 flex-1 flex-col',
  bannerTitle: 'text-sm font-semibold text-[var(--color-ink)]',
  bannerLead: 'text-xs text-[var(--color-ink-subtle)]',
  grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
  tile: 'flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4',
  tileLabel: 'text-xs font-medium tracking-wide text-[var(--color-ink-subtle)] uppercase',
  tileValue: 'font-[family-name:var(--font-display)] text-2xl leading-none',
  tileMax: 'font-sans text-sm text-[var(--color-ink-subtle)]',
  tileHint: 'text-xs text-[var(--color-ink-subtle)]',
  rows: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0',
  rowLabel: 'flex min-w-0 items-center gap-2 text-sm font-medium',
  rowIcon: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  rowMeta: 'font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
  rowStatus: 'flex flex-wrap items-center gap-2',
  cardHead: 'flex flex-wrap items-center gap-2',
  cardIcon: 'h-4 w-4 shrink-0 text-[var(--color-ink-accent)]',
  cardTitle: 'font-bold',
  cardLead: 'text-sm text-[var(--color-ink-subtle)]',
  chooser: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
  choice:
    'flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 text-left transition-colors hover:border-[var(--view)] hover:bg-[var(--color-surface)]',
  choiceActive: 'border-[var(--view)] bg-[var(--view)]/8',
  choiceName: 'truncate text-sm font-semibold',
  choiceMeta: 'truncate text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Access console classes — a rail of roles that collapses into a three-tab panel
 * @type {Record<string, string>}
 */

export const ACCESS_CONSOLE = {
  shell: 'flex flex-col gap-6 lg:flex-row lg:items-start',
  rail: 'flex flex-col gap-5 lg:w-72 lg:shrink-0',
  railHidden: 'hidden lg:flex',
  category: 'flex flex-col gap-1',
  categoryHead:
    'flex items-center gap-2 px-1 pb-1 text-micro font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  row: 'group flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-sm transition-colors hover:bg-[var(--color-hover)]',
  rowActive: 'bg-[var(--color-hover)] font-medium',
  rowLocked: 'opacity-60',
  rowIcon: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  rowLabel: 'min-w-0 flex-1 truncate',
  rowCount: 'shrink-0 text-xs tabular-nums text-[var(--color-ink-subtle)]',
  add: 'mt-1 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  addIcon: 'h-3.5 w-3.5',
  detail: 'min-w-0 flex-1',
  back: 'mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)] lg:hidden',
  toggle:
    'inline-flex items-center gap-1 text-sm text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  backIcon: 'h-4 w-4',
  detailHead: 'flex flex-wrap items-center gap-3 pb-8',
  detailActions: 'ms-auto flex shrink-0 items-center gap-2',
  detailDot: 'h-3 w-3 shrink-0 rounded-full',
  detailIcon: 'h-5 w-5 shrink-0 text-[var(--color-ink-subtle)]',
  detailName: 'text-lg font-bold',
  detailKind: 'text-xs text-[var(--color-ink-subtle)]',
  prompt:
    'rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] px-4 py-12 text-center text-sm text-[var(--color-ink-subtle)]',
  form: 'flex max-w-lg flex-col gap-4',
  members: 'flex flex-col gap-1',
  memberRow: 'flex items-center gap-1',
  simulation: 'flex max-h-[60dvh] flex-col gap-4 overflow-y-auto',
  simulationSection: 'flex flex-col gap-2',
  simulationTitle: 'text-sm font-bold',
  simulationTags: 'flex flex-wrap gap-1.5',
  layerBar: 'pb-4',
  member:
    'flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-md)] px-2 py-1.5 transition-colors hover:bg-[var(--color-hover)]',
  memberName: 'min-w-0 flex-1 truncate text-sm',
  memberRole: 'shrink-0 text-xs text-[var(--color-ink-subtle)]',
  perimeter: 'flex flex-col gap-3',
  creator:
    'flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4',
  creatorHead: 'flex items-center gap-3',
  creatorName: 'min-w-0 flex-1 truncate text-sm font-semibold',
  creatorMeta: 'shrink-0 text-xs tabular-nums text-[var(--color-ink-subtle)]',
} as const

/**
 * Release notes classes
 * @type {Record<string, string>}
 */

export const CHANGELOG_BOARD = {
  page: 'max-w-4xl',
  // Version and day, read under the banner title
  meta: 'flex flex-wrap items-baseline gap-x-3',
  version: 'text-xs font-bold tracking-wide uppercase tabular-nums',
  date: 'text-xs font-semibold',
  // Build in use, closing the page
  running:
    'text-center font-[family-name:var(--font-mono)] text-micro tracking-wide text-[var(--color-ink-subtle)] uppercase',
  // Description box: lead, why, then one figure per category
  lead: 'text-lg font-semibold tracking-tight sm:text-xl',
  description: 'text-body leading-relaxed text-[var(--color-ink-subtle)]',
  descriptionBody: 'flex flex-col gap-4',
  rule: 'h-px w-full bg-[var(--color-border)]',
  figures: 'grid auto-cols-fr grid-flow-col divide-x divide-[var(--color-border)]',
  figure: 'flex min-w-0 flex-col items-center gap-1 px-2 text-center',
  figureValue: 'text-3xl leading-none font-bold tabular-nums',
  figureLabel: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  blocks: 'flex flex-col gap-10',
  // Pages of a category inside its card, apart by a hairline
  groups: 'divide-y divide-[var(--color-border)]',
  group: 'flex flex-col gap-2.5 py-5 first:pt-0 last:pb-0',
  groupTitle: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  comment:
    'border-l-2 border-[var(--color-border-strong)] pl-3.5 text-sm leading-relaxed text-[var(--color-ink-subtle)] italic',
  commentLabel: 'sr-only',
  lines: 'flex flex-col gap-1.5',
  line: 'flex gap-3 text-body leading-relaxed',
  lineDot: 'mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full',
  archive: 'flex flex-wrap justify-center gap-2',
  archiveHead: 'flex flex-col items-center gap-4 text-center',
  archiveTitle: 'text-xl font-bold tracking-tight',
  monthList: 'flex flex-col gap-1',
  releaseRow: 'flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2',
  releaseRowLink:
    'flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 transition-colors hover:bg-[var(--color-hover)]',
  releaseBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  releaseTitle: 'truncate text-sm font-semibold',
  releaseMeta: 'text-micro font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  releaseCurrent:
    'shrink-0 text-micro font-bold tracking-wide text-[var(--color-ink-accent)] uppercase',
  releaseChevron: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  empty: 'flex flex-col items-center gap-1 py-16 text-center',
  emptyTitle: 'text-base font-semibold',
  emptyLead: 'text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Release notice classes
 * @type {Record<string, string>}
 */

export const RELEASE_NOTICE = {
  wrap: 'relative',
  // Room above for the point, flush with the shortcut row
  wrapPointed: 'mx-4 pt-3 pb-1',
  // The ^ aimed at the shortcut box
  caret:
    'pointer-events-none absolute top-1.5 h-3 w-3 rotate-45 rounded-sm bg-[var(--color-gold-100)]',
  // Gradient plate
  frame:
    'group/news rail-reset relative z-10 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-gold-100)] via-[var(--color-gold-300)] to-[var(--color-gold-400)] text-black shadow-[var(--shadow-md)] ring-1 ring-white/40 ring-inset transition-shadow hover:shadow-[var(--shadow-lg)]',
  // Light veil from the top left
  veil: 'pointer-events-none absolute inset-0 bg-linear-to-br from-[var(--color-surface)]/50 via-[var(--color-surface)]/10 to-transparent',
  link: 'relative block p-3.5 pr-10',
  sheen:
    'pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-[var(--color-surface)]/55 to-transparent transition-[left] duration-[var(--motion-duration-celebrate)] ease-out group-hover/news:left-full motion-reduce:transition-none',
  kicker:
    'relative block font-[family-name:var(--font-mono)] text-micro font-bold tracking-wide text-black/70 uppercase',
  title: 'relative mt-1.5 line-clamp-2 block text-lg leading-tight font-bold tracking-tight',
  cta: 'relative mt-3 inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-micro font-bold text-[var(--color-gold-100)]',
  ctaIcon: 'h-3 w-3',
  dismiss:
    'absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full text-black/55 transition-colors hover:bg-white/35 hover:text-black',
  dismissIcon: 'h-3.5 w-3.5',
} as const

/**
 * Glyph-led rows of the security tab
 * @type {Record<string, string>}
 */

export const SECURITY_LIST = {
  list: '-my-1 divide-y divide-[var(--color-border-strong)]',
  row: 'flex items-center gap-3.5 py-3',
  glyph: 'h-9 w-9 shrink-0',
  body: 'min-w-0 flex-1 space-y-0.5',
  title: 'flex flex-wrap items-center gap-2 text-sm font-bold tracking-tight',
  current: 'text-xs font-semibold text-[var(--color-success)]',
  meta: 'flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--color-ink-subtle)]',
  link: 'w-fit max-w-full truncate text-[11px] italic hover:underline',
  actions: 'flex shrink-0 items-center gap-2',
  time: 'shrink-0 text-xs text-[var(--color-ink-subtle)] tabular-nums',
  status: 'inline-flex items-center gap-1.5 text-xs font-semibold',
  on: 'text-[var(--color-success)]',
  off: 'glyph-danger text-[var(--color-danger)]',
  statusGlyph: 'h-4 w-4 shrink-0',
  footer:
    'mt-3 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4 sm:flex-row *:flex-1',
} as const

/**
 * Creator channel cards, side by side
 * @type {Record<string, string>}
 */

export const CHANNEL_BLOCK = {
  list: 'flex flex-wrap gap-3',
  card: 'flex min-h-16 min-w-56 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3',
  glyph: 'h-9 w-9 shrink-0',
  body: 'min-w-0 space-y-0.5',
  name: 'text-sm font-bold tracking-tight',
  link: 'block truncate text-xs text-[var(--color-ink-subtle)] hover:underline',
  empty: 'text-sm italic text-[var(--color-ink-subtle)]',
} as const

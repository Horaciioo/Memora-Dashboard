/**
 * Rows, notes and previews inside a settings group
 * @type {Record<string, string>}
 */

export const SETTINGS_GROUP = {
  tile: 'flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--gradient-soft)] text-[var(--color-ink)]',
  tileGlyph: 'size-5',
  text: 'flex min-w-0 flex-1 basis-56 flex-col gap-0.5',
  name: 'text-sm font-semibold',
  description: 'text-xs leading-snug text-[var(--color-ink-subtle)]',
  control: 'shrink-0',
  footer: 'flex flex-wrap items-center justify-between gap-3 pt-2',
  // Preview of a cards setting: a frame, a card, a box
  previewFrame:
    'h-10 w-full rounded-[var(--radius-md)] bg-[image:var(--gradient-page)] border border-[var(--color-border)]',
  previewRadius:
    'h-10 w-full rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]',
  previewGround:
    'flex h-10 w-full items-center justify-center rounded-[var(--radius-md)] bg-[image:var(--gradient-soft)] p-1.5',
  previewCard: 'h-full w-3/4 rounded-[var(--radius-sm)] border border-[var(--color-border)]',
} as const

/**
 * Protection score and its checklist
 * @type {Record<string, string>}
 */

export const SECURITY_SCORE = {
  root: 'flex flex-col gap-6 sm:flex-row sm:items-center',
  ring: 'relative size-32 shrink-0 self-center',
  ringSvg: 'size-full -rotate-90',
  ringTrack: 'stroke-[var(--color-border-strong)]',
  ringValue: 'stroke-[var(--color-success)] transition-[stroke-dashoffset]',
  ringWarn: 'stroke-[var(--color-warning)]',
  ringLabel: 'absolute inset-0 flex flex-col items-center justify-center text-center',
  ringNumber: 'text-page leading-none font-bold tabular-nums',
  ringOf: 'text-micro text-[var(--color-ink-subtle)]',
  list: 'flex min-w-0 flex-1 flex-col divide-y divide-[var(--color-border)]',
  item: 'flex items-start gap-3 py-3 first:pt-0 last:pb-0',
  mark: 'mt-0.5 size-5 shrink-0',
  markOk: 'text-[var(--color-success)]',
  markWarn: 'text-[var(--color-warning)]',
  title: 'text-sm font-semibold',
  lead: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Open sessions list
 * @type {Record<string, string>}
 */

export const SESSION_LIST = {
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-wrap items-center gap-3.5 py-3 first:pt-0 last:pb-0',
  glyph: 'size-9 shrink-0 text-[var(--color-ink-subtle)]',
  body: 'flex min-w-0 flex-1 basis-48 flex-col gap-0.5',
  title: 'flex flex-wrap items-center gap-2 text-sm font-semibold',
  current: 'text-xs font-semibold text-[var(--color-success)]',
  meta: 'text-xs text-[var(--color-ink-subtle)]',
  footer:
    'mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4',
} as const

/**
 * Short list of habits or kept data
 * @type {Record<string, string>}
 */

export const SETTINGS_TIPS = {
  list: 'flex flex-col gap-2.5',
  item: 'flex items-start gap-2.5 text-sm',
  mark: 'mt-0.5 size-4 shrink-0 text-[var(--color-success)]',
} as const

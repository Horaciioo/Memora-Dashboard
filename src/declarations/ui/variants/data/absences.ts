/**
 * Own absence page: a composer on top
 * @type {Record<string, string>}
 */

export const ABSENCE_PAGE = {
  page: 'mx-auto flex w-full max-w-5xl flex-col gap-14',
  months: 'flex flex-col',
  month: 'flex flex-col gap-3',
  monthHead: 'flex h-8 items-center justify-between',
  monthName: 'text-base font-bold capitalize',
  monthNav:
    'flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  grid: 'grid grid-cols-7 gap-y-0.5',
  weekday:
    'pb-2 text-center text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  day: 'relative flex h-14 w-full items-center justify-center text-xl font-bold tabular-nums transition-colors',
  dayCompact:
    'relative flex h-9 w-full items-center justify-center text-sm font-bold tabular-nums transition-colors',
  dayFree: 'cursor-pointer rounded-[var(--radius-md)] hover:bg-[var(--color-hover)]',
  dayPast: 'cursor-not-allowed text-[var(--color-ink-subtle)]/50',
  dayToday: 'rounded-[var(--radius-md)] ring-2 ring-[var(--color-ink)] ring-inset',
  dayBooked:
    'cursor-not-allowed text-[var(--color-ink-subtle)] bg-[repeating-linear-gradient(135deg,transparent_0_5px,var(--color-border)_5px_6px)]',
  dayRange: 'bg-[var(--color-brand-100)] text-[var(--color-ink)]',
  dayPreview: 'bg-[var(--color-brand-50)]',
  dayEdge:
    'cursor-pointer rounded-[var(--radius-md)] bg-[var(--color-brand-300)] text-[var(--color-ink)] hover:bg-[var(--color-brand-400)]',
  list: 'flex flex-col',
  listTitle: 'mb-2 text-micro font-bold tracking-wide uppercase',
  row: 'grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-t border-[var(--color-border)] px-1 py-4 md:grid-cols-[13rem_5.5rem_minmax(0,1fr)_11rem]',
  rowDates: 'text-base font-bold',
  rowDuration: 'text-sm text-[var(--color-ink-subtle)]',
  rowReason: 'col-span-2 min-w-0 md:col-span-1',
  reply:
    'col-span-full mt-1 flex flex-col gap-0.5 rounded-[var(--radius-md)] bg-[var(--color-brand-50)] px-3 py-2 text-sm',
  replyFrom: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  rowStatus:
    'col-start-2 row-start-1 flex items-center justify-end gap-2 text-sm font-semibold md:col-start-auto md:row-start-auto',
  statusIcon: 'h-4 w-4',
  statusDone: 'text-[var(--color-success)]',
  statusClosed: 'text-[var(--color-danger)]',
  statusWaiting: 'text-[var(--color-warning)]',
  cancel:
    'whitespace-nowrap text-sm font-semibold text-[var(--color-ink-subtle)] underline-offset-4 transition-colors hover:text-[var(--color-ink)] hover:underline',
} as const

/**
 * Absence declaration styles: a vertical timeline on the left
 * @type {Record<string, string>}
 */

export const ABSENCE_WIZARD = {
  root: 'surface-enter grid grid-cols-1 gap-5 md:grid-cols-[2rem_minmax(0,1fr)] md:gap-7',
  // Bare chips and dashed runs
  timeline: 'relative flex items-start justify-between gap-2 md:block',
  step: 'relative flex items-center md:absolute md:top-[var(--step-top)] md:left-0 md:-translate-y-1/2',
  // Dashed run between two chips
  rail: 'absolute left-4 hidden w-0 -translate-x-1/2 border-l-2 border-dashed border-[var(--color-border-strong)] transition-colors md:block',
  railDone: 'border-[var(--color-success)]',
  chip: 'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-colors',
  chipCurrent: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  // The check glyph paints itself in the success tones
  chipDone: 'bg-[var(--color-success-soft)] ring-2 ring-[var(--color-success)] ring-inset',
  chipTodo:
    'border border-dashed border-[var(--color-border-strong)] text-[var(--color-ink-subtle)]',
  chipGlyph: 'h-5 w-5',
  // Box of the step
  stageBox:
    'relative flex min-h-[42rem] flex-col justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-6 sm:p-8',
  tail: 'bubble-tail hidden md:block',
  stage: 'course-pop flex min-w-0 flex-col gap-6',
  stageTitle: 'text-2xl font-bold tracking-tight sm:text-3xl',
  hint: 'mt-1.5 text-body text-[var(--color-ink-subtle)]',
  // Divider under the calendar
  summary: 'min-h-24 border-t border-[var(--color-border)] pt-6 text-center',
  sentence: 'text-xl font-bold tracking-tight text-balance',
  duration: 'mt-1 text-[var(--color-ink-subtle)]',
  warning: 'mt-1 text-sm font-semibold text-[var(--color-warning)]',
  placeholder: 'placeholder:italic placeholder:opacity-70',
  actions: 'flex flex-wrap items-center justify-center gap-3 pt-2',
  success: 'flex flex-col items-center gap-4 py-4 text-center',
  successGlyph: 'course-check h-20 w-20 text-[var(--color-success)]',
  thanks: 'text-2xl font-bold tracking-tight sm:text-3xl',
  reasonBlock: 'flex w-full max-w-md flex-col gap-2 text-left',
  reasonLabel: 'text-micro font-bold tracking-wide uppercase',
  reasonBox:
    'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-body leading-relaxed break-words whitespace-pre-wrap',
} as const

/**
 * Reason of an absence, quoted in a small box
 * @type {Record<string, string>}
 */

export const ABSENCE_REASON = {
  box: 'inline-block max-w-full rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-2 py-0.5 text-xs italic',
  filled: 'text-[var(--color-ink)]',
  empty: 'text-[var(--color-ink-subtle)]',
} as const

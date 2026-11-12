/**
 * Public Deban. screens, confirmation, follow-up and review
 * @type {Record<string, string>}
 */

export const UNBAN_PUBLIC_STYLES = {
  stack: 'flex flex-col gap-6',
  center: 'flex flex-col items-center gap-3 text-center',
  title: 'text-xl font-bold tracking-tight sm:text-2xl',
  // The state of the request, large
  statusBig: 'flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl',
  statusIcon: 'size-7 shrink-0',
  meta: 'flex flex-col gap-1 text-sm text-[var(--color-ink-subtle)]',
  reference: 'font-[family-name:var(--font-mono)] text-lg font-semibold tracking-wide',
  // Decision and answer of the team, set apart
  decision:
    'flex flex-col gap-2 rounded-[var(--radius-lg)] border-l-2 border-[var(--color-brand-600)] bg-[var(--color-brand-soft)] px-5 py-4',
  decisionText: 'text-sm leading-relaxed whitespace-pre-wrap',
  section: 'flex flex-col gap-3',
  sectionHead: 'flex items-center justify-between gap-3',
  label:
    'font-[family-name:var(--font-mono)] text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  answer: 'flex flex-col gap-1',
  answerText: 'text-sm whitespace-pre-wrap',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
  confirm: 'flex items-start gap-3 text-sm',
  error: 'text-sm text-[var(--color-danger)]',
  // Off screen, only a robot meets it
  trap: 'absolute -left-[9999px] size-px overflow-hidden',
} as const

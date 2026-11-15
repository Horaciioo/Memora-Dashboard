/**
 * Mail console: catalogue cards and previews
 * @type {Record<string, string>}
 */

export const MAIL_STYLES = {
  stack: 'flex flex-col gap-6',
  status: 'text-sm text-[var(--color-ink-subtle)]',
  card: 'flex flex-col gap-3 border-b border-[var(--color-border)] pb-6 last:border-b-0 last:pb-0',
  head: 'flex flex-col gap-1',
  title: 'text-base font-semibold',
  meta: 'text-sm text-[var(--color-ink-subtle)]',
  subject: 'text-sm',
  frame: 'h-[460px] w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white',
  send: 'flex flex-col gap-2 sm:flex-row sm:items-end',
  sendField: 'flex min-w-0 flex-1 flex-col gap-1',
  sendLabel: 'text-xs font-bold uppercase text-[var(--color-ink-subtle)]',
  muted: 'text-[var(--color-ink-subtle)] italic',
} as const

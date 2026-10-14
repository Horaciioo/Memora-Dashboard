/**
 * Thread of remarks
 * @type {Record<string, string>}
 */

export const COMMENT_THREAD = {
  comment: 'flex flex-col gap-1.5 border-b border-[var(--color-border)] py-3 last:border-b-0',
  meta: 'text-xs text-[var(--color-ink-subtle)]',
  body: 'text-sm whitespace-pre-wrap',
  mention:
    'rounded-[var(--radius-sm)] bg-[var(--color-info-soft)] px-1 py-0.5 font-semibold text-[var(--color-info)]',
} as const

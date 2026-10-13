/**
 * Timeline groups of a session
 * @type {Record<string, string>}
 */

export const SESSION_CARD = {
  group:
    'flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 first:border-t-0 first:pt-0',
  groupHead: 'flex cursor-pointer items-center gap-3',
  groupTitle: 'text-sm font-bold tracking-wide uppercase',
} as const

/**
 * Candidate cards of a session
 * @type {Record<string, string>}
 */

export const CANDIDATE_CARD = {
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  name: 'truncate font-bold tracking-tight',
  meta: 'truncate text-xs text-[var(--color-ink-subtle)]',
  metaEmpty: 'truncate pr-[0.2em] text-xs text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Glossary
 * @type {Record<string, string>}
 */

export const GLOSSARY_STYLES = {
  page: 'mx-auto flex w-full max-w-4xl flex-col gap-6',
  search: 'h-12 text-base',
  list: 'flex flex-col divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface shadow-[var(--shadow-sm)]',
  row: 'grid grid-cols-1 gap-1 px-6 py-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6',
  term: 'font-bold tracking-tight',
  definition: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  empty: 'py-10 text-center text-sm text-[var(--color-ink-subtle)] italic',
} as const

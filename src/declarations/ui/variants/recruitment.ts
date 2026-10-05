/**
 * Recruitment session cards
 * @type {Record<string, string>}
 */

export const SESSION_CARD = {
  grid: 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3',
  card: 'group flex cursor-pointer flex-col gap-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-5 text-left shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-[var(--motion-duration-moderate)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  muted: 'bg-[var(--color-surface)]',
  head: 'flex items-start gap-4',
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  title: 'truncate text-base font-bold tracking-tight',
  meta: 'truncate text-sm text-[var(--color-ink-subtle)]',
  foot: 'mt-auto flex items-center justify-between gap-3',
  track: 'h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-sunken)]',
  fill: 'h-full rounded-full bg-[var(--color-brand-600)]',
  date: 'text-xs font-semibold text-[var(--color-ink-subtle)]',
  metaPending: 'truncate text-sm text-[var(--color-caution)] italic',
  group:
    'flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-5 shadow-[var(--shadow-sm)]',
  groupHead: 'flex cursor-pointer items-center gap-3',
  groupTitle: 'text-sm font-bold tracking-wide uppercase',
} as const

/**
 * Header card of one session file
 * @type {Record<string, string>}
 */

export const SESSION_HERO = {
  card: 'flex flex-col gap-6 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface shadow-[var(--shadow-sm)]',
  body: 'flex flex-wrap items-center gap-x-6 gap-y-4 p-6',
  portrait: 'ring-4 ring-[var(--color-surface-raised)]',
  facts: 'flex min-w-0 flex-1 flex-col gap-1.5',
  title: 'text-2xl font-bold tracking-tight sm:text-3xl',
  meta: 'flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[var(--color-ink-subtle)]',
  aside: 'flex shrink-0 items-center gap-4',
  funnel: 'flex h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-sunken)]',
  funnelPart: 'h-full',
  funnelWrap: 'flex flex-col gap-2 px-6 pb-6',
  legend: 'flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Candidate cards of a session
 * @type {Record<string, string>}
 */

export const CANDIDATE_CARD = {
  grid: 'grid gap-3 sm:grid-cols-2',
  card: 'flex cursor-pointer items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 text-left shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  name: 'truncate font-bold tracking-tight',
  meta: 'truncate text-xs text-[var(--color-ink-subtle)]',
  metaEmpty: 'truncate text-xs text-[var(--color-ink-subtle)] italic',
  aside: 'flex shrink-0 flex-col items-end gap-1',
} as const

/**
 * Glossary
 * @type {Record<string, string>}
 */

export const GLOSSARY_STYLES = {
  page: 'mx-auto flex w-full max-w-4xl flex-col gap-6',
  search: 'h-12 text-base',
  list: 'flex flex-col divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface shadow-[var(--shadow-sm)]',
  row: 'grid gap-1 px-6 py-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6',
  term: 'font-bold tracking-tight',
  definition: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  empty: 'py-10 text-center text-sm text-[var(--color-ink-subtle)] italic',
} as const

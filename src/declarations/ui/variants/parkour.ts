import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * What a current step of the PIM journey shows beside its gestures
 * @type {Record<string, string>}
 */

export const PARKOUR_STEP = {
  actions: 'flex flex-wrap items-center gap-2 pt-1',
  lives: 'flex flex-col gap-1.5',
  livesValue: 'text-sm font-bold tabular-nums',
  link: 'flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-3 py-2 font-mono text-xs break-all',
  hint: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Value erased with a member's personal data
 * @type {Record<string, string>}
 */

export const ERASED_VALUE = {
  text: 'cursor-help font-semibold text-[var(--color-danger)]',
} as const

/**
 * Departure announcement task on the home
 * @type {Record<string, string>}
 */

export const DEPARTURE_TASK = {
  body: 'rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-3 py-2 font-mono text-xs whitespace-pre-wrap',
  actions: 'flex flex-wrap items-center gap-2',
} as const

/**
 * Lives a junior accompanied
 * @type {Record<string, string>}
 */

export const ACCOMPANIED_LIVES = {
  root: 'flex flex-col gap-2',
  label: PROPERTY_LABEL,
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
  glyph: 'h-5 w-5 shrink-0',
  body: 'flex min-w-0 flex-1 flex-col',
  creator: 'text-sm font-bold',
  title: 'truncate text-xs text-[var(--color-ink-subtle)]',
  date: 'shrink-0 text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Compact rows of the courses a junior finished
 * @type {Record<string, string>}
 */

export const DONE_COURSES = {
  root: 'flex flex-col gap-2',
  photo: 'relative size-10 shrink-0 overflow-hidden rounded-[var(--radius-md)]',
  image: 'size-full object-cover',
  body: 'flex min-w-0 flex-1 flex-col',
  name: 'truncate text-sm font-bold',
  meta: 'truncate text-xs text-[var(--color-ink-subtle)]',
  check: 'size-5 shrink-0 text-[var(--color-success)]',
} as const

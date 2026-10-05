import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * AcademicParkour panel on a junior's file
 * @type {Record<string, string>}
 */

export const PARKOUR_PANEL = {
  root: 'flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-sm)]',
  head: 'flex flex-wrap items-center gap-3',
  title: 'flex min-w-0 flex-col gap-1',
  eyebrow: PROPERTY_LABEL,
  phase: 'flex items-center gap-2 text-lg font-bold tracking-tight',
  glyph: 'h-5 w-5 shrink-0',
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  lives: 'ml-auto flex flex-col items-end gap-0.5',
  livesValue: 'text-2xl font-bold tabular-nums',
  link: 'flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-3 py-2 font-mono text-xs break-all',
  actions: 'flex flex-wrap items-center gap-2',
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
 * One-time bubble of the parkour on the trainings page
 * @type {Record<string, string>}
 */

export const PARKOUR_BUBBLE = {
  root: 'surface-enter flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--color-brand-300)] bg-[var(--color-brand-100)] p-5 shadow-[var(--shadow-md)] sm:flex-row sm:items-center',
  glyph: 'h-10 w-10 shrink-0 text-[var(--color-brand-600)]',
  body: 'flex min-w-0 flex-1 flex-col gap-1',
  title: 'text-lg font-bold tracking-tight',
  text: 'text-sm text-[var(--color-ink-subtle)]',
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

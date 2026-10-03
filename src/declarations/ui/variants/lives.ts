import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Livecon page, one strip per open live
 * @type {Record<string, string>}
 */

export const LIVE_BOARD = {
  wrapper: 'mx-auto flex w-full max-w-5xl flex-col gap-10',
  toolbar: 'flex flex-wrap items-center justify-center gap-3',
  list: 'flex flex-col gap-6',
  // Raised strip, the platform colour a rule down the left edge
  strip:
    'relative flex flex-col gap-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 pl-8 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center',
  stripLive: 'border-[var(--color-danger)] shadow-[var(--shadow-md)]',
  rule: 'absolute inset-y-0 left-0 w-1.5',
  ruleTwitch: 'bg-[var(--color-twitch)]',
  ruleYoutube: 'bg-[var(--color-youtube)]',
  head: 'flex min-w-0 flex-1 items-center gap-5',
  platform: 'h-14 w-14 shrink-0',
  identity: 'flex min-w-0 flex-col gap-1',
  creator: 'text-3xl font-black tracking-tight sm:text-4xl',
  title: 'truncate text-sm text-[var(--color-ink-subtle)]',
  status: 'flex items-center gap-2 text-xs font-black tracking-wide uppercase',
  statusLive: 'text-[var(--color-danger)]',
  statusAnnounced: 'text-[var(--color-ink-subtle)]',
  dot: 'h-3.5 w-3.5',
  dotPulse: 'live-pulse h-3.5 w-3.5',
  facts: 'grid grid-cols-2 gap-x-8 gap-y-3 sm:w-80 sm:shrink-0',
  fact: 'flex min-w-0 flex-col gap-1',
  factLabel: PROPERTY_LABEL,
  factValue: 'flex min-w-0 items-center gap-2 truncate text-sm font-semibold',
  factEmpty: 'text-sm text-[var(--color-ink-subtle)] italic',
  factGlyph: 'h-4 w-4 shrink-0',
  actions: 'flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch',
  confirm: 'flex flex-col gap-2 text-xs text-[var(--color-ink-subtle)] sm:max-w-48',
} as const

/**
 * Live entry on the rail
 * @type {Record<string, string>}
 */

export const LIVE_NAV = {
  dotPulse: 'live-pulse',
  labelLive: 'font-black text-[var(--color-danger)]',
} as const

/**
 * Urgent live call on the home
 * @type {Record<string, string>}
 */

export const LIVE_URGENT = {
  section: 'flex flex-col gap-3',
  label: PROPERTY_LABEL,
  list: 'flex flex-col gap-2',
  row: 'flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-danger)] glass-surface px-4 py-3 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-600)]',
  rowAnnounced: 'border-[var(--color-border)]',
  dot: 'h-7 w-7 shrink-0',
  text: 'min-w-0 flex-1 truncate font-bold tracking-tight',
  go: 'shrink-0 text-sm font-black text-[var(--color-danger)]',
} as const

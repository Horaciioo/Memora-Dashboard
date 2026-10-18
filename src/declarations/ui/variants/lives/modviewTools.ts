import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Tabs of the AutoMod window
 * @type {Record<string, string>}
 */

export const MODVIEW_TABS = {
  list: 'flex min-w-0 flex-1 items-center gap-0.5',
  tab: 'flex min-w-0 items-center gap-1.5 rounded-[var(--radius-md)] px-2 py-1 text-xs font-bold tracking-tight text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  // Keeps its words whole when the window narrows
  tabFixed: 'shrink-0',
  tabOn: 'bg-[var(--color-hover)] text-[var(--color-ink)]',
  tabLabel: 'truncate',
  badge:
    'min-w-5 shrink-0 rounded-full bg-[var(--color-danger)] px-1.5 text-center text-micro font-bold text-[var(--color-on-solid)] tabular-nums',
} as const

/**
 * Surveillance view
 * @type {Record<string, string>}
 */

export const MODVIEW_WATCH = {
  chips: 'flex flex-wrap gap-1.5 border-b border-[var(--color-border)] px-3 py-2',
  chip: 'inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] py-0.5 pr-1 pl-2.5 text-xs font-bold',
  chipClose:
    'flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  chipIcon: 'h-2.5 w-2.5',
  lines: 'flex flex-col py-1',
  line: 'px-3 py-1 text-sm leading-relaxed break-words hover:bg-[var(--color-hover)]',
  time: 'mr-1.5 font-[family-name:var(--font-mono)] text-micro text-[var(--color-ink-subtle)]',
  name: 'cursor-pointer font-bold hover:underline',
  silent: 'px-3 py-2 text-xs text-[var(--color-ink-subtle)] italic',
  tools: 'ml-2 inline-flex items-center gap-0.5 align-middle',
  tool: 'inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-35',
  toolIcon: 'h-4 w-4',
} as const

/**
 * Suggestion window
 * @type {Record<string, string>}
 */

export const MODVIEW_SUGGEST = {
  list: 'flex flex-col gap-2',
  card: 'flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3',
  head: 'flex items-baseline justify-between gap-2',
  who: 'min-w-0 truncate font-bold tracking-tight hover:underline',
  from: PROPERTY_LABEL,
  meta: 'text-xs text-[var(--color-ink-subtle)]',
  offense: 'flex flex-wrap items-center gap-x-2 text-sm font-semibold',
  step: 'text-xs font-bold text-[var(--color-ink-accent)]',
  quote:
    'rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-2 py-1 text-xs break-words',
  command:
    'rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] px-2.5 py-2 font-[family-name:var(--font-mono)] text-xs break-words select-all',
  none: 'text-xs text-[var(--color-ink-subtle)] italic',
  actions: 'flex flex-wrap gap-2',
} as const

/**
 * Viewer dossier in the viewer card
 * @type {Record<string, string>}
 */

export const MODVIEW_DOSSIER = {
  root: 'flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3',
  head: 'flex items-center justify-between gap-2',
  label: PROPERTY_LABEL,
  note: 'text-xs text-[var(--color-ink-subtle)]',
  ladder: 'flex flex-col gap-1.5',
  ladderName: 'flex items-baseline justify-between gap-2 text-sm font-semibold',
  ladderStep: 'text-xs font-bold text-[var(--color-ink-accent)]',
  dots: 'flex gap-1',
  dot: 'h-2 flex-1 rounded-full bg-[var(--color-border)]',
  dotOn: 'bg-[var(--color-danger)]',
  dotNext: 'bg-[var(--color-brand-400)]',
  next: 'text-xs text-[var(--color-ink-subtle)]',
  history: 'flex flex-col gap-1',
  line: 'text-xs text-[var(--color-ink-subtle)]',
  empty: 'text-xs text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Team window
 * @type {Record<string, string>}
 */

export const MODVIEW_TEAM = {
  list: 'flex flex-col p-2',
  member:
    'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors hover:bg-[var(--color-hover)]',
  memberFocus: 'bg-[var(--color-brand-100)] ring-2 ring-[var(--color-pick)]',
  name: 'min-w-0 flex-1 truncate text-sm font-semibold',
  tag: 'shrink-0 text-xs font-bold text-[var(--color-ink-accent)]',
  focus: 'px-3 py-1.5 text-xs font-semibold text-[var(--color-ink-accent)]',
  hint: 'px-3 pb-2 text-xs text-[var(--color-ink-subtle)]',
} as const

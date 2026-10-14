import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Task list of the home page
 * @type {Record<string, string>}
 */

export const TASK_LIST = {
  row: 'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--color-surface)] focus-visible:bg-[var(--color-surface)] focus-visible:outline-none',
  mark: 'h-5 w-5 shrink-0',
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  title: 'font-semibold',
  meta: 'text-xs text-[var(--color-ink-subtle)]',
  chevron: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  group: `px-4 pt-4 pb-1 ${PROPERTY_LABEL}`,
  drawer: 'flex flex-col gap-5',
  drawerHead: 'flex items-center gap-3',
  drawerIcon: 'h-8 w-8 shrink-0',
} as const

/**
 * One-by-one task stepper
 * @type {Record<string, string>}
 */

export const TASK_STEPPER = {
  body: 'flex flex-col gap-6',
  hero: 'flex flex-col items-center gap-3 rounded-[var(--radius-xl)] bg-[image:var(--gradient-soft)] px-6 py-8 text-center',
  heroGlyph: 'size-12 shrink-0 text-[var(--color-ink)]',
  heroTitle: 'text-xl leading-tight font-bold tracking-tight text-[var(--color-ink)]',
  heroMeta: 'text-sm font-medium text-[var(--color-ink-subtle)]',
  heroDue: 'rounded-full glass-soft px-3 py-1 text-xs font-semibold text-[var(--color-ink)]',
  dots: 'flex items-center justify-center gap-1.5',
  dot: 'h-1.5 w-1.5 rounded-full bg-[var(--color-border-strong)] transition-all',
  dotActive: 'w-5 bg-[var(--color-ink)]',
  footer: 'flex flex-col gap-2 p-2',
  nav: 'flex items-center justify-between gap-2',
  actions: 'flex flex-wrap items-center justify-center gap-2',
} as const

/**
 * Guided walkthrough
 * @type {Record<string, string>}
 */

export const GUIDE_TOUR = {
  // Dims the page around the control
  ring: 'pointer-events-none fixed z-[70] rounded-[var(--radius-md)] ring-2 ring-[var(--color-pick)] shadow-[0_0_0_9999px_var(--color-scrim)] transition-[top,left,width,height] duration-[var(--motion-duration-base)]',
  bubble:
    'fixed z-[71] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] glass-panel p-4 shadow-[var(--shadow-md)]',
  counter:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-subtle)] uppercase',
  title: 'text-base font-bold',
  body: 'text-sm text-[var(--color-ink)]',
  actions: 'mt-1 flex items-center justify-between gap-2',
} as const

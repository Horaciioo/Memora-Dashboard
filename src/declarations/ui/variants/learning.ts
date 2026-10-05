import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Vertical PIM timeline
 * @type {Record<string, string>}
 */

export const PIM_TIMELINE = {
  wrapper: 'flex flex-col gap-5',
  lock: 'flex items-start gap-3 border-l-4 border-[var(--color-border-strong)] py-1 pl-4 text-sm text-[var(--color-ink-subtle)]',
  lockIcon: 'mt-0.5 h-4 w-4 shrink-0',
  list: 'relative flex flex-col',
  item: 'relative flex gap-4 pb-6 last:pb-0',
  // Rail joining two nodes
  rail: 'absolute top-10 bottom-0 left-5 w-0.5 -translate-x-1/2',
  railDone: 'bg-[var(--color-ink-subtle)]/40',
  railIdle: 'bg-[var(--color-border)]',
  node: 'relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
  nodeCurrent:
    'border-[var(--color-brand-600)] bg-[var(--color-brand-50)] text-[var(--color-brand-800)] shadow-[0_0_0_4px_var(--color-brand-100)]',
  nodeDone:
    'border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-subtle)]',
  nodeIdle:
    'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-subtle)]/70',
  nodeIcon: 'h-5 w-5',
  // Greyed steps
  body: 'flex min-w-0 flex-1 flex-col gap-1 pt-1.5',
  bodyMuted: 'opacity-60 grayscale',
  eyebrow: `${PROPERTY_LABEL} text-[0.6875rem]`,
  title: 'text-base font-bold',
  titleCurrent: 'text-lg font-extrabold text-[var(--color-brand-800)]',
  meta: 'text-xs text-[var(--color-ink-subtle)]',
  description: 'text-sm',
  card: 'mt-2 flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-brand-200)] glass-surface p-4',
  guideTitle: PROPERTY_LABEL,
  actions: 'flex flex-wrap items-center gap-2',
} as const

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
 * Guided walkthrough
 * @type {Record<string, string>}
 */

export const GUIDE_TOUR = {
  // Dims the page around the control
  ring: 'pointer-events-none fixed z-[70] rounded-[var(--radius-md)] ring-2 ring-[var(--color-brand-600)] shadow-[0_0_0_9999px_rgb(0_0_0/0.35)] transition-[top,left,width,height] duration-[var(--motion-duration-base)]',
  bubble:
    'fixed z-[71] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] glass-panel p-4 shadow-[var(--shadow-md)]',
  counter:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-subtle)] uppercase',
  title: 'text-base font-extrabold',
  body: 'text-sm text-[var(--color-ink)]',
  actions: 'mt-1 flex items-center justify-between gap-2',
} as const

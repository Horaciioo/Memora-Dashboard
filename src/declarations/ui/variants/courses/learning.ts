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
  body: 'flex min-h-full flex-col gap-10',
  hero: 'flex flex-col items-center gap-3 rounded-[var(--radius-xl)] bg-[image:var(--gradient-soft)] px-6 py-8 text-center',
  // Creator banner behind the card, as on a live on air
  heroMedia:
    'relative isolate flex-row justify-start gap-5 overflow-hidden bg-[var(--color-media-shade)] px-6 py-8 text-left text-[var(--color-on-media)] [&>*]:text-[var(--color-on-media)]',
  heroPortrait: 'shrink-0 shadow-[var(--shadow-lg)] ring-4 ring-[var(--color-on-media)]',
  heroBackdrop: 'absolute inset-0 -z-10 h-full w-full scale-125 object-cover blur-2xl saturate-150',
  heroGlyph: 'size-12 shrink-0 text-[var(--color-ink)]',
  heroTitle:
    'text-xl leading-tight font-bold tracking-tight text-[var(--color-ink)] [&>strong]:font-extrabold',
  heroMeta: 'text-sm font-medium text-[var(--color-ink-subtle)]',
  heroDue: 'rounded-full glass-soft px-3 py-1 text-xs font-semibold text-[var(--color-ink)]',
  // Position among the walk, then its timeline pinned to the bottom of the body
  infosGroup: 'flex w-full flex-col gap-3 self-stretch !text-left',
  infos: `${PROPERTY_LABEL} !text-left`,
  facts: 'flex flex-col gap-3',
  fact: 'flex items-center justify-start gap-3 !text-left text-sm font-semibold',
  factGlyph: 'size-5 shrink-0 text-[var(--color-ink-subtle)]',
  counter:
    'border-b border-[var(--color-border)] pb-4 text-center text-sm font-semibold text-[var(--color-ink-subtle)]',
  detail:
    'text-center [&_*]:text-center [&_div]:items-center [&_dl]:grid-cols-1 [&_dl>div]:col-span-1',
  timeline: 'mt-auto flex items-center justify-center gap-2.5',
  step: 'size-2.5 shrink-0 rounded-full border border-[var(--color-border-strong)] transition-all hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  stepDone: 'border-transparent bg-[var(--color-ink-subtle)]',
  stepActive: 'w-9 border-transparent bg-[var(--color-ink)]',
  stepEdge: 'scale-60',
  footer: 'flex flex-col gap-2 p-2',
  // Side by side filling the width, stacked from md
  lines: 'flex items-stretch gap-2 p-1 md:flex-col',
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

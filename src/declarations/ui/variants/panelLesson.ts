import { COURSE_PANEL } from '@/declarations/ui/variants/course'

// A card laid over its neighbours, opaque so the one under never shows through
const LAYER_CARD =
  'rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-float)] transition-[left,top,translate,rotate,scale,box-shadow] duration-[var(--motion-duration-celebrate)] ease-[var(--motion-ease-spring)] hover:z-30'

/**
 * Panel window with factor cards fanning out over it
 * @type {Record<string, string>}
 */

export const COURSE_PANELSTACK = {
  root: 'flex flex-col gap-8',
  text: `${COURSE_PANEL} p-5 sm:p-6`,
  stage: 'relative flex flex-col gap-4 md:block md:h-[48rem]',
  where: 'inline-flex items-center gap-2 align-bottom font-bold text-[var(--color-ink-accent)]',
  whereIcon: 'size-7 shrink-0',
  window:
    'relative z-10 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-float)] md:absolute md:inset-x-[26%] md:top-[3%] md:bottom-[3%]',
  bar: 'flex h-12 shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-5 font-bold tracking-tight',
  barIcon: 'size-6 text-[var(--color-ink-accent)]',
  levelIcon: 'size-10 shrink-0',
  levelName: 'text-3xl font-bold tracking-tight',
  // The page itself: its title, then offences by gravity
  page: 'flex flex-col gap-6 p-5',
  groups: 'flex flex-col gap-4',
  cards: 'grid grid-cols-3 gap-3',
  cardOpen: 'border-[var(--accent)] shadow-[var(--shadow-md)]',
  // Sheet of the opened offence
  embed: 'flex flex-col gap-2 border-t border-[var(--color-border)] pt-5',
  offense: 'mb-1 text-lg font-bold tracking-tight',
  tier: 'flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] px-3 py-2 transition-[background-color,box-shadow,translate] duration-[var(--motion-duration-slow)]',
  tierLit:
    'translate-x-1 bg-[var(--color-brand-100)] shadow-[inset_3px_0_0_var(--color-brand-600)]',
  tierName: 'text-sm font-bold text-[var(--color-ink-subtle)]',
  measures: 'flex flex-wrap gap-1.5',
  // Hidden: piled behind the window, shown: fanned out around it
  card: `${LAYER_CARD} z-20 flex gap-3 p-4 md:absolute md:w-[23%]`,
  cardHidden: 'md:top-[32%] md:left-[34%] md:rotate-0 md:scale-90',
  cardShown:
    'md:top-[var(--y)] md:left-[var(--x)] md:rotate-[var(--r)] [transition-delay:var(--delay)] hover:rotate-0 hover:scale-[1.04] hover:[transition-delay:0ms]',
  cardChip: 'shrink-0 text-[var(--color-ink-accent)]',
  cardIcon: 'size-7',
  cardLabel: 'text-base leading-tight font-bold',
  cardText: 'mt-1 text-sm leading-snug text-[var(--color-ink-subtle)]',
  // Where each card lands beside the window: left column then right column
  spots: [
    '[--x:0%] [--y:2%] [--r:-2deg]',
    '[--x:3%] [--y:35%] [--r:1.5deg]',
    '[--x:0%] [--y:68%] [--r:-1deg]',
    '[--x:77%] [--y:5%] [--r:2deg]',
    '[--x:74%] [--y:38%] [--r:-1.5deg]',
    '[--x:77%] [--y:70%] [--r:1.5deg]',
  ],
} as const

/**
 * Two cards sliding over each other
 * @type {Record<string, string>}
 */

export const COURSE_PILLARS = {
  root: 'flex flex-col gap-8',
  text: `${COURSE_PANEL} p-5 sm:p-6`,
  stage: 'relative flex flex-col gap-5 md:block md:h-[26rem]',
  card: `${LAYER_CARD} flex flex-col gap-3 p-6 md:absolute md:w-[60%]`,
  first: 'md:top-0 md:left-0 md:z-10',
  second: 'md:right-0 md:bottom-0 md:z-20',
  // Piled in the middle, then apart and slightly askew
  firstHidden: 'md:translate-x-[30%]',
  secondHidden: 'md:-translate-x-[30%]',
  firstShown: 'md:-rotate-1 hover:rotate-0',
  secondShown: 'md:rotate-1 hover:rotate-0',
  head: 'flex items-center gap-3',
  chip: 'grid size-11 shrink-0 place-items-center rounded-[var(--radius-lg)]',
  icon: 'size-6',
  label: 'text-xl font-bold tracking-tight',
  body: 'text-lg leading-relaxed',
} as const

/**
 * Gauge that moves from patience to firmness
 * @type {Record<string, string>}
 */

export const COURSE_SEVERITY = {
  root: 'flex flex-col gap-8',
  text: `${COURSE_PANEL} p-5 sm:p-6`,
  stage: `flex flex-col gap-8 ${COURSE_PANEL} p-6 sm:p-8`,
  ends: 'flex justify-between text-sm font-bold tracking-wide uppercase',
  calm: 'text-[var(--color-success)]',
  firm: 'text-[var(--color-danger)]',
  gauge: 'px-3.5',
  track:
    'relative h-3 rounded-full bg-[linear-gradient(90deg,var(--color-apple-green),var(--color-apple-orange),var(--color-apple-red))]',
  needle:
    'absolute top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[var(--color-surface-raised)] bg-[var(--color-ink)] shadow-[var(--shadow-float)] transition-[left] duration-[1400ms] ease-[var(--motion-ease-spring)]',
  cards: 'grid gap-4 md:grid-cols-3',
  card: 'flex cursor-pointer flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 text-left shadow-[var(--shadow-sm)] transition-[translate,box-shadow,border-color] duration-[var(--motion-duration-panel)] hover:border-[var(--color-border-strong)]',
  cardLit: '-translate-y-2 border-[var(--color-ink)] shadow-[var(--shadow-float)]',
  chip: 'grid size-10 place-items-center rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] text-[var(--color-ink)] transition-colors duration-[var(--motion-duration-panel)]',
  chipLit: 'bg-[var(--color-ink)] text-[var(--color-surface)]',
  icon: 'size-6',
  label: 'text-lg font-bold tracking-tight',
  body: 'text-base leading-relaxed text-[var(--color-ink-subtle)]',
} as const

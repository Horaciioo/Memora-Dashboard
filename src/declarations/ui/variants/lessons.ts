import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Guided tour of the Mod View
 * @type {Record<string, string>}
 */

export const COURSE_TOUR = {
  root: 'course-wide flex flex-col gap-5',
  intro: 'text-body leading-relaxed',
  toolbar: 'flex flex-wrap items-center gap-3',
  layout: 'grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]',
  list: 'flex flex-col gap-1 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2 shadow-[var(--shadow-scene)]',
  stop: 'relative flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-left text-sm font-semibold transition-[background-color,color,transform] duration-[var(--motion-duration-panel)] hover:bg-[var(--color-hover)]',
  stopActive: 'translate-x-1 bg-[var(--color-brand-100)] font-bold text-[var(--color-brand-800)]',
  stopDot: 'h-2 w-2 shrink-0 rounded-full bg-[var(--color-border-strong)] transition-colors',
  stopDotActive: 'bg-[var(--color-brand-600)]',
  stage: 'relative min-w-0 rounded-[var(--radius-xl)] shadow-[var(--shadow-scene)]',
  bubble:
    'course-erase-in absolute inset-x-4 bottom-4 z-30 flex max-w-xl flex-col gap-1 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-scene)] lg:left-6 lg:right-auto',
  bubbleTitle: 'text-sm font-bold tracking-tight',
  bubbleBody: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  building:
    'grid h-[40rem] gap-3 lg:h-[44rem] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,0.7fr)]',
  buildingColumn: 'flex flex-col gap-3',
  buildingBlock:
    'skeleton-shimmer flex-1 rounded-[var(--radius-xl)] bg-[var(--color-surface-sunken)]',
} as const

/**
 * One part of the Mod View explained on its own
 * @type {Record<string, string>}
 */

export const COURSE_FOCUS = {
  root: 'course-wide flex flex-col gap-5',
  prompt: 'text-body leading-relaxed',
  picks: 'flex flex-wrap gap-2',
  pick: 'rounded-full border-2 border-[var(--color-border)] px-4 py-1.5 text-sm font-bold transition-[border-color,background-color,color] hover:border-[var(--color-brand-600)]',
  pickActive:
    'border-[var(--color-brand-600)] bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  layout: 'course-erase-in grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]',
  points: 'flex flex-col gap-3',
  point:
    'rounded-[var(--radius-lg)] border-l-4 border-[var(--color-brand-600)] bg-[var(--color-surface-raised)] px-4 py-3 text-body leading-relaxed shadow-[var(--shadow-sm)]',
  stage: 'min-w-0 rounded-[var(--radius-xl)] shadow-[var(--shadow-scene)]',
} as const

/**
 * Decision ladder
 * @type {Record<string, string>}
 */

export const COURSE_LADDER = {
  root: 'flex flex-col items-center gap-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-scene)]',
  rung: 'course-rung-in flex flex-col items-center gap-2',
  label: PROPERTY_LABEL,
  names: 'flex flex-wrap justify-center gap-2',
  name: 'rounded-full px-4 py-1.5 text-sm font-bold',
  link: 'h-6 w-0.5 bg-[var(--color-border-strong)]',
  top: 'bg-[var(--color-apple-red)] text-[var(--color-on-media)]',
  middle: 'bg-[var(--color-apple-orange)] text-[var(--color-on-media)]',
  bottom: 'bg-[var(--color-apple-green)] text-[var(--color-on-media)]',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Livecon levels and the panel moving with them
 * @type {Record<string, string>}
 */

export const COURSE_LIVECON = {
  root: 'grid gap-5 lg:grid-cols-2',
  levels: 'flex flex-col gap-2',
  level:
    'flex items-start gap-3 rounded-[var(--radius-xl)] border-2 border-transparent bg-[var(--color-surface-raised)] p-4 text-left shadow-[var(--shadow-sm)] transition-[border-color,transform,box-shadow] duration-[var(--motion-duration-panel)]',
  levelActive: 'translate-x-1 shadow-[var(--shadow-scene)]',
  levelIcon: 'h-9 w-9 shrink-0',
  levelBody: 'flex min-w-0 flex-col gap-1',
  levelName: 'text-base font-bold tracking-tight',
  levelText: 'text-sm leading-relaxed',
  levelNote: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  panel:
    'course-erase-in flex flex-col gap-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-scene)]',
  panelHead: 'flex items-center gap-2',
  panelIcon: 'h-5 w-5',
  panelTitle: PROPERTY_LABEL,
  sample:
    'flex flex-col gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3',
  sampleName: 'text-sm font-bold',
  measures: 'flex flex-wrap gap-1.5',
  measure: 'rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-bold',
  calm: 'border-[var(--color-apple-green)]',
  watch: 'border-[var(--color-apple-orange)]',
  crisis: 'border-[var(--color-apple-red)]',
  calmFill: 'bg-[color-mix(in_oklab,var(--color-apple-green)_18%,transparent)]',
  watchFill: 'bg-[color-mix(in_oklab,var(--color-apple-orange)_18%,transparent)]',
  crisisFill: 'bg-[color-mix(in_oklab,var(--color-apple-red)_18%,transparent)]',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Case study played in the Mod View
 * @type {Record<string, string>}
 */

export const COURSE_SCENE = {
  context: 'text-body leading-relaxed',
  // The whole exercise breaks out
  wide: 'course-wide',
  stage: 'rounded-[var(--radius-xl)] shadow-[var(--shadow-scene)]',
  controls: 'flex flex-wrap items-center gap-3',
  questions: 'flex flex-col gap-6',
} as const

/**
 * Opening and closing pages of a course
 * @type {Record<string, string>}
 */

export const COURSE_PAGES = {
  page: 'course-erase-in mx-auto flex w-full max-w-3xl flex-col gap-8',
  kicker: PROPERTY_LABEL,
  title: 'text-3xl font-bold tracking-tight text-balance sm:text-4xl',
  section: 'flex flex-col gap-3',
  heading: 'text-lg font-bold tracking-tight',
  text: 'text-body leading-relaxed',
  outline: 'flex flex-col gap-2',
  outlineItem:
    'flex items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] px-4 py-3 text-body font-bold shadow-[var(--shadow-sm)]',
  outlineIndex:
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-sm font-bold text-[var(--color-on-brand)]',
  start: 'self-start',
  end: 'text-5xl font-bold tracking-tight sm:text-6xl',
  scale: 'flex flex-col gap-2',
  scaleRow: 'flex flex-wrap items-center gap-2',
  scaleEdge: 'text-sm text-[var(--color-ink-subtle)]',
  scaleDots: 'flex flex-wrap gap-1.5',
  scaleDot:
    'flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-border)] text-sm font-bold transition-[border-color,background-color,color,transform] hover:-translate-y-0.5 hover:border-[var(--color-brand-600)]',
  scaleDotPicked:
    'border-[var(--color-brand-600)] bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  comment:
    'min-h-28 w-full rounded-[var(--radius-lg)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-body outline-none focus:border-[var(--color-brand-600)]',
} as const

/**
 * Welcome of the trainings page
 * @type {Record<string, string>}
 */

export const TRAININGS_WELCOME_STYLES = {
  step: 'relative flex items-center md:mb-3',
  box: 'relative flex flex-col justify-center gap-8 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-6 sm:p-8',
  page: 'course-erase-in flex min-w-0 flex-col gap-6',
  rows: 'flex flex-col gap-5',
  row: 'flex items-start gap-4',
  glyph: 'h-10 w-10 shrink-0',
  text: 'text-body leading-relaxed',
} as const

/**
 * Course done ceremony and the stamp left on its card
 * @type {Record<string, string>}
 */

export const COURSE_STAMP = {
  overlay:
    'pointer-events-none fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6',
  veil: 'absolute inset-0 bg-[color-mix(in_oklab,var(--color-ink)_30%,transparent)] transition-opacity duration-[var(--motion-duration-slow)]',
  veilGone: 'opacity-0',
  cheer:
    'rise-in relative text-4xl font-bold tracking-tight text-[var(--color-on-media)] drop-shadow-lg sm:text-5xl',
  stamp:
    'relative rounded-[var(--radius-lg)] border-[6px] border-[var(--color-apple-red)] px-6 py-3 text-2xl font-bold tracking-wide text-[var(--color-apple-red)] uppercase sm:text-4xl',
  stampSlam: 'stamp-slam bg-[color-mix(in_oklab,var(--color-on-media)_85%,transparent)]',
  // Flying to the card
  stampFly: 'transition-transform duration-[var(--motion-duration-celebrate)] ease-in-out',
  confetti: 'absolute top-1/2 left-1/2 h-3 w-2 rounded-sm confetti-piece',
  // Steps of the celebrated card fill one by one
  stepFill: 'step-fill bg-[var(--color-brand-600)]',
  // Left on a finished card
  posterWrap: 'relative',
  posterDone: 'grayscale',
  cardStamp:
    'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-8 rounded-[var(--radius-md)] border-4 border-[var(--color-apple-red)] bg-[color-mix(in_oklab,var(--color-on-media)_80%,transparent)] px-3 py-1 text-sm font-bold tracking-wide whitespace-nowrap text-[var(--color-apple-red)] uppercase',
} as const

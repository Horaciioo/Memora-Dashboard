import { COURSE_PANEL } from '@/declarations/ui/variants/courses/course'
import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Practical exercises of the interview
 * @type {Record<string, string>}
 */

export const EXERCISE_STYLES = {
  arrive: 'exercise-arrive flex flex-col gap-8',
  pick: 'grid gap-4 md:grid-cols-3',
  tile: `group flex cursor-pointer flex-col items-start gap-3 ${COURSE_PANEL} p-5 text-left transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]`,
  tileIcon: 'size-8 text-[var(--color-ink-accent)]',
  tileTitle: 'text-lg font-bold tracking-tight',
  tileLead: 'text-sm text-[var(--color-ink-subtle)]',
  random: 'self-center',
  reveal:
    'exercise-reveal absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[color-mix(in_srgb,var(--color-page)_88%,transparent)] px-6 text-center backdrop-blur-md',
  revealKicker:
    'exercise-kicker text-xs font-bold tracking-[0.18em] text-[var(--color-ink-subtle)] uppercase',
  revealTitle:
    'exercise-title text-5xl font-bold tracking-tight text-balance text-[var(--color-ink)] sm:text-7xl',
  head: 'flex items-start gap-4',
  headBody: 'flex min-w-0 flex-1 flex-col gap-2',
  headActions: 'flex shrink-0 items-center gap-1',
  title: 'text-3xl font-bold tracking-tight',
  say: 'border-l-4 border-[var(--color-info)] pl-4 text-lg text-[var(--color-ink)] italic',
  hint: 'text-[var(--color-ink-subtle)]',
  brief: `flex flex-col gap-4 ${COURSE_PANEL} p-5`,
  label: PROPERTY_LABEL,
  digs: 'flex flex-col gap-1.5 pl-5 [&>li]:list-disc',
  action: 'flex justify-end',
  chooser: 'flex flex-wrap gap-2',
  chooserItem:
    'cursor-pointer rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-[var(--color-hover)]',
  chooserOn: 'border-[var(--color-ink)] bg-[var(--color-surface-sunken)]',
  scenario: `${COURSE_PANEL} p-4`,
  steps: 'flex flex-col gap-2',
  step: `flex items-center gap-4 ${COURSE_PANEL} px-4 py-3 transition-opacity`,
  stepIdle: 'opacity-35',
  stepLive: 'shadow-[var(--shadow-md)] ring-2 ring-[var(--color-ink)]',
  stepDone: 'opacity-70',
  stepNumber: 'w-6 shrink-0 font-mono text-sm text-[var(--color-ink-subtle)]',
  stepPrompt: 'min-w-0 flex-1 font-semibold',
  stepPause: 'shrink-0 font-mono text-sm text-[var(--color-ink-subtle)]',
  clock: 'flex w-20 shrink-0 flex-col items-end gap-1',
  clockValue: 'font-mono text-3xl leading-none font-bold tabular-nums',
  clockLate: 'text-[var(--color-danger)]',
  clockBar: 'h-1 w-full overflow-hidden rounded-full bg-[var(--color-surface-sunken)]',
  clockFill: 'exercise-drain h-full w-full origin-left rounded-full bg-[var(--color-ink)]',
  runBar: 'flex items-center justify-between gap-3',
  runInfo: 'text-sm text-[var(--color-ink-subtle)]',
  levels: 'grid gap-4 md:grid-cols-2',
  level: `flex flex-col gap-2 ${COURSE_PANEL} p-4`,
  context:
    'flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-transparent px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-sunken)]',
  contextOn: 'border-[var(--color-ink)] bg-[var(--color-surface-sunken)] font-bold',
  links: `flex flex-col gap-5 ${COURSE_PANEL} p-5`,
  link: 'flex flex-col gap-3',
  // Short rule between two links, clear of the box edges
  linkDivider: 'mx-8 h-px border-0 bg-[var(--color-border)]',
  linkHead: 'flex flex-wrap items-start justify-between gap-x-4 gap-y-1',
  linkTitle: 'text-base leading-snug font-bold',
  linkRow: 'flex flex-wrap items-center gap-3',
  linkActions: 'flex shrink-0 items-center gap-2',
  linkUrl:
    'min-w-0 flex-1 truncate rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-3 py-2 font-mono text-sm',
  linkDead: 'line-through opacity-50',
  linkMeta: 'text-xs text-[var(--color-ink-subtle)]',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Public page of a written context
 * @type {Record<string, string>}
 */

export const EXERCISE_PUBLIC = {
  root: 'flex min-h-dvh flex-col items-center gap-6 bg-[image:var(--gradient-page)] px-4 py-8',
  head: 'flex w-full max-w-5xl flex-col gap-2',
  title: 'text-3xl font-bold tracking-tight',
  lead: 'text-[var(--color-ink-subtle)]',
  stage: 'flex w-full max-w-5xl flex-col gap-4',
  discord:
    'h-[34rem] w-full overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-page)]',
  // Whole Twitch page: stream beside the chat
  twitch:
    'grid h-[34rem] w-full grid-cols-1 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--twitch-background)] text-[var(--twitch-text)] shadow-[var(--shadow-page)] lg:grid-cols-[minmax(0,1fr)_22rem]',
  twitchVideo:
    'relative hidden flex-col justify-between bg-black p-4 text-[var(--color-on-media)] lg:flex',
  twitchLive:
    'inline-flex w-fit items-center gap-2 rounded-[3px] bg-[var(--youtube-red)] px-2 py-0.5 text-xs font-bold tracking-wide uppercase',
  twitchPlay: 'size-16 self-center opacity-40',
  twitchTitle: 'text-sm font-semibold opacity-80',
  twitchChat: 'flex min-h-0 flex-col border-[var(--color-on-media)]/10 lg:border-l',
  twitchInput:
    'm-2 rounded-[var(--radius-md)] bg-[var(--color-on-media)]/10 px-3 py-2 text-sm text-[var(--twitch-muted)]',
  brief: `${COURSE_PANEL} flex flex-col gap-2 p-5`,
  briefLabel: PROPERTY_LABEL,
  briefText: 'text-lg leading-relaxed',
  controls: 'flex flex-wrap items-center gap-3',
  note: 'text-sm text-[var(--color-ink-subtle)]',
  error: 'text-sm font-semibold text-[var(--color-danger)]',
} as const

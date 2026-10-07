import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'
import { COURSE_PANEL } from '@/declarations/ui/variants/course'

/**
 * Case where the learner weighs the panel against the person
 * @type {Record<string, string>}
 */

export const COURSE_JUDGEMENT = {
  flow: 'flex flex-col gap-10',
  stage: 'grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-start',
  // Arrives one after the other once the scene is played
  enter:
    'transition-[opacity,translate] duration-[var(--motion-duration-celebrate)] ease-[var(--motion-ease-spring)] [transition-delay:var(--delay)]',
  hidden: 'pointer-events-none translate-y-8 opacity-0',
  // Twitch chat with its input bar
  chatBody: 'flex h-[30rem] flex-col justify-end gap-0.5 overflow-hidden p-2',
  notice:
    'flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--color-on-media)]/10 px-2 py-1.5 text-sm text-[var(--twitch-muted)] italic',
  noticeIcon: 'mt-0.5 size-4 shrink-0 text-[var(--color-caution)]',
  inputBar: 'border-t border-[var(--color-on-media)]/10 p-3',
  input:
    'flex min-h-11 items-center rounded-[var(--radius-md)] bg-[var(--color-on-media)]/10 px-3 text-sm break-all',
  inputHint: 'text-[var(--twitch-muted)]',
  caret: 'ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-middle',
  // The viewer file
  file: `overflow-hidden ${COURSE_PANEL}`,
  banner: 'h-20 bg-[var(--gradient-soft)]',
  who: 'flex items-end gap-4 px-5',
  avatar:
    'grid size-16 -mt-8 shrink-0 place-items-center rounded-full border-4 border-[var(--color-surface-raised)] text-2xl font-bold text-[var(--color-on-media)]',
  name: 'pb-1 text-2xl font-bold tracking-tight',
  facts: 'grid grid-cols-2 gap-3 p-5',
  fact: 'flex flex-col gap-1.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition-colors',
  factHead: `flex items-center gap-2 ${PROPERTY_LABEL}`,
  factIcon: 'size-5 shrink-0 text-[var(--color-ink-accent)]',
  factValue: 'text-xl font-bold tracking-tight',
  history: 'flex flex-col gap-3 border-t border-[var(--color-border)] p-5',
  historyEmpty: 'text-sm text-[var(--color-ink-subtle)] italic',
  entry:
    'flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-caution)] bg-[var(--color-caution-soft)] p-3 text-sm leading-snug',
  entryIcon: 'mt-0.5 size-5 shrink-0 text-[var(--color-caution)]',
  entryTitle: 'font-bold',
  entryMeta: 'text-xs text-[var(--color-ink-subtle)]',
  // The panel of the level in force
  panel: `flex flex-col gap-5 ${COURSE_PANEL} p-5`,
  panelHead: `flex items-center gap-2 ${PROPERTY_LABEL}`,
  panelHeadIcon: 'size-5 text-[var(--color-ink-accent)]',
  level: 'flex items-center gap-3',
  levelIcon: 'size-10 shrink-0',
  levelName: 'text-3xl font-bold tracking-tight',
  offense: 'text-lg font-bold tracking-tight',
  recommended: 'text-xs font-bold tracking-wide text-[var(--color-danger)] uppercase',
  // Question, doubt and judgement
  decision: `flex flex-col gap-5 ${COURSE_PANEL} mx-auto w-full max-w-4xl p-6 sm:p-8`,
  decisionTitle: 'text-2xl font-bold tracking-tight',
  decisionText: 'text-lg leading-relaxed',
  answers: 'flex flex-wrap gap-3',
  waiting: 'mx-auto text-center text-lg text-[var(--color-ink-subtle)] italic',
  reveal: 'border-[var(--color-success)]',
  doubt: 'border-[var(--color-caution)]',
} as const

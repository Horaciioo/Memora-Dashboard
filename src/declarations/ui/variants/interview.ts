import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'
import { COURSE_PANEL } from '@/declarations/ui/variants/courses/course'

/**
 * Questionnaire planner of a recruitment session
 * @type {Record<string, string>}
 */

export const QUESTION_PLAN = {
  root: 'flex flex-col gap-12',
  part: 'flex flex-col gap-5',
  partHead: 'flex max-w-3xl flex-col gap-2',
  partNumber: 'font-mono text-xs tracking-wide text-[var(--color-ink-accent)] uppercase',
  partTitle: 'text-3xl font-bold tracking-tight',
  partLead: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  section: 'flex flex-col',
  sectionTitle: `${PROPERTY_LABEL} pb-2`,
  // One question, a click picks it
  row: 'group flex w-full cursor-pointer items-start gap-4 border-b border-[var(--color-border)] py-4 text-left transition-colors first:border-t hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  rowLocked: 'cursor-default hover:bg-transparent',
  // Bare check
  pick: 'mt-0.5 flex size-6 shrink-0 cursor-pointer items-center justify-center text-[var(--color-border-strong)] transition-colors disabled:cursor-default',
  pickOn: 'text-[var(--color-ink-accent)]',
  body: 'flex min-w-0 flex-1 flex-col gap-1',
  prompt: 'font-semibold',
  promptOff: 'font-medium text-[var(--color-ink-subtle)]',
  hint: 'text-sm text-[var(--color-ink-subtle)]',
  meta: 'flex shrink-0 flex-col items-end gap-1 text-xs text-[var(--color-ink-subtle)]',
  mandatory: 'font-bold text-[var(--color-danger)]',
  choice: 'font-medium',
  more: 'self-start cursor-pointer text-xs font-semibold text-[var(--color-ink-subtle)] underline-offset-4 hover:underline',
  detail: 'mt-3',
  toolbar: 'flex flex-wrap items-center justify-between gap-3',
  duration: 'text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Body of a question: what to say, what to look for, how to dig
 * @type {Record<string, string>}
 */

export const QUESTION_BODY = {
  root: 'flex flex-col gap-1 text-sm',
  fold: 'group border-t border-[var(--color-border)] py-2 first:border-t-0',
  foldHead:
    'flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase marker:hidden hover:text-[var(--color-ink)] [&::-webkit-details-marker]:hidden',
  foldChevron: 'h-4 w-4 transition-transform group-open:rotate-90',
  foldBody: 'flex flex-col gap-3 pt-3',
  say: 'border-l-4 border-[var(--color-info)] pl-4 text-[var(--color-ink)] italic',
  hint: 'text-[var(--color-ink-subtle)]',
  label: PROPERTY_LABEL,
  block: 'flex flex-col gap-2',
  list: 'flex flex-col gap-1.5 pl-5 [&>li]:list-disc',
  group:
    'flex flex-col gap-1 border-t border-[var(--color-border)] pt-3 first:border-t-0 first:pt-0',
  steps: 'flex flex-col gap-2.5 pl-5 [&>li]:list-decimal',
  pause: 'ml-2 text-xs text-[var(--color-ink-subtle)] italic',
  branch: 'flex flex-col gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-3',
  branchWhen: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  scenario:
    'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4',
  documents: 'flex flex-wrap gap-x-5 gap-y-2',
  document: 'font-semibold text-[var(--color-ink-accent)] underline-offset-4 hover:underline',
} as const

/**
 * Interview run on one candidate
 * @type {Record<string, string>}
 */

export const INTERVIEW = {
  part: 'flex flex-col gap-4 pt-2',
  card: `flex flex-col gap-4 ${COURSE_PANEL} p-5`,
  promptMandatory: 'text-[var(--color-danger)]',
  cardSkipped: 'opacity-55',
  head: 'flex items-start gap-4',
  // Wash hugs the question itself, padding offset so nothing moves
  ask: 'flex items-start gap-4 rounded-[var(--radius-md)] -mx-3 px-3 py-2 transition-colors',
  askBody: 'flex min-w-0 flex-1 flex-col gap-1',
  askSub: 'text-base leading-snug font-semibold',
  asks: 'flex flex-col gap-1',
  headBody: 'flex min-w-0 flex-1 flex-col gap-1',
  when: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  prompt: 'text-lg leading-snug font-bold tracking-tight',
  promptSkipped: 'line-through decoration-[var(--color-border-strong)]',
  actions: 'flex shrink-0 items-center gap-1',
  liked: 'text-[var(--color-success)]',
  disliked: 'text-[var(--color-danger)]',
  neutral: 'text-[var(--color-ink-subtle)]',
  faded: 'opacity-35',
  glyph:
    'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-[opacity,transform] hover:scale-110 focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:outline-none disabled:cursor-not-allowed disabled:hover:scale-100',
  glyphOn: 'scale-110',
  glyphSize: 'h-6 w-6',
  glyphSkip: 'text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]',
  cardLike:
    'bg-linear-to-r from-[color-mix(in_srgb,var(--color-success)_22%,var(--color-surface-raised))] via-[color-mix(in_srgb,var(--color-success)_7%,var(--color-surface-raised))] to-[var(--color-surface-raised)]',
  cardDislike:
    'bg-linear-to-r from-[color-mix(in_srgb,var(--color-danger)_22%,var(--color-surface-raised))] via-[color-mix(in_srgb,var(--color-danger)_7%,var(--color-surface-raised))] to-[var(--color-surface-raised)]',
  cardNeutral:
    'bg-linear-to-r from-[color-mix(in_srgb,var(--color-ink-subtle)_22%,var(--color-surface-raised))] via-[color-mix(in_srgb,var(--color-ink-subtle)_7%,var(--color-surface-raised))] to-[var(--color-surface-raised)]',
  // Same frame as the welcome chat, under the drawer layer
  frame:
    'overlay-enter fixed inset-0 z-40 flex flex-col gap-3 overflow-hidden bg-[image:var(--gradient-page)] p-[var(--tour-inset)] lg:block lg:p-0',
  contentWide: 'max-w-5xl',
  content: 'relative mx-auto flex w-full max-w-3xl flex-col gap-8',
  // Small trail above the title, out of the flow so nothing moves
  crumbs:
    'absolute -top-6 left-0 flex max-w-full items-center gap-1.5 truncate text-xs text-[var(--color-ink-subtle)]',
  crumb: 'truncate transition-colors hover:text-[var(--color-ink)]',
  crumbCurrent: 'font-semibold text-[var(--color-ink)]',
  crumbSeparator: 'shrink-0 opacity-60',
  intro: 'flex flex-col gap-10',
  introHead: 'flex flex-col items-start gap-4',
  introText: `${COURSE_PANEL} p-6 text-lg leading-relaxed`,
  guide: 'grid gap-4 md:grid-cols-3',
  guideList: 'flex flex-col gap-1.5',
  guideItem: 'flex items-center gap-3 text-sm whitespace-nowrap',
  guideBox: `flex flex-col gap-3 ${COURSE_PANEL} p-5`,
  guideDemo: 'flex h-12 items-center gap-1',
  guideTitle: 'text-lg font-bold tracking-tight',
  guideText: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  guideNote:
    'flex-1 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink-subtle)]',
  introTag:
    'inline-flex items-center rounded-full bg-[var(--color-brand-600)] px-3 py-1 text-xs font-bold text-[var(--color-on-brand)]',
  // Scrolled content slips under a blurred strip holding the buttons
  scrollPad: 'pb-32',
  footerZone: 'pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end',
  footerBlur:
    'absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_top,black_50%,transparent)] bg-[color-mix(in_srgb,var(--color-page)_60%,transparent)]',
  footer:
    'pointer-events-auto relative mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 pt-8 pb-5 sm:px-10 lg:px-14',
  reviewRow: 'flex items-start gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm',
  reviewNote: 'text-xs text-[var(--color-ink-subtle)]',
  // Tally on the left, bilan on the right, the box never grows
  finishBody: 'grid h-full min-h-0 gap-8 md:grid-cols-2',
  tally: 'flex min-h-0 flex-col gap-1',
  tallyItem: 'flex min-h-0 shrink-0 flex-col',
  tallyItemOpen: 'flex-1 shrink',
  tallyHead:
    'flex w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-sm font-bold transition-colors hover:bg-[var(--color-surface-sunken)]',
  // Blue bubble above the tally, tail down toward the three lines
  tallyHint:
    'hint-float relative mb-3 self-start rounded-[var(--radius-lg)] bg-linear-to-b from-[color-mix(in_srgb,white_14%,var(--color-info))] to-[var(--color-info)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)]',
  tallyHintTail: 'absolute -bottom-1 left-8 size-3 rotate-45 rounded-[2px] bg-[var(--color-info)]',
  tallyList: 'flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto py-1',
  bilan: 'flex min-h-0 flex-col gap-3',
  bilanField: 'min-h-40 flex-1 resize-none',
  verdicts: 'grid shrink-0 grid-cols-3 gap-2',
  verdict:
    'flex cursor-pointer items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] px-2 py-3 text-sm font-bold transition-[border-color,box-shadow] hover:border-[var(--color-border-strong)] disabled:cursor-not-allowed',
  verdictOn: {
    LIKE: 'border-[var(--color-success)] bg-[var(--color-success)] text-white shadow-[var(--shadow-sm)]',
    NEUTRAL:
      'border-[var(--color-ink-subtle)] bg-[var(--color-ink-subtle)] text-white shadow-[var(--shadow-sm)]',
    DISLIKE:
      'border-[var(--color-danger)] bg-[var(--color-danger)] text-white shadow-[var(--shadow-sm)]',
  },

  partTitle: 'text-3xl font-bold tracking-tight',
  covered: 'text-sm text-[var(--color-ink-subtle)] italic',
  notes: 'relative flex flex-col gap-2',
  noteField:
    'min-h-20 w-full resize-y rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
  noteClose:
    'absolute top-2 right-2 inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] disabled:hidden',
  noteAdd:
    'self-start cursor-pointer text-sm font-semibold text-[var(--color-ink-subtle)] underline-offset-4 hover:underline',
  empty: 'py-10 text-center text-sm text-[var(--color-ink-subtle)] italic',
} as const

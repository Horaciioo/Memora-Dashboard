import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

// Box of the app (frosted card, border, shadow), greyed a little for the words of a course
export const COURSE_PANEL =
  'rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface bg-[color-mix(in_srgb,var(--color-surface-sunken)_40%,var(--color-surface))]'

/**
 * Catalogue of interactive courses: a stage for the course in focus and a carousel to pick from
 * @type {Record<string, string>}
 */

export const COURSE_CATALOG = {
  page: 'mx-auto flex w-full max-w-6xl flex-col gap-10',
  group: 'flex flex-col gap-6',
  title: 'text-2xl font-bold tracking-tight sm:text-3xl',
  // Stage of the selected course: photo alone on top, words and progress below
  stage:
    'relative isolate flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface shadow-[var(--shadow-md)]',
  stagePhoto: 'size-full object-cover',
  stageBand: 'relative block h-40 overflow-hidden sm:h-52',
  stageShade:
    'absolute inset-0 bg-gradient-to-t from-[color-mix(in_oklab,var(--color-media-shade)_55%,transparent)] to-transparent',
  stageTop: 'absolute top-4 left-4 flex flex-wrap items-center gap-2',
  stageSurface: `flex items-center gap-2 rounded-[var(--radius-full)] bg-[color-mix(in_oklab,var(--color-media-shade)_55%,transparent)] px-3 py-1 ${PROPERTY_LABEL} text-[var(--color-on-media)]`,
  stageBody: 'grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_20rem] md:gap-10',
  stageText: 'flex min-w-0 flex-col gap-3',
  stageKicker: `${PROPERTY_LABEL} text-[var(--color-ink-subtle)]`,
  stageName: 'text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl',
  stageSummary: 'max-w-2xl text-body leading-relaxed text-[var(--color-ink-subtle)]',
  stageSide: 'flex flex-col gap-4 md:border-l md:border-[var(--color-border)] md:pl-8',
  stageProgress: 'flex flex-col gap-2',
  stageProgressLabel: `${PROPERTY_LABEL} text-[var(--color-ink-subtle)]`,
  stageProgressValue: 'text-body font-bold tabular-nums',
  stageMeta:
    'flex flex-wrap gap-x-4 gap-y-1 text-caption font-semibold text-[var(--color-ink-subtle)]',
  stageSteps: 'flex gap-1',
  stageStep: 'h-1.5 flex-1 rounded-full bg-[var(--color-border-strong)]',
  stageStepDone: 'bg-[var(--color-ink)]',
  stageAction:
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-brand-600)] px-5 py-2.5 text-body font-bold text-[var(--color-on-brand)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
  actionIcon: 'size-4 transition-transform group-hover:translate-x-0.5',
  // Heading of a group, with what it is for
  groupLead: 'text-body text-[var(--color-ink-subtle)]',
  // Carousel
  carouselHead: 'flex items-center justify-between gap-4',
  carouselArrows: 'flex gap-2',
  arrow:
    'flex size-10 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-hover)] disabled:opacity-35 disabled:hover:bg-[var(--color-surface-raised)]',
  arrowIcon: 'size-4',
  track:
    '-mx-3 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-px-3 px-3 pt-3 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  tile: 'group relative flex w-72 shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface text-left transition-[transform,box-shadow] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-spring)] hover:shadow-[var(--shadow-lg)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] active:scale-[0.98] sm:w-[22rem]',
  // Not clickable: the visit, or a course not open yet
  tileInert: 'cursor-default hover:shadow-none active:scale-100 [&_img]:group-hover:scale-100',
  tileUnavailable: 'cursor-not-allowed opacity-55 grayscale',
  tileSelected:
    'ring-2 ring-[var(--color-brand-600)] ring-offset-2 ring-offset-[var(--color-page)] shadow-[var(--shadow-lg)]',
  infoList: 'flex flex-col gap-2',
  infoLine: 'flex items-center gap-2.5 text-caption font-semibold',
  infoBullet: 'size-3 shrink-0 text-[var(--color-brand-600)]',
  tileDoneCard: 'bg-[var(--color-surface-sunken)]',
  tilePhoto: 'relative block aspect-[4/3] overflow-hidden',
  tileImage:
    'size-full object-cover transition-transform duration-[var(--motion-duration-slow)] group-hover:scale-110',
  tileImageDone: 'grayscale',
  tileShade: 'absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent',
  tileTag:
    'absolute top-3 left-3 rounded-[var(--radius-full)] bg-[var(--color-brand-600)] px-2.5 py-1 text-micro font-bold tracking-wide text-[var(--color-on-brand)] uppercase shadow-[var(--shadow-sm)]',
  tileSurfaceIcon: 'size-4',
  // Title over the foot of the banner
  tileTitle:
    'absolute inset-x-0 bottom-0 p-4 text-body leading-snug font-bold tracking-tight text-balance text-[var(--color-on-media)]',
  tileBody: 'flex flex-1 flex-col gap-3 p-4',
  tileState: 'mt-auto text-caption font-bold text-[var(--color-ink)]',
  tileDone: 'text-[var(--color-ink-subtle)]',
  // Specialisation waiting for its period
  tileLocked:
    'group relative flex w-64 shrink-0 snap-start cursor-not-allowed flex-col overflow-hidden rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)] sm:w-[22rem]',
  lockedBanner:
    'relative flex aspect-[4/3] items-center justify-center gap-3 bg-[var(--color-border)]',
  lockedGlyph: 'size-11 drop-shadow-[var(--shadow-sm)]',
  lockedBody: 'flex flex-1 flex-col justify-center gap-3 p-4',
  lockedName: 'text-body font-bold tracking-widest text-[var(--color-ink-subtle)]',
} as const

/**
 * Bubble announcing new courses, floating beside the page
 * @type {Record<string, string>}
 */

export const COURSE_UNLOCK = {
  root: 'surface-enter fixed right-6 bottom-6 z-[60] flex w-[min(22rem,calc(100vw-3rem))] flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-lg)]',
  head: 'flex items-start gap-3',
  glyph: 'size-8 shrink-0 text-[var(--color-ink-accent)]',
  title: 'min-w-0 flex-1 text-body leading-snug font-bold tracking-tight',
  close:
    'flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-full)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  closeIcon: 'size-4',
  text: 'text-sm text-[var(--color-ink-subtle)]',
  action:
    'self-start rounded-[var(--radius-full)] bg-[var(--color-brand-600)] px-5 py-2.5 text-sm font-bold text-[var(--color-on-brand)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
} as const

/**
 * Reader of one course
 * @type {Record<string, string>}
 */

export const COURSE_PLAYER = {
  page: 'mx-auto flex w-full max-w-6xl flex-col gap-8',
  back: 'inline-flex items-center gap-2 self-start text-sm font-semibold text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)] lg:hidden',
  // One chapter at a time
  stage: 'flex min-w-0 flex-col gap-10',
  // Screen and its footer
  body: 'flex flex-col gap-16',
  // Screen on display, anchored at the top so writing never moves it
  step: 'flex min-h-[55dvh] shrink-0 flex-col justify-start gap-8',
  // A wide gap between two subjects
  blocks: 'flex flex-col gap-16',
  // Reading column of an ordinary block
  column: 'mx-auto w-full max-w-4xl text-lg',
  // Words take the whole width of the page
  lead: 'w-full',
  // A box with a figure on its corner
  beside: 'relative flex flex-col gap-6 lg:block',
  // Back on the left, on to the next on the right, what is missing under both
  foot: 'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[var(--color-border)] pt-6 pb-6',
  footGlyph: 'size-4',
  footHint: 'basis-full text-center text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Read-only blocks of a chapter
 * @type {Record<string, string>}
 */

export const COURSE_READ = {
  text: 'text-xl leading-relaxed',
  // A subject: a heading, then its words
  section: 'flex flex-col gap-4',
  heading: 'text-2xl font-bold tracking-tight',
  // A subject's words on a quiet panel
  panel: `flex flex-col gap-8 ${COURSE_PANEL} p-5 sm:p-6`,
  // Note: a quiet panel, a chip for the glyph, a property title
  callout: `flex items-start gap-4 ${COURSE_PANEL} p-5 sm:p-6`,
  calloutChip:
    'grid size-10 shrink-0 place-items-center rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)]',
  // Inside a panel: smaller, a touch darker than the panel around it
  calloutNested:
    'gap-3 bg-[color-mix(in_srgb,var(--color-ink)_5%,color-mix(in_srgb,var(--color-surface-sunken)_40%,var(--color-surface)))] p-4 sm:p-4',
  calloutChipNested: 'size-8',
  calloutTextNested: 'text-base',
  calloutIcon: 'size-5',
  // Chapters of the course, listed
  plan: 'flex flex-col gap-4',
  planTitle: 'text-xl font-bold tracking-tight',
  planList: 'flex flex-col gap-2',
  planItem: 'flex items-baseline gap-4 text-lg font-semibold',
  planIndex: 'w-6 shrink-0 text-base font-bold tabular-nums text-[var(--color-ink-subtle)]',
  calloutBody: 'flex min-w-0 flex-col gap-1.5',
  calloutTitle: `${PROPERTY_LABEL} pt-1`,
  calloutText: 'text-lg leading-relaxed text-[var(--color-ink-subtle)]',
  ask: 'flex flex-col gap-6',
  askPrompt: 'text-2xl font-bold tracking-tight',
  askActions: 'flex flex-wrap gap-3',
  // Aside under the buttons, no panel of its own
  askNote: 'text-base text-[var(--color-ink-subtle)]',
  steps: 'flex flex-col',
  stepsTitle: 'mb-4 text-lg font-bold tracking-tight',
  step: 'relative flex gap-5 pb-8 last:pb-0',
  stepRail: 'absolute top-11 bottom-0 left-[1.1875rem] w-0.5 bg-[var(--color-border-strong)]',
  stepNode:
    'relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-600)] font-bold text-[var(--color-on-brand)] tabular-nums shadow-[var(--shadow-sm)]',
  stepBody: 'flex min-w-0 flex-col gap-1 pt-1.5',
  stepTitle: 'text-base font-bold tracking-tight',
  caption: `flex items-center justify-between gap-3 ${PROPERTY_LABEL}`,
  figure: 'flex flex-col gap-2',
} as const

/**
 * Twitch and YouTube chat mocks
 * @type {Record<string, string>}
 */

export const COURSE_CHAT = {
  panel: 'overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]',
  twitch: 'bg-[var(--twitch-background)] text-[var(--twitch-text)]',
  youtube: 'bg-[var(--youtube-background)] text-[var(--youtube-text)]',
  head: 'flex items-center justify-between gap-3 border-b border-[var(--color-on-media)]/10 px-4 py-2.5 text-xs font-bold tracking-wide uppercase',
  headTwitch: 'text-[var(--twitch-muted)]',
  headYoutube: 'text-[var(--youtube-muted)]',
  live: 'inline-flex items-center gap-2',
  liveMark: 'h-2 w-2 animate-pulse rounded-full bg-[var(--youtube-red)]',
  replay:
    'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-bold tracking-wide uppercase transition-colors hover:bg-[var(--color-on-media)]/10 focus-visible:outline-2 focus-visible:outline-[var(--color-on-media)]',
  body: 'flex min-h-28 flex-col gap-0.5 p-2',
  line: 'rounded-[var(--radius-sm)] px-2 py-1.5 text-body leading-snug break-words',
  lineIn: 'chat-line-in',
  flagged: 'bg-[var(--twitch-flag)] shadow-[inset_3px_0_0_var(--youtube-red)]',
  flaggedYoutube: 'bg-[var(--youtube-flag)] shadow-[inset_3px_0_0_var(--youtube-red)]',
  row: 'flex gap-3',
  avatar:
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[var(--color-on-media)]',
  badge:
    'mr-1.5 inline-block rounded-[3px] px-1 py-px align-middle font-[family-name:var(--font-mono)] text-micro leading-none font-bold text-[var(--color-on-accent)] uppercase',
  author: 'font-bold',
  authorYoutube: 'text-[var(--youtube-muted)]',
  colon: 'text-[var(--twitch-muted)]',
  typing: 'flex items-center gap-1 px-2 py-2',
  typingDot: 'chat-dot h-1.5 w-1.5 rounded-full bg-current opacity-60',
  empty: 'px-2 py-6 text-center text-sm opacity-70',
} as const

/**
 * Exercises
 * @type {Record<string, string>}
 */

export const COURSE_EXERCISE = {
  frame:
    'flex flex-col gap-5 rounded-[var(--radius-xl)] border-2 border-[var(--color-border)] card-surface p-5 shadow-[var(--shadow-sm)] transition-colors sm:p-7',
  // No card around it: a heading, then its parts
  bare: 'flex flex-col gap-8',
  bareTitle: COURSE_READ.heading,
  framePassed: 'border-[var(--color-success)]',
  frameFailed: 'border-[var(--color-danger)]',
  head: 'flex items-center gap-3',
  headIcon: 'h-6 w-6 shrink-0 text-[var(--color-ink-accent)]',
  kind: PROPERTY_LABEL,
  title: 'text-xl font-bold tracking-tight text-balance',
  body: 'flex flex-col gap-6',
  foot: 'flex flex-wrap items-center gap-3',
  result: 'flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-sm font-bold',
  resultPassed: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  resultFailed: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  resultIcon: 'h-5 w-5 shrink-0',
  pop: 'course-pop',
  shake: 'course-shake',
  explanation: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  prompt: 'text-base leading-relaxed font-semibold',
  question: 'flex flex-col gap-3',
  choices: 'flex flex-col gap-2',
  choice:
    'flex w-full items-start gap-3 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left text-sm font-medium transition-[border-color,transform,background-color] hover:-translate-y-px hover:border-[var(--color-border-strong)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] disabled:pointer-events-none',
  choicePicked: 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)]',
  choiceRight: 'border-[var(--color-success)] bg-[var(--color-success-soft)]',
  choiceWrong: 'border-[var(--color-danger)] bg-[var(--color-danger-soft)]',
  choiceMark:
    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 border-current text-[var(--color-ink-subtle)]',
  choiceRadio: 'rounded-full',
  choiceBox: 'rounded-[var(--radius-sm)]',
  fill: 'text-base leading-[2.6]',
  hole: 'mx-1 inline-block min-w-28 rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 py-0.5 text-center text-sm font-bold focus:border-solid focus:border-[var(--color-ink-subtle)] focus:outline-none',
  holeRight: 'border-solid border-[var(--color-success)] bg-[var(--color-success-soft)]',
  holeWrong: 'border-solid border-[var(--color-danger)] bg-[var(--color-danger-soft)]',
  bank: 'flex flex-wrap items-center gap-2',
  bankWord: 'rounded-full bg-[var(--color-surface-sunken)] px-3 py-1 text-xs font-bold',
  sortBoard: 'grid gap-4 sm:grid-cols-2',
  bucket:
    'flex min-h-32 flex-col gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border-strong)] p-3 transition-colors',
  bucketOver: 'border-solid border-[var(--color-brand-600)] bg-[var(--color-brand-50)]',
  bucketTitle: PROPERTY_LABEL,
  pool: 'flex min-h-14 flex-wrap gap-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)] p-3',
  chip: 'cursor-grab select-none rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2 text-sm font-semibold shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5 active:cursor-grabbing',
  chipHeld: 'border-[var(--color-brand-600)] ring-2 ring-[var(--color-pick)]',
  chipRight: 'border-[var(--color-success)]',
  chipWrong: 'border-[var(--color-danger)]',
  orderList: 'flex flex-col gap-2',
  orderRow:
    'flex items-center gap-3 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-semibold',
  orderIndex:
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-xs font-bold tabular-nums',
  orderLabel: 'min-w-0 flex-1',
  orderMoves: 'flex items-center gap-1',
  simContext: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  simStage: 'flex flex-col gap-8',
  simStep: 'flex flex-col gap-4',
  simCount: PROPERTY_LABEL,
  simOptions: 'flex flex-col gap-2',
  feedback: 'flex items-start gap-3 rounded-[var(--radius-md)] px-4 py-3 text-sm leading-relaxed',
  open: 'min-h-28 w-full resize-y rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm leading-relaxed focus:border-[var(--color-ink-subtle)] focus:outline-none',
  expert:
    'rounded-[var(--radius-md)] border-l-4 border-[var(--color-brand-600)] bg-[var(--color-surface)] p-4 text-sm leading-relaxed',
  expertLabel: `${PROPERTY_LABEL} mb-1 block text-[var(--color-brand-800)]`,
  command:
    'w-full rounded-[var(--radius-md)] border-2 border-[var(--discord-code-border)] bg-[var(--discord-background)] px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-[var(--discord-text)] placeholder:text-[var(--discord-muted)] focus:border-[var(--discord-blurple)] focus:outline-none',
  hint: 'text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Screen closing a course
 * @type {Record<string, string>}
 */

export const COURSE_COMPLETE = {
  wrap: 'flex flex-col items-center gap-8 py-10 text-center',
  // The name of the course
  card: 'relative flex max-w-full items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface px-6 py-5 shadow-[var(--shadow-md)]',
  mark: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-[var(--color-on-media)]',
  markIcon: 'h-6 w-6',
  name: 'relative text-lg font-bold tracking-tight text-balance sm:text-2xl',
  strike: 'course-strike absolute top-1/2 left-0 h-0.5 w-full origin-left bg-[var(--color-ink)]',
  title: 'course-bravo max-w-xl text-2xl font-bold tracking-tight text-balance sm:text-3xl',
  // Bubble that pops in last
  bubble:
    'course-bubble relative flex max-w-md items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-info-soft)] px-5 py-3 text-sm font-semibold text-[var(--color-info)] shadow-[var(--shadow-sm)]',
  bubbleTail:
    'absolute -top-1.5 left-8 h-3 w-3 rotate-45 border-t border-l border-[var(--color-border)] bg-[var(--color-info-soft)]',
} as const

/**
 * Legacy pages
 * @type {Record<string, string>}
 */

export const LEGACY_BOARD = {
  page: 'mx-auto flex w-full max-w-5xl flex-col gap-8',
  list: 'flex flex-col',
  empty: 'px-1 text-[var(--color-ink-subtle)] italic',
  row: 'group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 rounded-[var(--radius-lg)] border-t border-[var(--color-border)] px-3 py-4 transition-colors first:border-t-0 hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] md:grid-cols-[auto_minmax(0,1fr)_16rem_9rem]',
  person: 'flex min-w-0 flex-col',
  name: 'truncate text-lg font-bold tracking-tight',
  meta: 'truncate text-sm text-[var(--color-ink-subtle)]',
  score: 'col-span-2 flex items-center gap-3 md:col-span-1',
  scoreTrack: 'relative h-2.5 flex-1 rounded-full bg-[var(--color-border)]',
  scoreFill: 'absolute inset-y-0 left-0 rounded-full bg-[var(--color-brand-600)]',
  scoreFillDone: 'bg-[var(--color-success)]',
  scoreMark: 'absolute -inset-y-1 border-l-2 border-[var(--color-ink)]',
  scoreFigure: 'w-14 shrink-0 text-right text-sm font-bold tabular-nums',
  status: 'col-span-2 text-sm font-semibold md:col-span-1 md:text-right',
} as const

/**
 * One track opened: a gauge of the points beside the modules
 * @type {Record<string, string>}
 */

export const LEGACY_TRACK = {
  page: 'mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[27.5rem_minmax(0,1fr)] lg:items-start',
  summary:
    'flex flex-col gap-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-7 lg:sticky lg:top-4',
  person: 'flex items-center gap-4',
  name: 'text-2xl leading-tight font-bold tracking-tight',
  trade: 'text-sm text-[var(--color-ink-subtle)]',
  statusClosed: 'text-sm font-semibold',
  gauge: 'w-full',
  gaugeTrack: 'stroke-[var(--color-border)]',
  gaugeFill:
    'stroke-[var(--color-brand-600)] transition-[stroke-dasharray] duration-[var(--motion-duration-celebrate)] ease-out',
  gaugeFillDone: 'stroke-[var(--color-success)]',
  gaugeMark: 'stroke-[var(--color-ink)]',
  gaugeFigure: 'fill-[var(--color-ink)] text-8xl font-bold tracking-tight',
  gaugeUnit: 'fill-[var(--color-ink-subtle)] text-body font-semibold',
  gaugeNumber: 'fill-[var(--color-ink-subtle)] text-xs font-bold',
  gaugeThreshold: 'fill-[var(--color-ink)] text-caption font-bold',
  facts: 'flex flex-col border-t border-[var(--color-border)]',
  fact: 'flex items-center gap-3 border-b border-[var(--color-border)] py-3.5 text-body last:border-b-0',
  factIcon: 'h-[18px] w-[18px] shrink-0 text-[var(--color-ink-accent)]',
  factLabel: 'flex-1 text-[var(--color-ink-subtle)]',
  factValue: 'font-bold tabular-nums',
  actions: 'flex flex-col gap-2.5',
  modules: 'flex flex-col gap-5',
  module:
    'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-6',
  moduleHead: 'flex min-w-0 items-center gap-2.5',
  moduleName: 'text-xl leading-tight font-bold tracking-tight',
  moduleCheck: 'h-5 w-5 shrink-0 text-[var(--color-success)]',
  moduleScore: 'flex items-baseline gap-1.5 justify-self-end',
  scoreFigure: 'text-4xl leading-none font-bold tabular-nums',
  scoreMax: 'text-caption font-bold text-[var(--color-ink-subtle)]',
  bar: 'relative col-span-2 mt-2 mb-5 h-2.5 rounded-full bg-[var(--color-border)]',
  barFill: 'absolute inset-y-0 left-0 rounded-full bg-[var(--color-brand-600)]',
  barDone: 'bg-[var(--color-success)]',
  barMark: 'absolute -inset-y-1 border-l-2 border-[var(--color-ink)]',
  barMarkLabel:
    'absolute top-5 -translate-x-1/2 text-micro font-bold tracking-wide whitespace-nowrap text-[var(--color-ink-subtle)] uppercase',
  moduleMeta: 'text-sm text-[var(--color-ink-subtle)]',
  moduleAction: 'justify-self-end',
} as const

/**
 * Chapters listed in the left sidebar while a course is open
 * @type {Record<string, string>}
 */

export const COURSE_RAIL = {
  wrap: 'flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto',
  back: 'flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 text-sm font-semibold transition-colors hover:bg-[var(--color-hover)]',
  head: 'flex flex-col gap-1 px-2',
  surface: `flex items-center gap-2 ${PROPERTY_LABEL}`,
  name: 'text-base leading-snug font-bold text-balance',
  // Plain line through the course, solid as it is read
  list: 'relative flex flex-col gap-1 pr-3 pl-5',
  track: 'absolute inset-y-3 left-1 w-px bg-[var(--color-border-strong)]',
  trackFill:
    'absolute inset-x-0 top-0 w-px bg-[var(--color-ink-accent)] transition-[height] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)]',
  item: 'relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm font-medium',
  itemOpen: 'cursor-pointer transition-colors hover:bg-[var(--color-hover)]',
  itemLocked: 'cursor-not-allowed text-[var(--color-ink-subtle)]',
  itemNow: 'font-bold',
  // Chapter number
  index:
    'relative grid size-6 shrink-0 place-items-center rounded-[var(--radius-sm)] text-caption font-bold tabular-nums',
  indexDone: 'text-[var(--color-ink-subtle)]',
  indexNow: 'text-[var(--color-ink)]',
  // Box of the screen being read, swells and fades away
  ping: 'course-echo absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--color-ink)]',
  indexNext: 'text-[var(--color-ink-subtle)]',
  title: 'min-w-0 leading-snug',
  titleNow: 'font-bold',
  // Screens under the open chapter, one segment each
  steps: 'mt-1 mb-2 ml-3 flex flex-col gap-0.5',
  stepItem:
    'flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-1 text-left text-xs font-medium text-[var(--color-ink-subtle)]',
  stepOpen:
    'cursor-pointer transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  stepNow: 'font-bold text-[var(--color-ink)]',
  stepLocked: 'cursor-not-allowed opacity-60',
  stepNumber:
    'relative grid h-5 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] text-[0.6875rem] font-semibold tabular-nums',
  stepNumberDone: 'text-[var(--color-ink-subtle)]',
  stepNumberNow:
    'bg-[var(--color-surface-raised)] text-[var(--color-ink)] ring-1 ring-[var(--color-ink)]',
} as const

/**
 * Colour families of the illustrations
 * @type {Record<string, string>}
 */

export const COURSE_TONES = {
  neutral: 'bg-[var(--color-surface-sunken)] text-[var(--color-ink)]',
  brand: 'bg-[var(--color-brand-100)] text-[var(--color-brand-800)]',
  info: 'bg-[var(--color-info-soft)] text-[var(--color-info)]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  caution: 'bg-[var(--color-caution-soft)] text-[var(--color-caution)]',
  danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
} as const

/**
 * Text colour of a role name
 * @type {Record<string, string>}
 */

export const COURSE_TONE_TEXT = {
  neutral: 'text-[var(--color-ink)]',
  brand: 'text-[var(--color-ink-accent)]',
  info: 'text-[var(--color-info)]',
  success: 'text-[var(--color-success)]',
  caution: 'text-[var(--color-caution)]',
  danger: 'text-[var(--color-danger)]',
} as const

/**
 * Colour of the bold words of a text
 * @type {Record<string, string>}
 */

export const COURSE_STRONG_TONES = {
  neutral: '',
  brand: '[&_strong]:text-[var(--color-ink-accent)]',
  info: '[&_strong]:text-[var(--color-info)]',
  success: '[&_strong]:text-[var(--color-success)]',
  caution: '[&_strong]:text-[var(--color-caution)]',
  danger: '[&_strong]:text-[var(--color-danger)]',
} as const

/**
 * Key points
 * @type {Record<string, string>}
 */

export const COURSE_FIGURE = {
  keypoints: 'flex flex-col gap-4',
  keypointsTitle: 'text-lg font-bold tracking-tight',
  keypointsGrid: 'grid gap-4 sm:grid-cols-3',
  keypoint:
    'course-pop flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-5 shadow-[var(--shadow-sm)]',
  disc: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
  discIcon: 'h-6 w-6',
  keypointTitle: 'text-base font-bold tracking-tight',
  keypointBody: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  diagram: 'flex flex-col gap-5',
  diagramTitle: 'text-lg font-bold tracking-tight',
  diagramTrack:
    'flex flex-col items-stretch gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:flex-row sm:items-start sm:gap-2',
  diagramNode:
    'course-pop flex min-w-0 flex-1 flex-row items-center gap-3 sm:flex-col sm:text-center',
  diagramLabel: 'text-sm leading-snug font-bold text-balance',
  diagramNote: 'text-xs leading-snug text-[var(--color-ink-subtle)]',
  diagramLink:
    'course-pop flex shrink-0 items-center justify-center self-center text-[var(--color-ink-subtle)] max-sm:rotate-90 sm:mt-4',
  diagramCaption: 'text-center text-xs text-[var(--color-ink-subtle)]',
  compare: 'flex flex-col gap-4',
  compareTitle: 'text-lg font-bold tracking-tight',
  compareGrid: 'grid gap-4 sm:grid-cols-2',
  compareSide: 'flex flex-col gap-3 rounded-[var(--radius-xl)] border-2 p-5',
  compareGood: 'border-[var(--color-success)] bg-[var(--color-success-soft)]',
  compareBad: 'border-[var(--color-danger)] bg-[var(--color-danger-soft)]',
  compareHead: 'flex items-center gap-2 text-sm font-bold tracking-wide uppercase',
  compareList: 'flex flex-col gap-2 text-sm leading-snug',
  compareItem: 'flex gap-2',
} as const

/**
 * Guided demonstration of the moderator view
 * @type {Record<string, string>}
 */

export const COURSE_DEMO = {
  wrap: 'flex flex-col gap-3',
  head: 'flex items-center justify-between gap-3',
  title: 'text-lg font-bold tracking-tight',
  count: PROPERTY_LABEL,
  stage: 'grid gap-3 lg:grid-cols-[minmax(0,1fr)_13rem]',
  chat: 'min-w-0',
  tools:
    'flex flex-col gap-2 rounded-[var(--radius-lg)] bg-[var(--twitch-background)] p-3 text-[var(--twitch-text)] shadow-[var(--shadow-md)]',
  toolsYoutube: 'bg-[var(--youtube-background)] text-[var(--youtube-text)]',
  toolsTitle: 'text-xs font-bold tracking-wide text-[var(--twitch-muted)] uppercase',
  tool: 'flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-on-media)]/15 px-3 py-2 text-sm font-semibold transition-colors',
  toolOn: 'demo-pulse border-[var(--color-on-media)] bg-[var(--color-on-media)]/15',
  toolDim: 'opacity-55',
  toolIcon: 'h-4 w-4 shrink-0',
  lineFocus: 'demo-focus',
  lineDeleted: 'demo-deleted',
  tag: 'demo-tag-in ml-2 inline-block rounded-[3px] px-1.5 py-px align-middle font-[family-name:var(--font-mono)] text-micro leading-none font-bold text-[var(--color-on-accent)] uppercase',
  tagWarn: 'bg-[var(--color-caution)]',
  tagTimeout: 'bg-[var(--color-info)]',
  tagBan: 'bg-[var(--color-danger)]',
  composer:
    'flex items-center gap-2 border-t border-[var(--color-on-media)]/10 px-3 py-2.5 font-[family-name:var(--font-mono)] text-sm',
  composerText: 'demo-type overflow-hidden whitespace-nowrap',
  coach:
    'flex items-start gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-info-soft)] p-4 text-sm leading-relaxed text-[var(--color-ink)]',
  coachDisc:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-info)] text-[var(--color-on-media)]',
  controls: 'flex flex-wrap items-center gap-3',
  dots: 'flex flex-1 items-center gap-1.5',
  dot: 'h-1.5 w-6 rounded-full bg-[var(--color-border-strong)] transition-colors duration-[var(--motion-duration-panel)]',
  dotOn: 'bg-[var(--color-info)]',
} as const

/**
 * Reviews of a training
 * @type {Record<string, string>}
 */

export const TRAINING_FEEDBACK = {
  stack: 'flex flex-col gap-6',
  marks: 'grid gap-4 sm:grid-cols-2',
  mark: 'flex flex-col gap-1',
  markLabel: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  markValue: 'text-3xl font-bold tracking-tight tabular-nums',
  list: 'flex flex-col',
  row: 'grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-t border-[var(--color-border)] py-4 first:border-t-0',
  head: 'flex flex-wrap items-baseline gap-x-3 text-sm',
  name: 'font-bold',
  meta: 'text-[var(--color-ink-subtle)] tabular-nums',
  comment: 'col-start-2 text-sm whitespace-pre-line',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Voice channel animation
 * @type {Record<string, string>}
 */

export const COURSE_VOICE = {
  // Straddles the bottom right corner
  list: 'flex w-full flex-col gap-0.5 rounded-[var(--radius-xl)] bg-[var(--discord-sidebar)] p-3 text-[var(--discord-channel)] shadow-[var(--shadow-md)] lg:absolute lg:right-0 lg:bottom-0 lg:z-10 lg:w-64 lg:translate-x-[20%] lg:translate-y-[30%] lg:rotate-2',
  channel: 'replica-channel-in flex flex-col gap-0.5',
  row: 'flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 font-semibold',
  rowIcon: 'h-5 w-5 shrink-0 opacity-80',
  member:
    'replica-channel-in flex items-center gap-2 rounded-[var(--radius-sm)] py-0.5 pr-2 pl-8 text-sm text-[var(--discord-text)]',
  avatar: 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
} as const

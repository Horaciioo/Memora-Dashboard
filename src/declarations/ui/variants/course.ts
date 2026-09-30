import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Catalogue of interactive courses
 * @type {Record<string, string>}
 */

export const COURSE_CATALOG = {
  page: 'mx-auto flex w-full max-w-6xl flex-col gap-14',
  group: 'flex flex-col gap-6',
  head: 'flex flex-col gap-1',
  title: 'text-2xl font-black tracking-tight sm:text-3xl',
  lead: 'text-sm text-[var(--color-ink-subtle)]',
  grid: 'grid gap-8 sm:grid-cols-2 xl:grid-cols-3',
  // The tilt lives on the wrapper, the card keeps its own hover
  tilt: 'block [transform-style:preserve-3d]',
  card: 'group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-left shadow-[var(--shadow-sm)] transition-shadow duration-[var(--motion-duration-moderate)] hover:shadow-[var(--shadow-lg)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-600)]',
  body: 'flex flex-1 flex-col gap-3 p-5',
  surface: `flex items-center gap-2 ${PROPERTY_LABEL}`,
  name: 'text-lg leading-snug font-black tracking-tight text-balance',
  summary: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  foot: 'mt-auto flex items-center justify-between gap-3 pt-2 text-xs text-[var(--color-ink-subtle)]',
  meta: 'flex items-center gap-3 font-[family-name:var(--font-mono)] tabular-nums',
  action: 'text-sm font-bold text-[var(--color-brand-800)]',
  // Animated cover, chat lines drifting upward behind a glyph that floats above them
  cover:
    'relative flex h-36 items-center justify-center overflow-hidden [transform-style:preserve-3d]',
  coverLines: 'absolute inset-0 flex justify-center gap-6 px-6 opacity-90',
  coverColumn: 'flex flex-col gap-3 pt-3',
  coverBar: 'h-2.5 rounded-full bg-white/55',
  coverIcon:
    'relative h-16 w-16 text-white drop-shadow-[0_10px_14px_rgb(0_0_0/0.35)] transition-transform duration-[var(--motion-duration-moderate)] [transform:translateZ(44px)] group-hover:[transform:translateZ(60px)_rotate(-6deg)_scale(1.08)]',
  ring: 'absolute right-4 bottom-4 h-12 w-12',
} as const

/**
 * Reader of one course
 * @type {Record<string, string>}
 */

export const COURSE_PLAYER = {
  page: 'mx-auto flex w-full max-w-4xl flex-col gap-8',
  back: 'inline-flex items-center gap-2 self-start text-sm font-semibold text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)] lg:hidden',
  hero: 'relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-xl)] p-8 text-white shadow-[var(--shadow-md)] sm:p-10',
  heroSurface: `flex items-center gap-2 ${PROPERTY_LABEL} text-white/85`,
  heroTitle: 'max-w-3xl text-3xl leading-tight font-bold tracking-tight text-balance sm:text-5xl',
  heroSummary: 'max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg',
  heroMeta:
    'flex flex-wrap gap-x-5 gap-y-1 font-[family-name:var(--font-mono)] text-xs tracking-wide text-white/85 uppercase',
  // One chapter at a time, sliding in from the side it came from
  stage: 'flex min-w-0 flex-col gap-10',
  slideForward: 'course-slide-forward',
  slideBack: 'course-slide-back',
  chapterHead: 'flex flex-col gap-2',
  chapterCount: PROPERTY_LABEL,
  chapterTitle: 'text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl',
  blocks: 'flex max-w-3xl flex-col gap-8',
  // Thin rule that stops short of both edges
  foot: 'flex flex-col items-center gap-4 pb-6',
  rule: 'h-px w-[calc(100%-4rem)] bg-[var(--color-border)]',
  footHint: 'text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Read-only blocks of a chapter
 * @type {Record<string, string>}
 */

export const COURSE_READ = {
  text: 'max-w-prose text-base leading-relaxed',
  callout: 'flex gap-4 rounded-[var(--radius-lg)] border-2 p-5',
  calloutIcon: 'mt-0.5 h-6 w-6 shrink-0',
  calloutBody: 'flex min-w-0 flex-col gap-1',
  calloutTitle: 'text-base font-black tracking-tight',
  steps: 'flex flex-col',
  stepsTitle: 'mb-4 text-lg font-black tracking-tight',
  step: 'relative flex gap-5 pb-8 last:pb-0',
  stepRail: 'absolute top-11 bottom-0 left-[1.1875rem] w-0.5 bg-[var(--color-border-strong)]',
  stepNode:
    'relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-600)] font-black text-[var(--color-on-brand)] tabular-nums shadow-[var(--shadow-sm)]',
  stepBody: 'flex min-w-0 flex-col gap-1 pt-1.5',
  stepTitle: 'text-base font-black tracking-tight',
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
  head: 'flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 text-xs font-bold tracking-wide uppercase',
  headTwitch: 'text-[var(--twitch-muted)]',
  headYoutube: 'text-[var(--youtube-muted)]',
  live: 'inline-flex items-center gap-2',
  liveMark: 'h-2 w-2 animate-pulse rounded-full bg-[var(--youtube-red)]',
  replay:
    'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-bold tracking-wide uppercase transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white',
  body: 'flex min-h-28 flex-col gap-0.5 p-2',
  line: 'rounded-[var(--radius-sm)] px-2 py-1.5 text-[0.9375rem] leading-snug break-words',
  lineIn: 'chat-line-in',
  flagged: 'bg-[var(--twitch-flag)] shadow-[inset_3px_0_0_var(--youtube-red)]',
  flaggedYoutube: 'bg-[var(--youtube-flag)] shadow-[inset_3px_0_0_var(--youtube-red)]',
  row: 'flex gap-3',
  avatar:
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white',
  badge:
    'mr-1.5 inline-block rounded-[3px] px-1 py-px align-middle font-[family-name:var(--font-mono)] text-[0.625rem] leading-none font-bold text-black uppercase',
  author: 'font-bold',
  authorYoutube: 'text-[var(--youtube-muted)]',
  colon: 'text-[var(--twitch-muted)]',
  typing: 'flex items-center gap-1 px-2 py-2',
  typingDot: 'chat-dot h-1.5 w-1.5 rounded-full bg-current opacity-60',
  empty: 'px-2 py-6 text-center text-sm opacity-70',
} as const

/**
 * Exercises, their frame and their inputs
 * @type {Record<string, string>}
 */

export const COURSE_EXERCISE = {
  frame:
    'flex flex-col gap-5 rounded-[var(--radius-xl)] border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-sm)] transition-colors sm:p-7',
  framePassed: 'border-[var(--color-success)]',
  frameFailed: 'border-[var(--color-danger)]',
  head: 'flex items-center gap-3',
  headIcon: 'h-6 w-6 shrink-0 text-[var(--color-brand-600)]',
  kind: PROPERTY_LABEL,
  title: 'text-xl font-black tracking-tight text-balance',
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
    'flex w-full items-start gap-3 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left text-sm font-medium transition-[border-color,transform,background-color] hover:-translate-y-px hover:border-[var(--color-brand-400)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-600)] disabled:pointer-events-none',
  choicePicked: 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)]',
  choiceRight: 'border-[var(--color-success)] bg-[var(--color-success-soft)]',
  choiceWrong: 'border-[var(--color-danger)] bg-[var(--color-danger-soft)]',
  choiceMark:
    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 border-current text-[var(--color-ink-subtle)]',
  choiceRadio: 'rounded-full',
  choiceBox: 'rounded-[var(--radius-sm)]',
  fill: 'text-base leading-[2.6]',
  hole: 'mx-1 inline-block min-w-28 rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 py-0.5 text-center text-sm font-bold focus:border-solid focus:border-[var(--color-brand-600)] focus:outline-none',
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
  chipHeld: 'border-[var(--color-brand-600)] ring-2 ring-[var(--color-brand-400)]',
  chipRight: 'border-[var(--color-success)]',
  chipWrong: 'border-[var(--color-danger)]',
  orderList: 'flex flex-col gap-2',
  orderRow:
    'flex items-center gap-3 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-semibold',
  orderIndex:
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-xs font-black tabular-nums',
  orderLabel: 'min-w-0 flex-1',
  orderMoves: 'flex items-center gap-1',
  simContext: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  simStage: 'flex flex-col gap-8',
  simStep: 'flex flex-col gap-4',
  simCount: PROPERTY_LABEL,
  simOptions: 'flex flex-col gap-2',
  feedback: 'flex items-start gap-3 rounded-[var(--radius-md)] px-4 py-3 text-sm leading-relaxed',
  open: 'min-h-28 w-full resize-y rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm leading-relaxed focus:border-[var(--color-brand-600)] focus:outline-none',
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
  // The name of the course, its check drawn in front then a line struck through
  card: 'relative flex max-w-full items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-6 py-5 shadow-[var(--shadow-md)]',
  mark: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white',
  markIcon: 'h-6 w-6',
  name: 'relative text-lg font-bold tracking-tight text-balance sm:text-2xl',
  strike: 'course-strike absolute top-1/2 left-0 h-0.5 w-full origin-left bg-[var(--color-ink)]',
  title: 'course-bravo max-w-xl text-2xl font-bold tracking-tight text-balance sm:text-3xl',
  // Bubble that pops in last, pointing back at the message
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
  page: 'mx-auto flex w-full max-w-6xl flex-col gap-10',
  grid: 'grid gap-8 sm:grid-cols-2 xl:grid-cols-3',
  tilt: 'block [transform-style:preserve-3d]',
  card: 'group relative flex h-full flex-col gap-5 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 text-left shadow-[var(--shadow-sm)] transition-shadow duration-[var(--motion-duration-moderate)] hover:shadow-[var(--shadow-lg)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand-600)]',
  cardHead: 'flex items-center gap-4',
  person: 'flex min-w-0 flex-1 flex-col gap-0.5',
  name: 'truncate text-lg font-black tracking-tight',
  meta: 'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-subtle)] uppercase',
  ring: 'relative flex h-16 w-16 shrink-0 items-center justify-center',
  ringLabel: 'absolute text-sm font-black tabular-nums',
  bars: 'flex flex-col gap-2',
  bar: 'flex items-center gap-3 text-xs text-[var(--color-ink-subtle)]',
  barTrack: 'h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]',
  barFill: 'h-full rounded-full bg-[var(--color-brand-600)]',
  barLabel: 'w-28 shrink-0 truncate',
  foot: 'mt-auto flex items-center justify-between gap-3 text-xs',
} as const

/**
 * One track opened
 * @type {Record<string, string>}
 */

export const LEGACY_TRACK = {
  page: 'mx-auto flex w-full max-w-5xl flex-col gap-12',
  hero: 'flex flex-col items-center gap-4 text-center',
  heroName: 'text-4xl font-black tracking-tight text-balance sm:text-5xl',
  heroMeta:
    'flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-subtle)] uppercase',
  exempt: 'text-sm font-semibold text-[var(--color-brand-800)]',
  modules: 'grid gap-8 md:grid-cols-3',
  tilt: 'block [transform-style:preserve-3d]',
  module:
    'relative flex h-full flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-md)]',
  moduleName: 'text-xl leading-snug font-black tracking-tight text-balance',
  moduleSummary: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  score: 'flex items-baseline gap-2',
  scoreFigure:
    'font-[family-name:var(--font-display)] text-6xl leading-none font-black tabular-nums',
  scoreMax: 'text-sm font-bold text-[var(--color-ink-subtle)]',
  rows: 'flex flex-col divide-y divide-[var(--color-border)] text-sm',
  row: 'flex items-center justify-between gap-3 py-2',
  rowLabel: 'text-[var(--color-ink-subtle)]',
  rowValue: 'font-bold tabular-nums',
  verdict:
    'flex flex-col gap-6 rounded-[var(--radius-xl)] border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 sm:p-8',
  verdictReady: 'border-[var(--color-success)]',
  verdictTitle: 'text-2xl font-black tracking-tight',
  meters: 'grid gap-6 sm:grid-cols-2',
  meter: 'flex flex-col gap-2',
  meterHead: 'flex items-baseline justify-between gap-3',
  meterLabel: PROPERTY_LABEL,
  meterFigure: 'text-2xl font-black tabular-nums',
  actions: 'flex flex-wrap items-center justify-center gap-3',
} as const

/**
 * Horizontal timeline of a course: numbered circles joined by dashes that fill as the chapter is read
 * @type {Record<string, string>}
 */

export const COURSE_TIMELINE = {
  bar: 'sticky top-0 z-20 -mx-2 overflow-x-auto bg-[var(--color-background)]/90 px-2 py-3 backdrop-blur-sm',
  track: 'flex min-w-max items-center',
  node: 'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold tabular-nums transition-colors duration-[var(--motion-duration-panel)]',
  nodeDone: 'border-[var(--color-success)] bg-[var(--color-success)] text-white',
  nodeNow:
    'border-[var(--color-info)] bg-[var(--color-info)] text-white shadow-[0_0_0_4px_var(--color-info-soft)]',
  nodeNext:
    'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] text-[var(--color-ink-subtle)]',
  link: 'relative mx-2 h-0.5 min-w-10 flex-1 bg-[repeating-linear-gradient(90deg,var(--color-border-strong)_0_6px,transparent_6px_12px)]',
  fill: 'absolute inset-y-0 left-0 transition-[width] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-out)]',
  fillDone: 'bg-[repeating-linear-gradient(90deg,var(--color-success)_0_6px,transparent_6px_12px)]',
  fillNow: 'bg-[repeating-linear-gradient(90deg,var(--color-info)_0_6px,transparent_6px_12px)]',
} as const

/**
 * Chapters listed in the left sidebar while a course is open, upright and still
 * @type {Record<string, string>}
 */

export const COURSE_RAIL = {
  wrap: 'flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto',
  back: 'flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 text-sm font-semibold transition-colors hover:bg-[var(--color-hover)]',
  head: 'flex flex-col gap-1 px-2',
  surface: `flex items-center gap-2 ${PROPERTY_LABEL}`,
  name: 'text-base leading-snug font-bold text-balance',
  list: 'flex flex-col',
  item: 'relative flex items-start gap-3 rounded-[var(--radius-md)] px-2 pt-1.5 pb-5 text-left text-sm font-medium last:pb-1.5',
  itemOpen: 'cursor-pointer transition-colors hover:bg-[var(--color-hover)]',
  itemLocked: 'cursor-not-allowed opacity-60',
  node: 'relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold tabular-nums',
  nodeDone: 'border-[var(--color-success)] bg-[var(--color-success)] text-white',
  nodeNow: 'border-[var(--color-info)] bg-[var(--color-info)] text-white',
  nodeNext: 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]',
  line: 'absolute top-9 bottom-0 left-[1.3125rem] w-0 border-l-2 border-dashed',
  lineDone: 'border-[var(--color-success)]',
  lineNext: 'border-[var(--color-border-strong)]',
  title: 'min-w-0 pt-0.5 leading-snug',
  titleNow: 'font-bold',
} as const

/**
 * Colour families of the illustrations, a soft disc and its ink
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
 * Key points, diagrams and do and don't blocks
 * @type {Record<string, string>}
 */

export const COURSE_FIGURE = {
  keypoints: 'flex flex-col gap-4',
  keypointsTitle: 'text-lg font-bold tracking-tight',
  keypointsGrid: 'grid gap-4 sm:grid-cols-3',
  keypoint:
    'course-pop flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-sm)]',
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
  tool: 'flex items-center gap-2 rounded-[var(--radius-md)] border border-white/15 px-3 py-2 text-sm font-semibold transition-colors',
  toolOn: 'demo-pulse border-white bg-white/15',
  toolDim: 'opacity-55',
  toolIcon: 'h-4 w-4 shrink-0',
  lineFocus: 'demo-focus',
  lineDeleted: 'demo-deleted',
  tag: 'demo-tag-in ml-2 inline-block rounded-[3px] px-1.5 py-px align-middle font-[family-name:var(--font-mono)] text-[0.625rem] leading-none font-bold text-black uppercase',
  tagWarn: 'bg-[var(--color-caution)]',
  tagTimeout: 'bg-[var(--color-info)]',
  tagBan: 'bg-[var(--color-danger)]',
  composer:
    'flex items-center gap-2 border-t border-white/10 px-3 py-2.5 font-[family-name:var(--font-mono)] text-sm',
  composerText: 'demo-type overflow-hidden whitespace-nowrap',
  coach:
    'flex items-start gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-info-soft)] p-4 text-sm leading-relaxed text-[var(--color-ink)]',
  coachDisc:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-info)] text-white',
  controls: 'flex flex-wrap items-center gap-3',
  dots: 'flex flex-1 items-center gap-1.5',
  dot: 'h-1.5 w-6 rounded-full bg-[var(--color-border-strong)] transition-colors duration-[var(--motion-duration-panel)]',
  dotOn: 'bg-[var(--color-info)]',
} as const

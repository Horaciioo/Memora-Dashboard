import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Session tiles of the academy and the recruitments
 * @type {Record<string, string>}
 */

export const SESSION_TILE = {
  root: 'flex flex-col gap-10',
  group: 'flex flex-col gap-4',
  // Colour only says the state
  groupTitle: `accent-text ${PROPERTY_LABEL}`,
  grid: 'flex flex-col gap-3',
  tile: 'group relative flex min-h-28 cursor-pointer items-center gap-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-5 text-left transition-[background-color,box-shadow] hover:bg-[var(--color-hover)] hover:shadow-[var(--shadow-sm)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] sm:px-7',
  muted: 'opacity-60',
  glyph: 'size-14 shrink-0',
  body: 'flex min-w-0 flex-1 flex-col gap-1',
  title: 'truncate text-xl leading-tight font-bold tracking-tight',
  meta: 'truncate text-sm text-[var(--color-ink-subtle)]',
} as const

/**
 * Head of a session file
 * @type {Record<string, string>}
 */

export const FILE_HEAD = {
  root: 'flex flex-wrap items-start justify-between gap-x-6 gap-y-4',
  lead: 'flex min-w-0 items-center gap-4',
  glyph: 'size-12 shrink-0',
  body: 'flex min-w-0 flex-col gap-1.5',
  title: 'text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl',
  meta: 'flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-ink-subtle)]',
  actions: 'flex flex-wrap items-center gap-2',
} as const

/**
 * Boxes of a session overview
 * @type {Record<string, string>}
 */

export const FILE_BOX = {
  stack: 'flex flex-col gap-8',
  box: 'rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 sm:p-5',
  // Heading, box and the panel beside it
  row: 'grid grid-cols-1 gap-x-6 gap-y-3 lg:grid-cols-[minmax(0,1fr)_16rem]',
  rowTitle: 'lg:col-start-1',
  rowBox: 'min-w-0 lg:col-start-1',
  rowSide: 'flex flex-col lg:col-start-2 lg:row-start-2',
  main: 'min-w-0',
  people: 'grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2',
  person: 'flex flex-col gap-2',
  personTitle: PROPERTY_LABEL,
  personList: 'flex flex-wrap items-center gap-x-4 gap-y-2',
} as const

/**
 * Candidate cards of a session
 * @type {Record<string, string>}
 */

export const CANDIDATE_CARD = {
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  name: 'truncate font-bold tracking-tight',
  meta: 'truncate text-xs text-[var(--color-ink-subtle)]',
  metaEmpty: 'truncate pr-[0.2em] text-xs text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Glossary
 * @type {Record<string, string>}
 */

export const GLOSSARY_STYLES = {
  page: 'mx-auto flex w-full max-w-4xl flex-col gap-6',
  search: 'h-12 text-base',
  list: 'flex flex-col divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface shadow-[var(--shadow-sm)]',
  row: 'grid grid-cols-1 gap-1 px-6 py-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6',
  term: 'font-bold tracking-tight',
  definition: 'text-sm leading-relaxed text-[var(--color-ink-subtle)]',
  empty: 'py-10 text-center text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Candidate file: its body, its corner timeline
 * @type {Record<string, string>}
 */

export const CANDIDATE_FILE = {
  layout: 'grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]',
  body: 'flex min-w-0 flex-col gap-8',
  corner: 'lg:sticky lg:top-6 lg:order-last lg:self-start',
  observe:
    'inline-flex cursor-pointer items-center gap-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50',
  observeOn: 'text-[var(--color-ink-accent)]',
  observeOff: 'text-[var(--color-ink-subtle)]',
  observeGlyph: 'size-5',
} as const

/**
 * Interview calendar of a session
 * @type {Record<string, string>}
 */

export const INTERVIEW_AGENDA = {
  root: 'flex flex-col gap-8',
  bar: 'flex flex-wrap items-end justify-between gap-3',
  periodField: 'flex flex-col gap-3',
  periodNav: 'flex items-center gap-1.5',
  periodPicker: 'w-72 max-w-full',
  picture: 'overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
  actions: 'flex flex-wrap gap-3',
} as const

/**
 * Card scrolling inside the height of its box
 * @type {Record<string, string>}
 */

export const SCROLL_CARD = {
  root: 'relative min-h-40 flex-1',
  frame: 'flex max-h-96 flex-col overflow-hidden lg:absolute lg:inset-0 lg:max-h-none',
  scroll: 'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 py-1',
  title: PROPERTY_LABEL,
  // Content melts away where more lies below
  fade: '[mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)]',
} as const

/**
 * Announcement drawer of a session
 * @type {Record<string, string>}
 */

export const ANNOUNCEMENT_DRAWER = {
  split: 'grid grid-cols-1 gap-6 md:grid-cols-2',
  column: 'flex min-w-0 flex-col gap-3',
  head: 'flex min-h-9 items-center justify-between gap-3',
  label: PROPERTY_LABEL,
  // Same height as the preview beside it
  editor: 'min-h-80 flex-1 resize-none',
  preview:
    'flex min-h-80 flex-1 flex-col gap-3 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--discord-background)] pb-3',
  picture: 'mx-4 overflow-hidden rounded-[var(--radius-md)]',
  actions: 'flex flex-wrap gap-3',
  newBlock: 'mt-6 flex flex-col gap-3',
  hint: 'text-sm text-[var(--color-ink-subtle)]',
  newRow: 'grid grid-cols-1 items-center gap-3 md:grid-cols-[auto_1fr_12rem_auto]',
  newToken: 'font-mono text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Figures of the Moi tab
 * @type {Record<string, string>}
 */

export const MY_STATS = {
  title: 'text-2xl font-bold tracking-tight',
  grid: 'grid grid-cols-1 gap-4 md:grid-cols-2',
  card: 'flex min-h-72 min-w-0 flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-5 shadow-[var(--shadow-sm)]',
  cardTitle: 'text-lg font-bold tracking-tight',
  sentence: 'text-sm text-[var(--color-ink-subtle)]/80',
  person: 'inline-flex items-center gap-1.5 align-middle',
  figure: 'font-semibold text-[var(--color-ink)]',
  figureSuccess: 'font-semibold text-[var(--color-success)]',
  figureDanger: 'font-semibold text-[var(--color-danger)]',
  divider: 'h-px w-full shrink-0 bg-[var(--color-border)]',
  chart: 'flex flex-1 flex-col gap-2',
  plot: 'relative h-40 pr-8',
  gridline: 'absolute right-8 left-0 border-t border-[var(--color-border)]/70',
  baseline: 'absolute right-8 left-0 border-t border-[var(--color-border-strong)]',
  tick: 'absolute -right-8 w-7 -translate-y-1/2 text-right text-micro tabular-nums text-[var(--color-ink-subtle)]/80',
  columns: 'group/plot absolute inset-y-0 right-8 left-0 grid grid-flow-col auto-cols-fr',
  column:
    'group/col relative flex h-full items-end justify-center transition-opacity duration-150 group-hover/plot:opacity-35 hover:opacity-100!',
  barPlace: 'relative flex w-full max-w-3.5 justify-center',
  barStack:
    'flex size-full flex-col-reverse gap-0.5 overflow-hidden rounded-t-full rounded-b-[0.2rem]',
  bar: 'w-full min-h-1',
  barValue:
    'pointer-events-none absolute bottom-full mb-1.5 rounded-md bg-[var(--color-ink)] px-1.5 py-0.5 text-micro font-semibold tabular-nums text-[var(--color-surface)] opacity-0 transition-opacity group-hover/col:opacity-100',
  barValueLatest: 'opacity-100 group-hover/plot:opacity-0 group-hover/col:opacity-100!',
  areaSvg: 'absolute inset-y-0 right-8 left-0 h-full w-[calc(100%-2rem)] overflow-visible',
  areaDot:
    'group/dot absolute size-2.5 -translate-y-1/2 rounded-full border-2 bg-[var(--color-surface-raised)] transition-transform hover:scale-125',
  rows: 'flex flex-1 flex-col justify-center gap-2',
  row: 'flex items-center gap-3',
  rowLabel: 'w-14 shrink-0 text-micro font-medium tabular-nums text-[var(--color-ink-subtle)]',
  rowTrack: 'h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]/50',
  rowFill: 'block h-full min-w-3 rounded-full',
  rowValue: 'w-12 shrink-0 text-right text-xs font-semibold tabular-nums',
  splitHalfUp: 'flex h-1/2 w-full max-w-3.5 items-end',
  splitHalfDown: 'absolute top-1/2 flex h-1/2 w-full max-w-3.5 items-start',
  splitUp: 'w-full min-h-1 rounded-t-full rounded-b-[0.2rem]',
  splitDown: 'w-full min-h-1 rounded-b-full rounded-t-[0.2rem]',
  axis: 'grid grid-flow-col auto-cols-fr pr-8',
  barLabel:
    'whitespace-nowrap text-center text-micro font-medium tabular-nums text-[var(--color-ink-subtle)]',
  empty:
    'flex flex-1 flex-col items-center justify-center gap-2 text-sm italic text-[var(--color-ink-subtle)]',
  duo: 'flex flex-1 flex-col items-center justify-end gap-1',
  duoStack: 'flex items-center -space-x-1.5',
  duoColumn: 'w-6 rounded-t-full bg-[var(--color-brand-500)]',
  duoSessions: 'text-xs text-[var(--color-ink-subtle)]/80',
  ringsSvg: 'size-64 shrink-0 rotate-90',
} as const

/**
 * Day agenda of the Me tab
 * @type {Record<string, string>}
 */

export const MY_DAY = {
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  slot: 'flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-3 text-left transition-colors hover:bg-[var(--color-hover)]',
  done: 'text-[var(--color-ink-subtle)] line-through',
  clock: 'w-12 shrink-0 text-sm font-bold tabular-nums',
  name: 'min-w-0 flex-1 truncate font-semibold',
  empty: 'text-sm italic text-[var(--color-ink-subtle)]',
  row: 'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]',
  // Spacer takes the height of a title
  ringsColumn: 'flex flex-col gap-3',
  ringsSpacer: 'invisible hidden text-2xl font-bold tracking-tight select-none lg:block',
  ringsBody: 'flex flex-1 items-center justify-center',
} as const

/**
 * Compact identity rail of a candidate
 * @type {Record<string, string>}
 */

export const CANDIDATE_RAIL = {
  head: 'flex items-center gap-3 px-4 pt-3 text-left md:flex-col md:gap-1 md:pt-3 md:text-center',
  portrait: 'md:h-14 md:w-14 md:text-lg',
  name: 'text-lg font-bold tracking-tight break-words',
  back: 'absolute top-1/2 left-0 flex -translate-y-1/2 cursor-pointer items-center gap-2 py-2 text-sm font-semibold text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
} as const

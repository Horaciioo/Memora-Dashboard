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
  root: 'flex flex-col gap-4',
  bar: 'flex flex-wrap items-center gap-3',
  period: 'min-w-44 text-center text-sm font-semibold capitalize',
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

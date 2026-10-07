import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Home page layout
 * @type {Record<string, string>}
 */

export const HOME_STYLES = {
  // Two columns past lg
  grid: 'grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]',
  column: 'flex min-w-0 flex-col gap-8',
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex items-center gap-3 px-4 py-3 text-sm',
  rowLink:
    'flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-[var(--color-surface)] focus-visible:bg-[var(--color-surface)] focus-visible:outline-none',
  rowBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  rowTitle: 'truncate font-semibold',
  rowMeta: 'text-xs text-[var(--color-ink-subtle)]',
  // Mono day stamp
  stamp:
    'flex w-12 shrink-0 flex-col items-center font-[family-name:var(--font-mono)] leading-none tabular-nums',
  stampDay: 'text-lg font-bold',
  stampMonth: 'text-micro tracking-wide text-[var(--color-ink-subtle)] uppercase',
  // Today's row
  rowToday: 'bg-[var(--color-brand-50)]',
  marker: `flex shrink-0 items-center gap-1.5 ${PROPERTY_LABEL}`,
  markerIcon: 'h-3.5 w-3.5',
  empty: 'px-4 py-6 text-sm text-[var(--color-ink-subtle)] italic',
  // Rows without a frame
  rows: 'flex flex-col',
  // Hairline under each line but the last
  item: 'relative after:absolute after:inset-x-0 after:bottom-0 after:mx-auto after:h-px after:w-3/5 after:bg-[var(--color-border)] last:after:hidden',
  line: 'flex w-full items-center gap-4 rounded-[var(--radius-lg)] px-3 py-3 text-left transition-colors',
  lineLink:
    'cursor-pointer hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)] focus-visible:outline-none',
  chip: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-ink-accent)]',
  chipIcon: 'h-5 w-5',
  // Glyph opening a dated row
  rowGlyph: 'h-6 w-6 shrink-0',
  consoleIcon: 'h-6 w-6 shrink-0',
  // Urgent tiles
  urgentGrid: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
  urgentTile:
    'flex w-full cursor-pointer items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 text-left shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  urgentTitle: 'font-bold tracking-tight',
  urgentScope: 'text-xs font-semibold text-[var(--color-ink-subtle)]',
  urgentText: 'line-clamp-2 text-sm text-[var(--color-ink-subtle)]',
  // Urgent box
  urgentChip: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
  urgentReason: 'truncate text-xs text-[var(--color-ink-subtle)] italic',
  more: 'self-start rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  quiet: 'px-3 text-sm text-[var(--color-ink-subtle)]',
  chevron: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  actions: 'flex shrink-0 items-center gap-1',
} as const

/**
 * Home flow: the lives strip, the one thing to do now, what follows, what is coming
 * @type {Record<string, string>}
 */

export const HOME_FLOW = {
  // Reaches into the shell gutters, a little further where the shell caps its width
  page: 'flex flex-col gap-10 md:-mx-5 min-[1700px]:-mx-10',
  rest: 'flex items-center justify-center gap-3 py-4 text-sm font-semibold text-[var(--color-ink-subtle)]',
  restMark: 'h-6 w-6 shrink-0',
  // Latest note, one gold line
  news: 'group/news relative isolate flex items-center gap-4 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-gold-100)] via-[var(--color-gold-300)] to-[var(--color-gold-400)] px-4 py-3 text-black shadow-[var(--shadow-md)] ring-1 ring-white/40 ring-inset transition-shadow hover:shadow-[var(--shadow-lg)]',
  newsSheen:
    'pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/55 to-transparent transition-[left] duration-[var(--motion-duration-celebrate)] ease-out group-hover/news:left-full motion-reduce:transition-none',
  newsStar: 'relative h-9 w-9 shrink-0',
  newsBody: 'relative flex min-w-0 flex-1 flex-col',
  newsKicker: 'text-micro font-bold tracking-wide text-black/65 uppercase',
  newsTitle: 'truncate text-lg leading-tight font-bold tracking-tight',
  newsCta:
    'relative hidden shrink-0 rounded-full bg-black px-3 py-1.5 text-xs font-bold text-[var(--color-gold-100)] sm:inline-flex',
} as const

/**
 * Greeting under the banner
 * @type {Record<string, string>}
 */

export const HOME_HERO = {
  row: 'flex flex-wrap items-end justify-between gap-x-6 gap-y-2',
  words: 'flex min-w-0 flex-col gap-1',
  greeting: 'truncate text-4xl font-bold tracking-tight italic sm:text-5xl',
  hello: 'text-sm font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase italic',
  date: 'text-4xl font-bold tracking-tight text-[var(--color-ink-subtle)] italic first-letter:uppercase sm:text-5xl',
} as const

/**
 * Planned entries and coming birthdays
 * @type {Record<string, string>}
 */

export const HOME_PLAN = {
  list: 'flex flex-col',
  empty: 'text-sm text-[var(--color-ink-subtle)]',
  row: 'group flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2.5 text-sm transition-colors hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)] focus-visible:outline-none',
  when: 'w-14 shrink-0 text-xs font-bold text-[var(--color-ink-subtle)]',
  whenExact:
    'shrink-0 text-xs font-bold tabular-nums text-[var(--color-ink)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
  glyph: 'h-5 w-5 shrink-0',
  title: 'min-w-0 flex-1 truncate font-semibold',
  titleDone:
    'text-[var(--color-ink-subtle)] line-through decoration-2 decoration-[var(--color-ink-subtle)]/60',
  chevron:
    'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform group-hover:translate-x-0.5',
  more: 'mt-2 flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-bold text-[var(--color-ink-accent)] transition-colors hover:bg-[var(--color-hover)]',
  birthdayDate: 'shrink-0 text-sm font-bold',
  birthdayName: 'min-w-0 flex-1 truncate font-semibold',
} as const

/**
 * Big cards leading to the main areas
 * @type {Record<string, string>}
 */

export const HOME_CARDS = {
  grid: 'grid gap-4 md:grid-cols-3',
  card: 'group relative isolate flex h-48 flex-col justify-end overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] p-5 text-[var(--color-on-media)] shadow-[var(--shadow-md)] transition-[transform,box-shadow] duration-[var(--motion-duration-panel)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  image:
    'absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-[var(--motion-duration-slow)] group-hover:scale-105',
  shade: 'absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/25 to-black/5',
  tile: 'mb-3',
  glyph: 'h-8 w-8 drop-shadow-[0_1px_2px_rgb(0_0_0/0.4)]',
  title: 'text-2xl leading-tight font-bold tracking-tight',
  go: 'absolute top-5 right-5 transition-transform group-hover:translate-x-1',
  goGlyph: 'h-5 w-5 drop-shadow-[0_1px_2px_rgb(0_0_0/0.4)]',
} as const

/**
 * Card of a live in progress
 * @type {Record<string, string>}
 */

export const HOME_LIVE = {
  list: 'flex flex-col gap-6',
  card: 'live-card group relative isolate flex min-h-72 items-center gap-10 overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-live-100)] via-[var(--color-live-300)] to-[var(--color-live-400)] px-8 py-10 text-black shadow-[var(--shadow-lg)] ring-1 ring-white/40 ring-inset sm:px-14 sm:py-14',
  body: 'relative flex min-w-0 flex-1 flex-col gap-6',
  eyebrow: 'flex items-center gap-2.5 text-sm font-bold tracking-wide text-black/70 uppercase',
  pulse: 'live-pulse h-5 w-5',
  text: 'text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl',
  strong: 'font-bold',
  actions: 'flex flex-wrap items-center gap-3 pt-2',
  join: 'inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-base font-bold text-[var(--color-live-100)] shadow-[var(--shadow-md)] transition-transform hover:-translate-y-0.5',
  joinGlyph: 'h-4 w-4',
  logo: 'relative shrink-0',
  logoRing: 'live-halo absolute -inset-3 rounded-full border-2 border-white/60',
  logoImage: 'relative shadow-[var(--shadow-lg)] ring-8 ring-white/70',
} as const

/**
 * Grouped task lines of the home
 * @type {Record<string, string>}
 */

export const HOME_TASKS = {
  list: 'flex flex-col',
  row: 'group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-3 text-left transition-colors hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)] focus-visible:outline-none',
  glyph: 'h-6 w-6 shrink-0',
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  sentence: 'text-body',
  sentenceDone:
    'text-[var(--color-ink-subtle)] line-through decoration-2 decoration-[var(--color-ink-subtle)]/60',
  number: 'font-bold',
  chevron:
    'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform group-hover:translate-x-0.5',
} as const

/**
 * The three columns of the home in one central box
 * @type {Record<string, string>}
 */

export const HOME_BOARD = {
  card: 'card-surface grid rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] md:grid-cols-3',
  // The vertical divider stops short of the top and the bottom edges
  col: 'relative flex min-w-0 flex-col px-10 py-8 md:before:absolute md:before:inset-y-8 md:before:left-0 md:before:w-px md:before:bg-[var(--color-border)] md:first:before:hidden',
} as const

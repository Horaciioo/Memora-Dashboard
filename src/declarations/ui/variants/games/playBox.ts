import { PLAY_PANEL } from '@/declarations/ui/variants/games/play'

/**
 * Empty state of a Play box: glyph over one line
 * @type {Record<string, string>}
 */

export const PLAY_EMPTY = {
  root: 'flex flex-col items-center gap-3 rounded-[var(--radius-lg)] bg-play-nest px-6 py-8 text-center',
  // Inside a card that already is a box
  compact: 'bg-transparent px-2 py-4',
  icon: 'text-[var(--play-ink-faint)]',
  glyph: 'size-8',
  text: 'max-w-sm text-sm text-[var(--play-ink-soft)]',
} as const

/**
 * Setting rows of Play: groups on the panel, rows with a switch on the right
 * @type {Record<string, string>}
 */

export const PLAY_PREF = {
  group: 'flex flex-col gap-0.5 rounded-[var(--radius-lg)] bg-play-nest p-1.5',
  title: 'px-3 pt-1.5 pb-1 text-xs font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  row: 'flex min-h-12 items-center justify-between gap-4 rounded-xl px-3 py-2 transition-colors hover:bg-play-lift',
  text: 'flex min-w-0 flex-col gap-0.5',
  label: 'text-sm font-bold text-[var(--play-ink)]',
  hint: 'text-xs text-[var(--play-ink-soft)]',
} as const

/**
 * Play box: every block of a page sits in one
 * @type {Record<string, string>}
 */

export const PLAY_BOX = {
  groupGrid: 'grid w-full grid-cols-1 gap-3',
  root: `${PLAY_PANEL} flex flex-col gap-4 p-4 shadow-[var(--shadow-sm)] sm:p-5`,
  // Content already inside a scroll box
  flat: 'flex flex-col gap-4',
  // Dashed box that opens another one
  add: 'w-full',
  addIcon: 'size-5',
  // Folded group, the whole box is the button
  summary:
    'flex w-full items-center gap-3 rounded-[var(--radius-lg)] bg-play-nest p-4 text-left transition-colors hover:bg-play-lift focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  summaryNote: 'text-xs font-semibold text-[var(--play-ink-soft)]',
  summaryText: 'flex min-w-0 flex-1 flex-col',
  summaryName: 'truncate text-xl font-bold tracking-tight text-[var(--play-ink)] sm:text-2xl',
  keys: 'flex items-center justify-end gap-2',
  keyIcon: 'size-4',
  title: 'min-w-0',
  body: 'flex min-h-40 flex-col gap-3',
  search: 'relative',
  searchIcon:
    'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--play-ink-faint)]',
  searchInput:
    'min-h-11 w-full rounded-xl bg-play-lift pr-3 pl-9 text-sm text-[var(--play-ink)] outline-none placeholder:text-[var(--play-ink-faint)]',
  input:
    'min-h-11 w-full rounded-xl bg-play-lift px-3 text-sm text-[var(--play-ink)] outline-none placeholder:text-[var(--play-ink-faint)]',
  hint: 'text-sm text-[var(--play-ink-soft)]',
} as const

/**
 * Settings page of Play: section list beside one panel of nested groups
 * @type {Record<string, string>}
 */

export const PLAY_SETTINGS = {
  layout: 'grid items-start gap-4 md:gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]',
  nav: 'relative hidden flex-wrap gap-1 md:flex lg:sticky lg:top-4 lg:flex-col',
  // Phone: one menu instead of the list
  pick: 'md:hidden',
  // Gliding highlight under the open section
  box: 'tab-indicator pointer-events-none absolute top-0 left-0 rounded-xl bg-play-nest opacity-0',
  item: 'relative z-10 flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-[var(--play-ink-soft)] transition-colors hover:text-[var(--play-ink)] focus-visible:outline-2 focus-visible:outline-[var(--play-key)]',
  itemOn: 'text-[var(--play-ink)]',
  logo: 'size-6 shrink-0',
  icon: 'size-5 shrink-0',
  divider: 'my-1 h-6 w-px shrink-0 self-center bg-play-nest lg:h-px lg:w-full',
  panel: `${PLAY_PANEL} flex min-w-0 flex-col gap-1.5 p-1.5 shadow-[var(--shadow-sm)]`,
  head: 'px-3.5 pt-3 pb-1.5 text-xl font-bold tracking-tight text-[var(--play-ink)]',
  group: 'flex flex-col gap-0.5 rounded-[var(--radius-lg)] bg-play-nest p-1.5',
  title: 'px-3 pt-1.5 pb-1 text-xs font-bold tracking-wide text-[var(--play-ink-faint)] uppercase',
  slot: 'px-3 py-2',
  reset:
    'mx-3 my-1.5 min-h-11 rounded-xl bg-play-lift px-4 text-sm font-bold text-[var(--play-ink)] transition-colors hover:bg-play-nest focus-visible:outline-2 focus-visible:outline-[var(--play-key)] md:min-h-10 md:self-start',
} as const

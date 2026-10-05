/**
 * Story deck styles: one centred column of progress, card and buttons
 * @type {Record<string, string>}
 */

export const STORY_DECK = {
  root: 'overlay-enter fixed inset-0 z-[55] flex overflow-y-auto bg-[image:var(--gradient-page)] p-4',
  column: 'm-auto flex w-full max-w-lg flex-col gap-4',
  // Segments and the skip button on one line, right above the card
  top: 'flex items-center gap-3',
  progress: 'flex flex-1 gap-1.5',
  segment: 'h-1.5 flex-1 rounded-full',
  segmentIdle: 'bg-[var(--color-on-frame)]/30',
  segmentDone: 'bg-[var(--color-on-frame)]',
  skip: 'text-[var(--color-on-frame)] hover:bg-[var(--color-on-frame-wash)]',
  card: 'course-erase-in relative flex flex-col gap-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-6 shadow-[var(--shadow-md)] sm:p-8',
  // Buttons touch the card, never the bottom of the screen
  actions: 'flex items-center justify-between gap-2',
  next: 'h-auto min-w-0 shrink! py-2 text-center leading-tight whitespace-normal',
  back: 'text-[var(--color-on-frame)] hover:bg-[var(--color-on-frame-wash)]',
} as const

/**
 * Action row styles
 * @type {Record<string, string>}
 */

export const ACTION_ROW = {
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  row: 'flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4 first:pt-0 last:pb-0',
  body: 'min-w-0 flex-1',
  title: 'text-sm font-semibold',
  lead: 'text-xs text-[var(--color-ink-subtle)]',
  action: 'shrink-0',
} as const

/**
 * Profile card beside the settings tabs
 * @type {Record<string, string>}
 */

export const PROFILE_CARD = {
  root: 'card-surface flex flex-col items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 text-center lg:sticky lg:top-6',
  name: 'text-section font-semibold tracking-tight',
  facts: 'mt-4 flex w-full flex-col divide-y divide-[var(--color-border)] text-left',
  fact: 'flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0',
  label: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  value: 'text-sm',
  empty: 'text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Appearance picker cards
 * @type {Record<string, string>}
 */

export const PICKER_CARD = {
  stack: 'flex flex-col gap-6',
  pair: 'grid gap-6 lg:grid-cols-2',
  group: 'flex flex-col gap-3',
  title: 'flex items-center gap-2 text-sm font-semibold',
  three: 'grid grid-cols-3 gap-2',
  two: 'grid grid-cols-2 gap-2',
  option:
    'flex flex-col items-center justify-end gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-3 text-center transition-[transform,box-shadow] hover:-translate-y-px',
  optionWide: 'items-start justify-start text-left',
  active: 'border-[var(--color-ink-subtle)] bg-[var(--color-surface-raised)]',
  glyph: 'size-9',
  sample: 'leading-none font-bold tracking-tight',
  label: 'text-xs font-semibold text-[var(--color-ink-subtle)]',
  description: 'text-xs leading-snug text-[var(--color-ink-subtle)]',
  // Palette of a vision mode drawn with its own colours
  swatches: 'flex gap-1',
  swatch: 'h-2 w-7 rounded-full',
  note: 'pt-4 text-xs text-[var(--color-ink-subtle)]',
} as const

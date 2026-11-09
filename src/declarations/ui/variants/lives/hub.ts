import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls/fields'

/**
 * Personal Live hub
 * @type {Record<string, string>}
 */

export const LIVE_HUB_STYLES = {
  wrapper: 'mx-auto flex w-full max-w-6xl flex-col gap-8',
  pickerRow: 'relative z-10 -mt-28 flex items-start justify-between gap-x-6 px-2 sm:-mt-36 sm:px-3',
  // Portrait straddling the banner, its bubble beside it
  identity: 'flex min-w-0 flex-1 items-start gap-9',
  portraitWrap: 'relative shrink-0',
  actions: 'mt-[4.5rem] flex shrink-0 items-center sm:mt-[6.5rem]',
  pickerLabel: PROPERTY_LABEL,
  picker: 'max-w-56',
  // Replayed on every creator change
  swap: 'hub-swap',
  // Opacity only: a transform would anchor the banner to this box
  fade: 'hub-fade',
  body: 'flex flex-col gap-8',
  stats: 'grid grid-cols-2 gap-4 lg:grid-cols-4',
  stat: 'flex flex-col gap-3 rounded-[var(--radius-lg)] border card-surface p-5 shadow-[var(--shadow-sm)]',
  statLabel: PROPERTY_LABEL,
  statRow: 'flex items-end justify-between gap-2',
  statValue: 'text-3xl leading-none font-bold tracking-tight tabular-nums',
  trend: 'inline-flex items-center gap-1 text-xs leading-none font-bold tabular-nums',
  trendGlyph: 'size-4 shrink-0',
  trendUp: 'text-[var(--color-success)]',
  trendDown: 'text-[var(--color-danger)]',
  trendFlat: 'text-[var(--color-ink-subtle)]',
  note: 'text-sm text-[var(--color-ink-subtle)]',
  columns: 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]',
  section: 'flex min-w-0 flex-col gap-3',
  sectionTitle: PROPERTY_LABEL,
  list: 'flex flex-col gap-2',
  row: 'flex items-center gap-4 rounded-[var(--radius-lg)] border card-surface px-4 py-3 shadow-[var(--shadow-sm)]',
  rowBody: 'flex min-w-0 flex-1 flex-col',
  rowTitle: 'truncate font-bold tracking-tight',
  rowMeta: 'truncate text-sm text-[var(--color-ink-subtle)]',
  rowAside: 'shrink-0 text-sm font-bold tabular-nums',
  // The creator thinks the live in a bubble
  portrait: 'shadow-[var(--shadow-md)] ring-4 ring-[var(--color-surface)]',
  speech: 'relative mt-[4.5rem] flex min-w-0 flex-1 items-center sm:mt-[6.5rem]',
  // Two small bubbles leading to the portrait
  dotLarge:
    'absolute top-1 -left-5 size-4 rounded-full bg-[var(--color-surface-raised)]/40 ring-1 ring-white/40 backdrop-blur-xl shadow-[var(--shadow-sm)]',
  dotSmall:
    'absolute -top-2 -left-9 size-2.5 rounded-full bg-[var(--color-surface-raised)]/40 ring-1 ring-white/40 backdrop-blur-xl shadow-[var(--shadow-sm)]',
  bubble:
    'relative flex min-w-0 flex-1 items-center gap-4 rounded-[var(--radius-xl)] px-5 py-3 ring-1 ring-[var(--color-border)] shadow-[var(--shadow-md)]',
  // Frosted over the banner
  bubbleGlass:
    'bg-[var(--color-surface-raised)]/40 backdrop-blur-2xl backdrop-saturate-200 ring-white/40',
  bubbleBody: 'flex min-w-0 flex-1 flex-col',
  bubbleTitle:
    'flex items-center gap-2.5 text-2xl leading-tight font-bold tracking-tight break-words',
  bubbleGlyph: 'size-6 shrink-0',
  bubbleSub: 'pl-[2.125rem] text-sm text-[var(--color-ink-subtle)] italic',
  onAirTag:
    'inline-flex shrink-0 items-center gap-1 text-xs font-bold tracking-wide text-[var(--color-danger)] uppercase',
  // Bare text button, no box
  moderate:
    'shrink-0 text-sm font-bold text-[var(--color-danger)] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Card of the rail announcing a live on air
 * @type {Record<string, string>}
 */

export const LIVE_NOTICE = {
  wrap: 'relative mx-4 pt-3 pb-1',
  caret:
    'pointer-events-none absolute top-1.5 h-3 w-3 rotate-45 rounded-sm bg-[var(--color-danger)]/30 ring-1 ring-white/40 backdrop-blur-xl',
  // Frosted red glass
  card: 'rail-reset relative z-10 flex items-center rounded-[var(--radius-lg)] bg-[var(--color-danger)]/30 text-[var(--color-ink)] shadow-[var(--shadow-md)] ring-1 ring-white/40 backdrop-blur-xl backdrop-saturate-150 transition-shadow hover:shadow-[var(--shadow-lg)]',
  link: 'flex min-w-0 flex-1 items-center gap-3 p-3',
  avatar: 'ring-2 ring-white/60',
  text: 'min-w-0 flex-1 text-sm leading-tight font-bold',
  go: 'size-4 shrink-0',
  close:
    'mr-2 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  closeGlyph: 'size-4',
} as const

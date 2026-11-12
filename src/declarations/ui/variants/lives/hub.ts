import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls/fields'

/**
 * Personal Live hub
 * @type {Record<string, string>}
 */

export const LIVE_HUB_STYLES = {
  wrapper:
    'mx-auto flex w-full max-w-7xl flex-col gap-0 pb-[calc(var(--shell-dock-clearance)+5rem)] md:pb-32',
  pickerRow: 'relative z-10 -mt-12 flex items-start px-4 sm:-mt-20 sm:px-8',
  // Creator identity
  identity:
    'grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-8 gap-y-4 sm:gap-x-12',
  // Same box as the portrait so every ring around it stays a circle
  portraitWrap: 'relative size-20 shrink-0 sm:size-28',
  profile: 'col-span-2 row-start-2 flex min-w-0 flex-col gap-2',
  creatorName: 'truncate text-3xl leading-tight font-bold tracking-tight sm:text-5xl',
  picker: 'max-w-56',
  // Replayed on every creator change
  swap: 'hub-swap',
  // Opacity only: a transform would anchor the banner to this box
  fade: 'hub-fade',
  body: 'mt-8 flex flex-col gap-7 px-4 sm:mt-10 sm:px-8',
  stats: 'grid flex-1 auto-rows-fr grid-cols-2 gap-3',
  stat: 'flex min-h-32 flex-col justify-between gap-3 rounded-[var(--radius-xl)] border card-surface p-4 shadow-[var(--shadow-sm)] sm:min-h-40 sm:gap-4 sm:p-5',
  statHead: 'flex items-center gap-2',
  statChip:
    'inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]',
  statGlyph: 'size-4',
  groups: 'grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]',
  group: 'flex min-w-0 flex-col gap-3',
  groupTitle: 'flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl',
  teamCard:
    'flex flex-1 flex-col rounded-[var(--radius-xl)] border card-surface p-2 shadow-[var(--shadow-sm)]',
  teamRow:
    'flex flex-1 items-center gap-3 border-t border-[var(--color-border)] px-3 py-3 first:border-t-0',
  teamLabel: 'min-w-0 flex-1 truncate text-sm font-bold',
  teamValue: 'text-3xl leading-none font-bold tracking-tight tabular-nums',
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
  // Centred on the page
  history: 'mx-auto mt-10 flex w-full max-w-6xl min-w-0 flex-col gap-6 sm:mt-16',
  historyTitle: 'text-center text-3xl font-bold tracking-tight',
  divider: 'border-0 border-t border-[var(--color-border)]',
  section: 'flex h-full min-w-0 flex-col gap-5',
  sectionTitle: 'text-2xl font-bold tracking-tight',
  // Timeline: one rule on the left, a chevron points at each date
  timeline:
    'history-list relative flex flex-col gap-10 pl-12 before:absolute before:top-3 before:bottom-0 before:left-[0.6875rem] before:w-[3px] before:rounded-full before:bg-[linear-gradient(to_bottom,var(--color-brand-600),color-mix(in_srgb,var(--color-brand-600)_15%,transparent))]',
  timelineItem: 'relative flex flex-col gap-2.5',
  timelineDot: 'history-arrow absolute top-0.5 -left-7 size-5',
  timelineDay:
    '!w-fit rounded-full bg-[color-mix(in_srgb,var(--color-brand-600)_14%,transparent)] px-3 py-1 text-xs font-bold tracking-wide text-[var(--color-brand-800)] uppercase self-start',
  timelineCard:
    'flex min-h-48 flex-col justify-between gap-5 overflow-hidden rounded-[var(--radius-xl)] border card-surface p-6 shadow-[var(--shadow-md)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]',
  timelineHead: 'flex min-w-0 items-center gap-4',
  // Figures set in an inset box, split by thin rules
  timelineChips:
    'grid grid-cols-3 divide-x divide-[color-mix(in_srgb,var(--color-ink)_16%,transparent)] rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-ink)_4%,transparent)] py-3',
  timelineChip: 'flex min-w-0 flex-col items-center gap-1.5 px-2',
  timelineLabel: 'text-center text-xs leading-tight text-[var(--color-ink-subtle)]',
  timelineValue: 'text-xl leading-none font-bold tracking-tight tabular-nums',
  timelineLinks: 'flex flex-wrap gap-2',
  // Responsables: cover cards
  tiles: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  tileTitle: 'flex items-start gap-2.5 text-lg leading-tight font-bold tracking-tight',
  tileMeta: 'text-sm text-[var(--color-ink-subtle)]',
  list: 'flex flex-col',
  row: 'flex flex-col gap-3 border-t border-[var(--color-border)] py-3 first:border-t-0',
  rowHead: 'flex min-w-0 items-center gap-4',
  rowBody: 'flex min-w-0 flex-1 flex-col',
  rowTitle: 'truncate font-bold tracking-tight',
  rowMeta: 'truncate text-sm text-[var(--color-ink-subtle)]',
  rowAside: 'shrink-0 text-sm font-bold tabular-nums',
  metrics: 'grid grid-cols-3 gap-2',
  metric: 'flex min-w-0 items-center justify-center px-2',
  metricValue: 'flex items-center gap-2 text-sm font-bold tabular-nums',
  metricIcon: 'size-4 shrink-0 text-[var(--color-ink-subtle)]',
  // The creator thinks the live in a bubble
  portrait: '!size-20 shadow-[var(--shadow-lg)] ring-4 ring-[var(--color-surface)] sm:!size-28',
  // Rings around the portrait of a creator on air
  liveRing: 'pointer-events-none absolute -inset-2 rounded-full',
  liveSpin: 'absolute inset-0 rounded-full border-2 border-[var(--color-live-400)]',
  liveWave: 'live-ring-wave absolute inset-0 rounded-full',
  liveTag:
    'self-start rounded-[var(--radius-sm)] bg-[var(--color-live-400)] px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase',
  speech: 'relative col-start-2 row-start-1 flex min-w-0 max-w-2xl self-start',
  // Two small bubbles leading to the portrait
  dotLarge:
    'absolute top-7 -left-[1.375rem] size-3.5 sm:top-11 rounded-full bg-[var(--color-surface-raised)]/80 ring-1 ring-[var(--color-border)] shadow-[var(--shadow-sm)]',
  dotSmall:
    'absolute top-[2.15rem] -left-10 size-2.5 sm:top-[3.15rem] rounded-full bg-[var(--color-surface-raised)]/80 ring-1 ring-[var(--color-border)] shadow-[var(--shadow-sm)]',
  bubble:
    'relative flex min-w-0 items-center rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface px-6 py-5 shadow-[var(--shadow-md)]',
  bubbleBody: 'flex min-w-0 flex-col gap-1.5',
  bubbleKicker: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  bubbleTitle:
    'flex items-center gap-2.5 text-xl leading-tight font-bold tracking-tight break-words sm:text-3xl',
  // Mod View access, centred at the bottom of the page
  modDock:
    'fixed isolate left-1/2 -translate-x-1/2 bottom-[calc(var(--shell-dock-clearance)+1rem)] z-30 flex h-14 items-center gap-3 rounded-full border border-white/50 bg-[var(--color-media-shade)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-lg)] [text-shadow:0_1px_3px_rgb(0_0_0/0.5)] transition-transform duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-spring)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] md:bottom-16 print:hidden',
  // Waves leaving the button while the creator is on air
  modRays: 'pointer-events-none absolute -inset-2 rounded-full',
  modWave:
    'mod-wave absolute inset-0 rounded-full border-2 border-[var(--accent,var(--color-live-400))]',
  // Banner of the creator, blurred, clipped to the pill
  modBackdrop: 'absolute inset-0 -z-10 overflow-hidden rounded-full',
  modBackdropImage: 'size-full scale-150 object-cover blur-md saturate-150',
  modWash: 'absolute inset-0 bg-black/30',
  modDockIcon: 'size-6 shrink-0',
  bubbleGlyph: 'size-6 shrink-0 sm:size-7',
  bubbleSub: 'pl-9 text-sm sm:text-base text-[var(--color-ink-subtle)] italic',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Card of the rail announcing a live on air
 * @type {Record<string, string>}
 */

export const LIVE_NOTICE = {
  creator: 'flex min-w-0 items-center gap-3',
  avatar: 'ring-2 ring-white/60',
  text: 'min-w-0 flex-1 text-sm leading-tight font-bold',
} as const

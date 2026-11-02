// Soft reveal
const REVEAL = 'transition-all duration-500 ease-out motion-reduce:transition-none'

// Skeleton tone on the page
const BONE = '!bg-[var(--color-border)]'

// Floating glass card
const FLOAT =
  'glass-panel absolute z-10 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-lg)]'

// Small pill
const PILL = 'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold'

// Round control of the player
const CONTROL =
  'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--color-on-media)] transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]'

/**
 * Release showcase classes
 * @type {Record<string, unknown>}
 */

export const SHOWCASE = {
  // Video frame
  player:
    'relative isolate overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-media-shade)] shadow-[var(--shadow-lg)] ring-1 ring-black/40',
  stage: 'relative w-full cursor-pointer overflow-hidden',
  dash: 'absolute top-0 left-0 origin-top-left',
  controls:
    'flex flex-col gap-2 bg-[var(--color-media-shade)] px-4 py-3 text-[var(--color-on-media)]',
  barRow: 'flex items-center gap-3',
  control: CONTROL,
  controlGlyph: 'size-5',
  time: 'font-[family-name:var(--font-mono)] text-xs tabular-nums',
  track: 'relative h-1.5 w-full rounded-full bg-white/30',
  fill: 'absolute inset-y-0 left-0 rounded-full bg-[var(--color-brand-600)] transition-[width] ease-linear motion-reduce:transition-none',
  seek: 'absolute -inset-y-2.5 h-6 w-full cursor-pointer appearance-none bg-transparent opacity-0 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] [&::-webkit-slider-thumb]:appearance-none',
  knob: 'absolute top-1/2 right-0 size-3.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--color-on-media)] shadow-[var(--shadow-sm)]',
  reveal: REVEAL,
  hidden: 'translate-y-2 opacity-0',
  shown: 'translate-y-0 opacity-100',
  // Mock dashboard
  dashRoot: 'page-ground relative flex h-full w-full gap-2 p-2 text-[var(--color-ink)]',
  main: 'relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-page)]',
  content: 'flex flex-col gap-6 px-8 pb-8 pt-[calc(var(--banner-h)+1.5rem)]',
  crumb: 'text-sm font-semibold text-[var(--color-ink-subtle)]',
  // Rail
  rail: 'rail-ground flex w-64 shrink-0 flex-col overflow-hidden rounded-[var(--radius-xl)] py-3',
  searchBox:
    'glass-panel flex h-11 w-full items-center gap-2 rounded-[var(--radius-lg)] border px-3 text-sm text-[var(--color-ink-subtle)]',
  searchGlyph: 'size-4 shrink-0',
  railScroll: 'flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 pt-4',
  railLabel: 'px-3 pb-1 text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  // Cursor
  cursor:
    'pointer-events-none absolute top-0 left-0 z-50 transition-transform duration-700 ease-[var(--motion-ease-out)] motion-reduce:transition-none',
  cursorGlyph: 'size-7 -translate-x-1 -translate-y-0.5 drop-shadow-[0_2px_3px_rgb(0_0_0/0.35)]',
  click:
    'showcase-click absolute -top-4 -left-4 size-8 rounded-full border-2 border-[var(--color-brand-600)]',
  // Absences list
  pageTitle: 'text-2xl font-bold tracking-tight',
  pageLead: 'text-sm text-[var(--color-ink-subtle)]',
  sectionTitle: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  list: 'flex flex-col gap-2',
  slot: 'relative h-14',
  rowBone: `!h-14 ${BONE}`,
  row: 'absolute inset-0 flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 text-sm transition-shadow duration-500',
  rowGlow: 'ring-2 ring-[var(--color-brand-600)]',
  rowGlyph: 'size-5 shrink-0 text-[var(--color-ink-accent)]',
  rowDates: 'font-semibold',
  rowMeta: 'text-[var(--color-ink-subtle)]',
  rowTag: `ml-auto bg-[var(--color-hover)] ${PILL}`,
  // Memora button and chat
  fab: 'glass-sunset absolute right-8 bottom-8 z-20 flex size-16 items-center justify-center rounded-full border',
  fabMark: 'brain-mark-white h-8',
  fabBubble:
    'speech-bubble speech-tail-down surface-enter absolute right-8 bottom-28 z-20 w-max rounded-[var(--radius-lg)] px-4 py-2 text-sm font-semibold',
  chat: 'speech-bubble speech-tail-down surface-enter absolute right-8 bottom-28 z-20 flex h-[27rem] w-[26rem] flex-col rounded-[var(--radius-xl)]',
  chatThread: 'flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden px-3 py-3',
  chatCard:
    'mt-2 flex w-fit items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold shadow-[var(--shadow-sm)]',
  chatSendGlyph: 'size-4',
  // Private page
  page: 'flex flex-col gap-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-raised)] p-8 shadow-[var(--shadow-sm)]',
  pageHead: 'flex items-center gap-3',
  pageName: 'min-w-0 flex-1 truncate text-4xl font-bold tracking-tight',
  status: `relative shrink-0 bg-[var(--color-hover)] transition-colors duration-500 ${PILL}`,
  statusShared:
    '!bg-[color-mix(in_srgb,var(--color-success)_16%,transparent)] text-[var(--color-success)]',
  statusGlyph: 'size-3.5',
  shareButton: `shrink-0 cursor-pointer border border-[var(--color-border-strong)] ${PILL}`,
  blockHead: 'text-xl font-bold',
  bullet: 'flex items-center gap-3 text-base',
  bulletDot: 'size-2 shrink-0 rounded-full bg-[var(--color-ink)]',
  // Private tree in the rail
  treeRow:
    'flex min-h-8 items-center gap-2 rounded-[var(--radius-lg)] px-3 py-1 text-caption font-medium whitespace-nowrap',
  treeRowOn: 'bg-[var(--color-surface)] font-semibold',
  treeBone: `!h-8 ${BONE}`,
  glyph: 'size-4 shrink-0',
  // Share card
  share: `${FLOAT} right-8 bottom-28 flex w-80 flex-col gap-3 p-4`,
  shareTitle: 'text-sm font-bold',
  shareInput:
    'rounded-[var(--radius-md)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-3 py-2 text-sm text-[var(--color-on-field-subtle)]',
  person: 'flex items-center gap-3 text-sm font-semibold',
  personLevel: 'ml-auto text-xs font-semibold text-[var(--color-ink-subtle)]',
  avatar:
    'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[var(--color-surface-raised)]',
  avatarTones: [
    'bg-[var(--color-brand-600)]',
    'bg-[var(--color-success)]',
    'bg-[var(--color-caution)]',
  ],
  burst: 'pointer-events-none absolute top-1/2 left-1/2 size-0',
  spark: 'showcase-burst absolute -top-1 -left-1 size-2.5 rounded-full',
  sparkTones: [
    'bg-[var(--color-brand-600)]',
    'bg-[var(--color-success)]',
    'bg-[var(--color-caution)]',
  ],
  // Intro and finale cards
  card: 'absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-700 motion-reduce:transition-none',
  introCard: 'bg-[var(--color-page)]',
  finaleCard: 'bg-[var(--color-page)]/80 backdrop-blur-md',
  cardBrain: 'size-32',
  cardOff: 'pointer-events-none opacity-0',
  finaleBurst: 'pointer-events-none absolute top-1/2 left-1/2 size-0',
  // Welcome box
  actions: 'flex flex-wrap justify-end gap-2',
} as const

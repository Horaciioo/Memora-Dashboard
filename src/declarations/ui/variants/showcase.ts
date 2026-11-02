// Soft reveal
const REVEAL = 'transition-all duration-500 ease-out motion-reduce:transition-none'

// Real skeleton tone on the page ground
const BONE = '!bg-[var(--color-border)]'

// Floating glass card
const FLOAT =
  'glass-panel absolute z-10 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-lg)]'

// Small pill
const PILL = 'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold'

/**
 * Release showcase classes
 * @type {Record<string, unknown>}
 */

export const SHOWCASE = {
  root: 'flex flex-col gap-3',
  stage:
    'relative flex h-[30rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)]',
  dots: 'flex justify-center gap-1.5',
  dot: 'size-1.5 rounded-full bg-[var(--color-border-strong)] transition-colors',
  dotOn: 'bg-[var(--color-brand-600)]',
  replay:
    'cursor-pointer self-center rounded-full px-3 py-1 text-xs font-bold text-[var(--color-ink-accent)] transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  reveal: REVEAL,
  hidden: 'translate-y-2 opacity-0',
  shown: 'translate-y-0 opacity-100',
  bone: BONE,
  // App window
  side: 'rail-ground hidden w-48 shrink-0 flex-col gap-1.5 p-3 md:flex',
  sideBone: '!h-9 !bg-white/45',
  sideRow:
    'flex h-9 items-center gap-2.5 rounded-[var(--radius-md)] bg-white/55 px-2.5 text-sm font-semibold text-[var(--color-ink)] transition-colors duration-500',
  sideRowOn: '!bg-white shadow-[var(--shadow-sm)]',
  sideGlyph: 'size-4 shrink-0',
  main: 'relative flex min-w-0 flex-1 flex-col gap-4 overflow-hidden bg-[var(--color-page)] p-6',
  pageTitle: 'text-2xl font-bold tracking-tight',
  pageLead: 'text-sm text-[var(--color-ink-subtle)]',
  sectionTitle: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  // Absences list
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
  fab: 'glass-sunset absolute right-5 bottom-5 z-20 flex size-14 items-center justify-center rounded-full border',
  fabMark: 'brain-mark-white h-7',
  fabBubble:
    'speech-bubble speech-tail-down surface-enter absolute right-5 bottom-[5.25rem] z-20 w-max rounded-[var(--radius-lg)] px-4 py-2 text-sm font-semibold',
  chat: 'speech-bubble speech-tail-down surface-enter absolute right-5 bottom-[5.25rem] z-20 flex h-[24rem] w-[23rem] flex-col rounded-[var(--radius-xl)]',
  chatThread: 'flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden px-3 py-3',
  chatCard:
    'mt-2 flex w-fit items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold shadow-[var(--shadow-sm)]',
  chatSendGlyph: 'size-4',
  // Private pages
  tree: 'hidden w-44 shrink-0 flex-col gap-2 lg:flex',
  tabs: 'flex rounded-full bg-[var(--color-surface-sunken)] p-0.5 text-xs font-bold',
  tab: 'flex-1 rounded-full px-2 py-1 text-center whitespace-nowrap transition-colors duration-500',
  tabOn: 'bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)]',
  treeRow:
    'flex h-9 items-center gap-2 rounded-[var(--radius-md)] px-2.5 text-sm whitespace-nowrap',
  treeRowOn: 'bg-[var(--color-hover)] font-semibold',
  treeNew: 'text-[var(--color-ink-accent)] font-semibold',
  treeBone: `!h-9 ${BONE}`,
  glyph: 'size-4 shrink-0 text-[var(--color-ink-subtle)]',
  body: 'flex min-h-0 flex-1 gap-5',
  page: 'flex min-w-0 flex-1 flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-sm)]',
  pageBone: `!h-full ${BONE}`,
  pageHead: 'flex items-center gap-3',
  pageName: 'min-w-0 truncate text-2xl font-bold tracking-tight',
  status: `relative ml-auto shrink-0 bg-[var(--color-hover)] transition-colors duration-500 ${PILL}`,
  statusShared:
    '!bg-[color-mix(in_srgb,var(--color-success)_16%,transparent)] text-[var(--color-success)]',
  statusGlyph: 'size-3.5',
  blockHead: 'text-lg font-bold',
  bullet: 'flex items-center gap-2.5 text-sm',
  bulletDot: 'size-1.5 shrink-0 rounded-full bg-[var(--color-ink)]',
  // Share card
  share: `${FLOAT} right-5 bottom-5 flex w-72 flex-col gap-3 p-4`,
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
  cardBrain: 'size-28',
  cardOff: 'pointer-events-none opacity-0',
  finaleBurst: 'pointer-events-none absolute top-1/2 left-1/2 size-0',
  // Welcome box
  actions: 'flex flex-wrap justify-end gap-2',
} as const

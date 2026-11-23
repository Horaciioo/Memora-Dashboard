/**
 * Recap sheet classes
 * @type {Record<string, string>}
 */

export const RECAP_STYLES = {
  // Slide
  groupTitle: 'pb-1 text-sm font-bold tracking-wide text-[var(--color-ink)] uppercase',
  // Bulleted sentences under Memora's line
  slide: 'mt-1 flex flex-col gap-3',
  group: 'flex flex-col gap-1',
  list: "flex list-['-_'] flex-col gap-1.5 pl-4 marker:text-[var(--color-ink-subtle)]",
  // A sentence of the thread, the record's name is the link
  line: 'text-body leading-relaxed text-[var(--color-ink)]',
  lineLink:
    'font-semibold underline decoration-[var(--color-border-strong)] underline-offset-4 transition-colors hover:decoration-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  lineStrong: 'font-bold',
  lineSubject: 'font-semibold text-[var(--color-ink)]',
  lineFigure: 'text-sm font-semibold tabular-nums',
  lineDay: 'text-sm font-medium text-[var(--color-ink-subtle)]',
  who: 'inline-flex items-center align-middle',
  // Portraits stuck together, each ringed in the box colour
  whoStack: 'flex -space-x-2',
  whoTip: 'hover:z-10',
  whoAvatar: 'ring-2 ring-[var(--color-surface)]',
  whoName: 'font-semibold',
  hidden: 'pt-1 text-sm text-[var(--color-ink-subtle)]',
  // Rows of the account box that bring the recap back
  menuRow:
    'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-hover)]',
  menuGlyph: 'size-4 shrink-0 text-[var(--color-ink-subtle)]',
  // Ring on the box Memora lights, never in the way of a click
  guideRing:
    'recap-ring pointer-events-none fixed z-20 rounded-[var(--radius-lg)] transition-[top,left,width,height] duration-300 ease-out motion-reduce:transition-none',
  // Memora's bubble on the page, next to what she shows
  bubble:
    'recap-bubble fixed z-[60] flex w-80 max-w-[calc(100vw-1.5rem)] flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-lg)]',
  bubbleHead: 'flex items-center gap-2 text-caption font-bold text-[var(--color-ink-subtle)]',
  bubbleMark: 'brain-mark-white h-5',
  bubbleLine: 'text-body font-semibold',
  bubbleRow: 'flex flex-wrap gap-2',
  bubbleDone:
    'cursor-pointer rounded-full bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-on-accent)] transition-opacity hover:opacity-90',
  bubbleSkip:
    'cursor-pointer rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--color-hover)]',
} as const

/**
 * Deck of cards on the Home, one per point of the recap
 * @type {Record<string, string>}
 */

export const RECAP_DECK = {
  deck: 'relative flex flex-col gap-3',
  head: 'flex flex-wrap items-center gap-x-3 gap-y-2',
  mark: 'grid size-9 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-figure)] text-[var(--color-on-brand)]',
  markGlyph: 'size-5',
  title: 'text-section font-semibold tracking-tight',
  count: 'text-sm text-[var(--color-ink-subtle)]',
  // Cards below peek out under the top one
  stack: 'relative pb-4',
  ghost:
    'pointer-events-none absolute inset-x-4 top-3 bottom-0 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] opacity-70',
  ghostFar:
    'pointer-events-none absolute inset-x-8 top-6 bottom-[-0.5rem] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] opacity-40',
  list: 'flex flex-col gap-3',
  card: 'deck-card card-surface relative flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] p-3 shadow-[var(--shadow-sm)] sm:p-4',
  cardCompact: 'gap-2 p-3 shadow-none sm:p-3',
  kicker: 'text-sm font-bold tracking-wide text-[var(--color-ink)] uppercase',
  voice: 'flex items-start gap-2 text-sm leading-snug text-[var(--color-ink-subtle)]',
  voiceMark: 'mt-0.5 size-4 shrink-0',
  actions: 'flex flex-wrap items-center gap-2',
  error: 'text-sm text-[var(--color-danger)]',
  checks: 'flex flex-col gap-0.5',
  folded:
    'flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-[var(--color-hover)]',
  done: 'card-surface flex items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] p-4 text-sm font-semibold',
} as const

/**
 * Notebooks of the Intelligence page, one per talk Memora can lead
 * @type {Record<string, string>}
 */

export const RECAP_NOTEBOOKS = {
  row: 'flex flex-row items-start justify-center gap-10',
  book: 'relative w-32',
  // Paper block peeking out under the cover
  sheet:
    'pointer-events-none absolute inset-0 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
  sheetNear: 'translate-x-1.5 translate-y-1.5 rotate-2',
  sheetFar: 'translate-x-3 translate-y-3 rotate-4 opacity-60',
  cover:
    'relative flex h-12 w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[var(--radius-xl)] px-3 pb-2 text-left text-base font-extrabold tracking-tight text-[var(--color-on-brand)] shadow-[var(--shadow-md)] transition-transform duration-300 ease-[var(--motion-ease-spring)] hover:-translate-y-1 hover:-rotate-1',
  // Rose for the recap
  coverRecap: 'bg-[image:linear-gradient(135deg,var(--color-brand-300),var(--color-brand-500))]',
  // Sky blue for the absences
  coverAbsence: 'bg-[image:linear-gradient(135deg,var(--color-sky-300),var(--color-sky-500))]',
} as const

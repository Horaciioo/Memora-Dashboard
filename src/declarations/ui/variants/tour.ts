/**
 * Admission chat, Memora writes and the member answers
 * @type {Record<string, string>}
 */

export const TOUR_CHAT = {
  root: 'overlay-enter fixed inset-0 z-[55] bg-[image:var(--gradient-page)]',
  column: 'mx-auto flex h-full w-full max-w-xl flex-col px-4',
  // Messages sit on the background, the oldest fade out at the top
  scroll:
    'flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-y-auto pt-16 pb-4 [mask-image:linear-gradient(to_bottom,transparent,black_5rem)]',
  row: 'replica-message-in flex w-full items-end gap-3',
  rowMemora: 'justify-start',
  rowMe: 'justify-end',
  avatar: 'flex h-9 w-9 shrink-0 items-center justify-center',
  avatarGlyph: 'h-9 w-9',
  bubble:
    'max-w-[85%] rounded-[var(--radius-xl)] px-4 py-2.5 text-body leading-relaxed shadow-[var(--shadow-sm)]',
  bubbleMemora: 'rounded-bl-[var(--radius-xs)] border border-[var(--color-border)] card-surface',
  bubbleMe:
    'rounded-br-[var(--radius-xs)] bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  typing:
    'flex w-fit items-center gap-1 rounded-[var(--radius-xl)] rounded-bl-[var(--radius-xs)] border border-[var(--color-border)] card-surface px-4 py-3.5 shadow-[var(--shadow-sm)]',
  typingDot: 'replica-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-ink-subtle)]',
  composer:
    'surface-enter mb-4 flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] card-surface p-4 shadow-[var(--shadow-md)]',
  choices: 'flex flex-wrap gap-2',
  send: 'flex items-center gap-2',
  field: 'min-w-0 flex-1',
  birthday: 'grid grid-cols-[1fr_1.6fr_1fr] gap-2',
} as const

/**
 * Cards of the presentation and the absence demonstration
 * @type {Record<string, string>}
 */

export const TOUR_DECK = {
  demo: 'flex min-h-[13rem] flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-4',
  demoProject: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  demoTask: 'text-section font-semibold tracking-tight',
  demoLabel: 'text-caption font-semibold text-[var(--color-ink-subtle)]',
  demoRow:
    'flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] card-surface px-3 py-2 transition-opacity',
  demoRowAbsent: 'opacity-60',
  demoName: 'flex min-w-0 flex-1 flex-col text-body font-semibold',
  demoAbsent: 'text-caption font-normal text-[var(--color-ink-subtle)]',
  demoRefusal:
    'surface-enter flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-3 py-2 text-body',
  demoMark: 'h-6 w-6 shrink-0',
  loader: 'flex flex-col gap-2',
  loaderTrack: 'h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-sunken)]',
  loaderFill:
    'h-full origin-left rounded-full bg-[var(--color-brand-600)] transition-transform ease-linear',
  loaderText: 'text-caption text-[var(--color-ink-subtle)]',
} as const

/**
 * Dimmed page, lit part and the bubble speaking about it
 * @type {Record<string, string>}
 */

export const TOUR_SPOTLIGHT = {
  dim: 'fixed z-[70] bg-[var(--color-scrim)] transition-[top,left,width,height] duration-[var(--motion-duration-base)]',
  ring: 'pointer-events-none fixed z-[71] transition-[top,left,width,height] duration-[var(--motion-duration-base)]',
  // One of the white lines around the lit part, each a little wider and fainter
  line: 'tour-line absolute border-2 border-[var(--color-on-media)]',
  shield: 'fixed z-[71]',
  bubble:
    'surface-enter fixed z-[72] flex w-[var(--tour-bubble-w)] max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] glass-panel p-4 shadow-[var(--shadow-md)]',
  progress: 'flex gap-1',
  segment: 'h-1 flex-1 rounded-full',
  segmentDone: 'bg-[var(--color-brand-600)]',
  segmentIdle: 'bg-[var(--color-border-strong)]',
  title: 'text-base font-bold',
  body: 'text-sm leading-relaxed text-[var(--color-ink)]',
  actions: 'flex items-center justify-between gap-2',
  buttons: 'flex items-center gap-2',
} as const

/**
 * Menu entries while the visit unlocks them
 * @type {Record<string, string>}
 */

export const TOUR_RAIL = {
  unlock: 'tour-unlock',
} as const

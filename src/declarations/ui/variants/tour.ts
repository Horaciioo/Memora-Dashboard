/**
 * Admission chat, Memora writes and the member answers
 * @type {Record<string, string>}
 */

export const TOUR_CHAT = {
  // The frame ground, the portrait and the window standing on it as the app does
  root: 'overlay-enter fixed inset-0 z-[55] flex flex-col gap-3 overflow-hidden bg-[image:var(--gradient-page)] p-[var(--tour-inset)] lg:block lg:p-0',
  figure:
    'relative h-36 shrink-0 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-sunken)] shadow-[var(--shadow-md)] lg:absolute lg:inset-y-[var(--tour-inset)] lg:left-[var(--tour-inset)] lg:h-auto lg:w-[var(--tour-photo)]',
  figureImage: 'absolute inset-0 h-full w-full object-cover',
  figureShade: 'absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent',
  figureName: 'absolute right-6 bottom-5 left-6 text-section font-bold text-white',
  figureFallback: 'absolute inset-0 flex items-center justify-center bg-[var(--color-brand-soft)]',
  figureGlyph: 'h-32 w-32',
  window:
    'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-page)] shadow-[var(--shadow-page)] lg:absolute lg:inset-y-[var(--tour-inset)] lg:right-[var(--tour-inset)] lg:left-[calc(var(--tour-inset)*2+var(--tour-photo))] lg:flex-none',
  // Tab over the portrait, the title one letter under the other
  tabRail: 'welcome-tab-rail',
  tab: 'welcome-tab',
  tabLetter:
    'text-[min(1.9rem,3.6dvh)] leading-[0.95] font-bold tracking-wide text-[var(--color-ink)] uppercase',
  // The conversation fills the window and follows its own course
  scroll: 'min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-10 lg:px-14',
  column: 'mx-auto flex w-full max-w-3xl flex-col gap-2',
  // Discord's way: portrait, then the speaker's name and his messages under it
  group: 'replica-message-in flex w-full gap-4',
  groupBreak: 'mt-5',
  avatar: 'flex h-10 w-10 shrink-0 items-start justify-center',
  avatarGlyph: 'h-10 w-10',
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  author: 'text-body font-bold',
  authorMemora: 'text-[var(--color-ink-accent)]',
  line: 'text-body leading-relaxed break-words',
  typing: 'flex h-6 w-fit items-center gap-1',
  typingDot: 'replica-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--color-ink-subtle)]',
  // A scene Memora plays, in the flow of her messages
  scene: 'my-1 w-full min-w-0 max-w-[90%]',
  // Answers come under the question, on Memora's side, spread over the width of her messages
  quick:
    'surface-enter ml-14 mt-1 grid w-full max-w-[90%] grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2',
  chip: 'w-full justify-center rounded-full',
  // A field is asked in an embed: accent bar, title, the control, then the actions in a column
  reply:
    'surface-enter ml-14 mt-1 flex w-full max-w-[90%] flex-col gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] border-l-4 border-l-[var(--color-brand-600)] bg-[var(--color-surface)] py-3 pr-4 pl-4 shadow-[var(--shadow-sm)]',
  embedTitle: 'text-body font-bold',
  replyActions: 'flex flex-col items-stretch',
  replyDivider: 'my-2 h-px w-full bg-[var(--color-border)]',
  replyAction: 'w-full justify-center',
  // The chat bar under the conversation, written for the member
  bar: 'mx-auto flex w-full max-w-3xl shrink-0 items-center gap-3 px-5 pt-1 pb-5 sm:px-10 lg:px-14',
  barTheme:
    'h-11 w-11 shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]',
  barBox:
    'flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-2.5 pl-4 shadow-[var(--shadow-sm)]',
  // Open to the member's words: it glows until the pointer reaches it, then grows with the text like Discord's
  barBoxOpen: 'items-end border-[var(--color-border-strong)]',
  barGlow: 'tour-glow',
  barField:
    'max-h-[40dvh] min-w-0 flex-1 resize-none self-center bg-transparent text-body outline-none placeholder:text-[var(--color-ink-subtle)] disabled:opacity-60',
  barText: 'min-w-0 flex-1 text-body',
  barPlaceholder: 'text-[var(--color-ink-subtle)]',
  barCaret: 'ml-px inline-block h-4 w-px translate-y-0.5 animate-pulse bg-[var(--color-ink)]',
  // Countdown to the next part, a ring emptying around the seconds
  timer: 'relative flex h-9 w-9 shrink-0 items-center justify-center',
  timerRing: 'absolute inset-0 h-full w-full -rotate-90',
  timerTrack: 'fill-none stroke-[var(--color-border)] stroke-[3]',
  timerFill:
    'fill-none stroke-[var(--color-brand-600)] stroke-[3] transition-[stroke-dashoffset] ease-linear [stroke-dasharray:1]',
  timerSeconds: 'text-caption font-bold tabular-nums',
  field: 'min-w-0',
  // Parts side by side, the track slides to the one under way
  viewport: 'relative min-h-0 flex-1 overflow-clip',
  track:
    'flex h-full transition-transform duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-spring)]',
  panel: 'flex h-full min-w-0 flex-1 basis-0 flex-col',
  // Social profiles already added, then the previews of a look to pick
  added: 'flex flex-wrap gap-2',
  addedTag:
    'inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-1 text-caption font-semibold',
  preview:
    'flex flex-col items-stretch gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-center transition-colors hover:border-[var(--color-brand-400)]',
  previewSample:
    'flex h-16 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] font-bold',
  previewLabel: 'text-caption font-semibold',
  previewHint: 'text-micro leading-snug text-[var(--color-ink-subtle)]',
  // The offers, then the way out under them
  offer: 'flex w-full flex-col gap-2',
  offerNone: 'ml-14 w-full max-w-[90%] justify-center',
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
  // Same card as the news one on the home, in red
  privacy:
    'relative isolate flex items-start gap-3 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-danger)_55%,white)] via-[color-mix(in_srgb,var(--color-danger)_85%,white)] to-[var(--color-danger)] px-4 py-3 text-white shadow-[var(--shadow-md)] ring-1 ring-white/40 ring-inset',
  privacySheen:
    'pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/40 to-transparent',
  privacyBody: 'relative flex min-w-0 flex-1 flex-col',
  privacyKicker: 'text-micro font-bold tracking-wide text-white/80 uppercase',
  privacyText: 'text-body leading-snug font-semibold',
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
  dim: 'fixed z-[70] bg-[var(--color-scrim)]',
  // Clicks are swallowed by the panels, the frame only paints
  swallow: 'fixed z-[70]',
  frame:
    'pointer-events-none fixed z-[70] rounded-[var(--radius-lg)] shadow-[0_0_0_100vmax_var(--color-scrim)] transition-[top,left,width,height] duration-[var(--motion-duration-base)]',
  shield: 'fixed z-[71]',
  bubble:
    'surface-enter fixed z-[72] flex w-[var(--tour-bubble-w)] max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] glass-panel p-4 shadow-[var(--shadow-md)]',
  progress: 'flex items-center gap-2',
  step: 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-caption font-bold',
  stepCurrent: 'border-[var(--color-border-strong)] text-[var(--color-brand-600)]',
  stepTodo: 'border-[var(--color-border)] text-[var(--color-ink-subtle)]',
  stepDone: 'border-transparent text-[var(--color-ink)]',
  stepGlyph: 'h-4 w-4',
  stepLine: 'h-px min-w-2 flex-1 bg-[var(--color-border-strong)]',
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

/**
 * The salute closing the first visit, in the middle of the screen
 * @type {Record<string, string>}
 */

export const TOUR_CELEBRATION = {
  overlay: 'fixed inset-0 z-[75] flex items-center justify-center p-4',
  veil: 'overlay-enter absolute inset-0 bg-[color-mix(in_oklab,var(--color-ink)_45%,transparent)]',
  panel:
    'surface-enter relative flex w-full max-w-md flex-col items-center gap-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] glass-panel p-8 text-center shadow-[var(--shadow-lg)]',
  title: 'rise-in text-2xl font-bold tracking-tight text-balance',
  stage: 'relative flex h-28 w-full items-center justify-center',
  stamp:
    'stamp-slam relative rounded-[var(--radius-lg)] border-[6px] border-[var(--color-apple-red)] bg-[color-mix(in_oklab,var(--color-on-media)_85%,transparent)] px-6 py-3 text-2xl font-bold tracking-wide text-[var(--color-apple-red)] uppercase',
  confetti: 'absolute top-1/2 left-1/2 h-3 w-2 rounded-sm confetti-piece',
  body: 'text-body text-[var(--color-ink-subtle)]',
  actions: 'flex items-center gap-2',
} as const

/**
 * Steps of the welcome conversation, a line joining the dots
 * @type {Record<string, string>}
 */

export const TOUR_TIMELINE = {
  list: 'flex shrink-0 items-center gap-3 px-5 pt-5 sm:px-10 lg:px-14',
  item: 'flex min-w-0 items-center gap-3',
  joined: 'flex-1',
  step: 'flex min-w-0 items-center gap-2.5 rounded-full text-left disabled:cursor-default',
  // Only the number carries the brand colour, the rest stays plain
  dot: 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-caption font-bold transition-colors',
  dotCurrent: 'border-[var(--color-border-strong)] text-[var(--color-brand-600)]',
  dotTodo: 'border-[var(--color-border)] text-[var(--color-ink-subtle)]',
  // A done step loses its box, only the tick stays
  dotDone: 'border-transparent text-[var(--color-ink)]',
  glyph: 'h-5 w-5',
  label: 'hidden truncate text-body leading-snug sm:block',
  labelCurrent: 'font-bold',
  labelIdle: 'text-[var(--color-ink-subtle)]',
  // The done step is struck out
  labelDone: 'text-[var(--color-ink-subtle)] line-through',
  line: 'h-px min-w-4 flex-1 bg-[var(--color-border-strong)]',
} as const

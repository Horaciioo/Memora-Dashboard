/**
 * Memora assistant styles
 * @type {Record<string, string>}
 */

export const ASSISTANT_STYLES = {
  // Field glyph and row glyph
  fieldMark: 'h-6 shrink-0',
  rowMark: 'h-7 shrink-0',
  rowBody: 'flex min-w-0 flex-1 flex-col gap-1',
  rowReply: 'truncate font-medium',
  rowHint: 'shrink-0 text-xs text-[var(--color-ink-subtle)]',
  // Conversation
  thread: 'flex flex-col gap-0.5 px-3 py-3',
  // Who answered what, one colour per answer
  groups: 'mt-2 flex flex-col gap-3',
  group: 'flex flex-col gap-1',
  groupTitle: 'text-caption font-bold',
  groupTones: {
    success: 'text-[var(--color-success)]',
    danger: 'text-[var(--color-danger)]',
    muted: 'text-[var(--color-ink-subtle)]',
    plain: 'text-[var(--color-ink)]',
  },
  groupItems: 'flex flex-col gap-0.5 text-sm',
  // Window of hours the member offers
  hours: 'mt-2 flex flex-col gap-3',
  hoursField: 'flex flex-col gap-1 text-caption font-semibold text-[var(--color-ink-subtle)]',
  hoursInput:
    'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body text-[var(--color-ink)]',
  // Title of a conversation, folds once the next one begins
  topic:
    'mt-6 flex w-full cursor-pointer items-center gap-2 border-t border-[var(--color-border)] pt-3 text-left text-caption font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase first:mt-0',
  topicGlyph: 'size-4 shrink-0 transition-transform',
  topicGlyphOpen: 'rotate-90',
  topicDone: 'ml-auto text-[var(--color-ink-subtle)] normal-case',
  // Same rhythm as the welcome chat: a new speaker breaks, a follow-up hugs
  groupBreak: 'mt-5',
  memora: 'replica-message-in flex w-full gap-3',
  avatar: 'flex h-8 w-8 shrink-0 items-start justify-center pt-0.5',
  avatarMark: 'h-8',
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  author: 'text-caption font-bold text-[var(--color-ink-accent)]',
  line: 'text-body leading-relaxed break-words',
  mine: 'replica-message-in mt-5 ml-auto max-w-[80%] rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)] px-3.5 py-2 text-body break-words',
  // Recognised parameters
  slots: 'grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm',
  slotsInline: 'flex flex-wrap gap-x-4 gap-y-0.5 text-xs',
  slotLabel: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  slotValue: 'min-w-0 truncate',
  slotPair: 'flex min-w-0 items-baseline gap-1.5',
  // Answers
  choices: 'flex flex-col gap-1',
  choice:
    'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)]',
  choiceHint: 'ml-auto shrink-0 text-xs text-[var(--color-ink-subtle)]',
  actions: 'flex flex-wrap gap-2',
  // Rows to tick
  checklist: 'surface-enter mt-1 ml-11 flex flex-col gap-0.5',
  checkRow:
    'flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-left text-sm transition-colors duration-150 hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)]',
  checkMaster: 'mb-1 border-b border-[var(--color-border)] rounded-b-none pb-3 font-bold',
  checkBox:
    'flex size-5 shrink-0 items-center justify-center rounded-[0.4rem] border-2 border-[var(--color-border-strong)] transition-colors duration-150',
  checkBoxOn: 'border-[var(--color-brand-600)] bg-[var(--color-brand-600)] text-white',
  checkGlyph: 'size-3.5',
  checkGo: 'mt-2 self-start rounded-full',
  // Slider of a percentage, under Memora's question
  percent: 'surface-enter mt-1 ml-11 flex items-center gap-3',
  percentRange: 'min-w-0 flex-1 accent-[var(--color-ink-accent)]',
  percentValue: 'w-12 shrink-0 text-right text-sm font-semibold',
  // Search field with its button, under Memora's question
  search: 'surface-enter mt-1 ml-11 flex items-center gap-2',
  searchField:
    'min-w-0 flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm shadow-[var(--shadow-sm)] outline-none placeholder:text-[var(--color-ink-subtle)] focus-visible:border-[var(--color-border-strong)]',
  // Answers sit under Memora's lines, past her portrait
  answers: 'surface-enter mt-1 ml-11 flex flex-col items-start gap-1.5',
  // Toggles to tick keep their pill
  pills: 'surface-enter mt-1 ml-11 flex flex-wrap gap-2',
  pill: 'min-w-24 justify-center rounded-full',
  // A reply is written like a link, the member clicks it as they would type it
  answer:
    'group flex w-fit cursor-pointer gap-2 text-left text-body font-semibold text-[var(--color-ink-accent)] transition-opacity duration-150 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  // The dash leads each reply and stays out of the underline
  answerLabel: 'underline decoration-1 underline-offset-4',
  link: 'flex w-fit max-w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-sm font-semibold shadow-[var(--shadow-sm)] transition-colors duration-150 hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  linkGlyph: 'h-4 w-4 shrink-0 text-[var(--color-ink-accent)]',
  // A person drawn under a line, portrait on the left, name and identifier under it
  card: 'flex w-fit max-w-full items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-sm)]',
  cardName: 'truncate text-sm font-semibold',
  cardId: 'truncate font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-subtle)]',
  // Calendar and its validation, inside the chat
  period:
    'replica-message-in flex flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)] p-3',
  periodHint: 'text-caption text-[var(--color-ink-subtle)]',
  periodPicked: 'text-sm font-semibold',
  suggestion:
    'w-fit rounded-[var(--radius-md)] px-2 py-1 text-left text-sm text-[var(--color-ink-accent)] hover:bg-[var(--color-hover)]',
  // Points listed under a line
  items: "flex list-['-_'] flex-col gap-1 pl-4 text-base font-semibold text-[var(--color-ink)]",
  // A listed point, crossed off by a line that draws itself once it is done
  item: "relative transition-colors duration-700 after:absolute after:top-1/2 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-current after:transition-[width] after:duration-700 after:ease-out after:content-['']",
  itemDone: 'text-[var(--color-ink-subtle)] after:w-full',
  // Loading line, alone in the middle of the thread
  warming: 'flex items-center justify-center gap-3 py-8 text-center',
  closed: 'flex items-center gap-2 pt-2 text-caption text-[var(--color-ink-subtle)]',
  thinking: 'flex items-center gap-2 text-caption text-[var(--color-ink-subtle)]',
} as const

/**
 * Memora bubble, bottom centre of a page
 * @type {Record<string, string>}
 */

export const ASSISTANT_BUBBLE_STYLES = {
  // Centred by margins, moved by the individual translate, opened by a clip so neither fights the other
  root: 'memora-bubble fixed inset-x-0 bottom-[calc(var(--shell-dock-clearance,0px)+1.25rem)] z-[60] mx-auto flex min-h-16 w-[min(34rem,calc(100vw-2rem))] cursor-grab touch-none items-center gap-3 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-2 pr-2 pl-4 shadow-[var(--shadow-lg)] select-none active:cursor-grabbing',
  rootLeaving: 'memora-bubble-out',
  // Grown over the whole page, the page it opens on takes over
  rootExpanding:
    'memora-bubble-expanding cursor-default *:pointer-events-none *:opacity-0 *:transition-opacity *:duration-200',
  mark: 'brain-mark-white h-8 shrink-0',
  line: 'relative min-w-0 flex-1 text-body leading-snug font-semibold',
  lineWritten: 'absolute inset-0',
  // Reserves the full sentence so the bubble does not grow while it is written
  lineGhost: 'invisible block',
  caret: 'ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-current',
  close:
    'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  closeGlyph: 'size-4',
  enter:
    'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-on-accent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  enterGlyph: 'size-5',
} as const

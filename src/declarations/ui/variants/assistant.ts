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
  // Slider of a percentage, under Memora's question
  percent: 'surface-enter mt-1 ml-11 flex items-center gap-3',
  percentRange: 'min-w-0 flex-1 accent-[var(--color-ink-accent)]',
  percentValue: 'w-12 shrink-0 text-right text-sm font-semibold',
  // Search field with its button, under Memora's question
  search: 'surface-enter mt-1 ml-11 flex items-center gap-2',
  searchField:
    'min-w-0 flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm shadow-[var(--shadow-sm)] outline-none placeholder:text-[var(--color-ink-subtle)] focus-visible:border-[var(--color-border-strong)]',
  // Answers sit under Memora's lines, past her portrait
  answers: 'surface-enter mt-1 ml-11 flex flex-wrap gap-2',
  answer: 'min-w-24 justify-center rounded-full',
  link: 'flex w-fit max-w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-sm font-semibold shadow-[var(--shadow-sm)] transition-colors duration-150 hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  linkGlyph: 'h-4 w-4 shrink-0 text-[var(--color-ink-accent)]',
  // Calendar and its validation, inside the chat
  period:
    'replica-message-in flex flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)] p-3',
  periodHint: 'text-caption text-[var(--color-ink-subtle)]',
  periodPicked: 'text-sm font-semibold',
  suggestion:
    'w-fit rounded-[var(--radius-md)] px-2 py-1 text-left text-sm text-[var(--color-ink-accent)] hover:bg-[var(--color-hover)]',
  thinking: 'flex items-center gap-2 text-caption text-[var(--color-ink-subtle)]',
} as const

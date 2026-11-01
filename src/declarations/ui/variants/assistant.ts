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
  thread: 'flex flex-col gap-3 px-3 py-3',
  memora: 'replica-message-in flex w-full gap-3',
  avatar: 'flex h-8 w-8 shrink-0 items-start justify-center pt-0.5',
  avatarMark: 'h-8',
  body: 'flex min-w-0 flex-1 flex-col gap-2',
  author: 'text-caption font-bold text-[var(--color-ink-accent)]',
  line: 'text-body leading-relaxed break-words',
  mine: 'replica-message-in ml-auto max-w-[80%] rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)] px-3.5 py-2 text-body break-words',
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
  suggestion:
    'w-fit rounded-[var(--radius-md)] px-2 py-1 text-left text-sm text-[var(--color-ink-accent)] hover:bg-[var(--color-hover)]',
  thinking: 'flex items-center gap-2 text-caption text-[var(--color-ink-subtle)]',
} as const

/**
 * Thread of remarks
 * @type {Record<string, string>}
 */

export const COMMENT_THREAD = {
  comment:
    'group relative -mx-3 flex flex-col gap-1.5 rounded-[var(--radius-md)] border-b border-[var(--color-border)] px-3 py-3 transition-colors duration-700 last:border-b-0',
  // Discreet glyph, clearer under the pointer
  unread:
    'absolute top-3 right-3 rounded-full p-1 text-[var(--color-ink-subtle)] opacity-30 transition-opacity group-hover:opacity-100 hover:text-[var(--color-ink)] focus-visible:opacity-100',
  // Mentions the viewer, pastel until hovered
  hot: 'bg-[var(--color-brand-soft)]',
  // Held on the rail
  pinned: 'bg-[var(--color-brand-50)]',
  meta: 'text-xs text-[var(--color-ink-subtle)]',
  body: 'text-sm',
  mention:
    'rounded-[var(--radius-sm)] bg-[var(--color-info-soft)] px-1 py-0.5 font-semibold text-[var(--color-info)]',
} as const

/**
 * Composer opened inline under a thread
 * @type {Record<string, string>}
 */

export const COMMENT_COMPOSER = {
  wrapper: 'relative flex flex-col gap-2 pt-3',
  input: 'min-h-24 resize-y leading-relaxed',
  hint: 'text-xs text-[var(--color-ink-subtle)]',
  actions: 'flex items-center justify-between gap-2',
  popover:
    'absolute right-0 bottom-full left-0 z-20 mb-1 flex max-h-56 flex-col overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1 shadow-[var(--shadow-md)]',
  item: 'flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-sm',
  itemActive: 'bg-[var(--color-hover)]',
  itemHint: 'ml-auto truncate text-xs text-[var(--color-ink-subtle)]',
  empty: 'px-2 py-1.5 text-sm text-[var(--color-ink-subtle)]',
} as const

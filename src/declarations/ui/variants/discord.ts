/**
 * Announcement heading
 * @type {Record<string, string>}
 */

export const COMMUNICATION_HEAD = {
  wrapper: 'flex flex-col gap-1',
  title: 'text-base font-bold',
  list: 'flex flex-col gap-0.5 text-sm',
  row: 'flex items-center gap-1.5',
  term: 'text-[var(--color-ink-subtle)]',
} as const

/**
 * Discord message replica
 * @type {Record<string, string>}
 */

export const DISCORD_MESSAGE = {
  frame:
    'relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--discord-background)] text-body leading-[1.375rem] text-[var(--discord-text)]',
  // Small copy control in the top right corner of the announcement
  copyCorner:
    'notch-bite absolute top-0 right-0 z-10 flex h-11 w-12 items-start justify-start rounded-none rounded-tr-[var(--radius-lg)] bg-white/10 pt-2 pl-3 text-[var(--discord-muted)] hover:bg-white/20 hover:text-[var(--discord-heading)]',
  message: 'flex gap-4 px-4 py-3',
  avatar: 'h-10 w-10 shrink-0 rounded-full bg-[var(--discord-blurple)]',
  body: 'flex min-w-0 flex-1 flex-col',
  head: 'flex items-baseline gap-2',
  author: 'font-medium text-[var(--discord-heading)]',
  time: 'text-xs text-[var(--discord-muted)]',
  content: 'flex flex-col break-words whitespace-pre-wrap',
  blank: 'h-[1.375rem]',
  h1: 'mt-2 mb-1 text-2xl leading-[1.375em] font-bold text-[var(--discord-heading)]',
  h2: 'mt-2 mb-1 text-xl leading-[1.375em] font-bold text-[var(--discord-heading)]',
  h3: 'mt-2 mb-1 text-base leading-[1.375em] font-bold text-[var(--discord-heading)]',
  subtext: 'text-xs text-[var(--discord-muted)]',
  quote:
    'flex gap-3 py-0.5 before:w-1 before:shrink-0 before:rounded-full before:bg-[var(--discord-quote)]',
  list: 'my-1 flex list-disc flex-col pl-6',
  ordered: 'my-1 flex list-decimal flex-col pl-6',
  codeBlock:
    'my-1 overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--discord-code-border)] bg-[var(--discord-code)] p-2 font-[family-name:var(--font-mono)] text-sm',
  code: 'rounded-[3px] bg-[var(--discord-code)] px-1 py-px font-[family-name:var(--font-mono)] text-[0.85em]',
  link: 'text-[var(--discord-link)] hover:underline',
  mention:
    'rounded-[3px] bg-[var(--discord-mention)] px-0.5 font-medium text-[var(--discord-mention-text)] transition-colors hover:bg-[var(--discord-mention-hover)] hover:text-white',
  spoiler: 'cursor-pointer rounded-[3px] bg-[var(--discord-spoiler)] text-transparent',
  spoilerOpen: 'rounded-[3px] bg-[var(--discord-quote)]/40',
  // Composer
  composer: 'relative px-4 pb-4',
  input:
    'block max-h-[50dvh] min-h-11 w-full resize-none rounded-[var(--radius-md)] bg-[var(--discord-input)] px-4 py-2.5 text-[var(--discord-text)] placeholder:text-[var(--discord-muted)] focus:outline-none',
  hint: 'px-4 pt-1 text-xs text-[var(--discord-muted)]',
  popover:
    'absolute right-4 bottom-full left-4 mb-2 max-h-72 overflow-y-auto rounded-[var(--radius-md)] bg-[var(--discord-popover)] p-2 shadow-[var(--shadow-md)]',
  popoverGroup:
    'px-2 pt-2 pb-1 text-xs font-bold tracking-wide text-[var(--discord-muted)] uppercase',
  popoverItem:
    'flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-sm text-[var(--discord-text)]',
  popoverItemActive: 'bg-[var(--discord-hover)] text-[var(--discord-heading)]',
  popoverEmpty: 'px-2 py-1.5 text-sm text-[var(--discord-muted)]',
  roleDot: 'h-3 w-3 shrink-0 rounded-full',
  footer: 'flex flex-wrap items-center justify-end gap-2',
} as const

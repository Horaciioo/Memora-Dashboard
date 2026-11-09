/**
 * Editor laid over the read rendering of the same markdown: same sizes, same spacing
 * @type {object}
 */

export const BLOCK_EDITOR_INLINE = {
  page: 'flex flex-col',
  base: 'flex items-start',
  // Blocks sit 0.75em apart, list items touch
  gap: 'mt-[0.75em]',
  row: {
    paragraph: '',
    heading1: 'text-[1.35em]',
    heading2: 'text-[1.2em]',
    heading3: 'text-[1.05em]',
    bullet: '',
    numbered: '',
    quote: 'border-l-[3px] border-[var(--color-brand-400)] pl-[0.8em]',
    code: 'rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-[1em] py-[0.8em] text-[0.9em]',
    rule: '',
  },
  line: {
    paragraph: '',
    heading1: 'heading-face leading-[1.25]! font-bold',
    heading2: 'heading-face leading-[1.25]! font-bold',
    heading3: 'heading-face leading-[1.25]! font-bold',
    bullet: '',
    numbered: '',
    quote: 'text-[var(--color-ink-subtle)]',
    code: 'font-[family-name:var(--font-mono)] text-[0.9em] whitespace-pre-wrap',
    rule: '',
  },
  bullet:
    'mt-[0.65em] mr-[calc(1.4em-0.375rem)] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-ink)]',
  number: 'w-[1.4em] shrink-0 tabular-nums',
} as const

/**
 * Block editor styles
 * @type {Object}
 */

export const BLOCK_EDITOR = {
  frame:
    'relative flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-field-border)] bg-[var(--color-field)] transition-colors focus-within:border-[var(--color-field-border-strong)]',
  frameInvalid: 'border-[var(--color-danger)]',
  // Bare frame laid over read text
  frameInline: 'relative flex flex-col',
  page: 'flex min-h-40 flex-col gap-1 px-4 py-3 text-sm text-[var(--color-on-field)]',
  row: 'flex items-start gap-2',
  // Placeholder on the focused empty line
  line: 'min-w-0 flex-1 leading-[1.65] outline-none empty:before:pointer-events-none empty:before:text-[var(--color-on-field-subtle)] focus:empty:before:content-[attr(data-placeholder)] [&_a]:text-[var(--color-ink-accent)] [&_a]:underline [&_code]:rounded-[var(--radius-sm)] [&_code]:bg-[var(--color-surface-sunken)] [&_code]:px-1 [&_code]:font-[family-name:var(--font-mono)] [&_code]:text-[0.9em]',
  kinds: {
    paragraph: '',
    heading1: 'pt-3',
    heading2: 'pt-2',
    heading3: 'pt-1',
    bullet: '',
    numbered: '',
    quote: 'border-l-[3px] border-[var(--color-brand-400)] pl-3',
    code: 'rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-3 py-2',
    rule: '',
  },
  lineKinds: {
    paragraph: '',
    heading1: 'text-xl font-bold tracking-tight',
    heading2: 'text-lg font-bold tracking-tight',
    heading3: 'text-base font-bold',
    bullet: '',
    numbered: '',
    quote: 'text-[var(--color-ink-subtle)] italic',
    code: 'font-[family-name:var(--font-mono)] text-xs whitespace-pre-wrap',
    rule: '',
  },
  bullet: 'mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-on-field)]',
  number: 'min-w-5 shrink-0 text-right tabular-nums text-[var(--color-on-field-subtle)]',
  rule: 'w-full py-2 outline-none focus-visible:rounded-[var(--radius-sm)] focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
  ruleLine: 'border-[var(--color-border-strong)]',
  footer:
    'flex justify-end border-t border-[var(--color-field-border)] px-3 py-1.5 text-xs text-[var(--color-on-field-subtle)] tabular-nums',
  footerOver: 'text-[var(--color-danger)]',
  // Pixel gaps of the floating panels
  menuGapPx: 8,
  formatBarHeightPx: 48,
  slashPanel:
    'fixed z-[80] flex max-h-80 w-72 flex-col gap-0.5 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] glass-panel p-1.5 shadow-[var(--shadow-lg)]',
  slashEmpty: 'px-3 py-2 text-sm text-[var(--color-ink-subtle)]',
  slashItem: 'flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-1.5 text-left',
  slashItemIdle: 'hover:bg-[var(--color-hover)]',
  slashItemActive: 'bg-[var(--color-hover)]',
  slashTile:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]',
  slashGlyph: 'h-4 w-4',
  slashBody: 'flex min-w-0 flex-col',
  slashLabelText: 'text-sm font-medium',
  slashHint: 'truncate text-xs text-[var(--color-ink-subtle)]',
  formatBar:
    'fixed z-[80] flex -translate-x-1/2 items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--color-border)] glass-panel p-1 shadow-[var(--shadow-md)]',
  formatButton:
    'flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  formatGlyph: 'h-4 w-4',
} as const

/**
 * Floating console window and terminal
 * @type {Record<string, string>}
 */

export const NEXUS_STYLES = {
  // Window, above menus and toasts
  window:
    'nexus-enter fixed z-[90] flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-mono text-xs text-[var(--color-ink)] shadow-[var(--shadow-lg)] max-sm:!inset-0 max-sm:!h-dvh max-sm:!w-screen max-sm:rounded-none',
  windowFolded: 'h-auto',
  head: 'flex shrink-0 cursor-grab touch-none select-none items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-1.5 active:cursor-grabbing',
  title: 'flex-1 truncate text-xs font-semibold uppercase tracking-wider',
  state: 'text-[var(--color-ink-subtle)]',
  stateWrite: 'text-[var(--color-warning)]',
  stateDanger: 'font-semibold text-[var(--color-danger)]',
  controls: 'flex items-center gap-1',
  control:
    'grid size-6 place-items-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  controlIcon: 'size-3.5',
  body: 'relative flex min-h-0 flex-1 flex-col',
  grip: 'absolute z-10 touch-none',
  gripEast: 'inset-y-0 right-0 w-1.5 cursor-ew-resize',
  gripSouth: 'inset-x-0 bottom-0 h-1.5 cursor-ns-resize',
  gripCorner: 'bottom-0 right-0 size-3 cursor-nwse-resize',
  // Terminal
  scroll: 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2',
  block: 'flex flex-col gap-1 border-b border-[var(--color-border)] py-2 last:border-b-0',
  blockHead: 'flex items-start gap-2',
  echo: 'min-w-0 flex-1 break-all font-semibold',
  echoMark: 'text-[var(--color-ink-accent)]',
  meta: 'shrink-0 text-[var(--color-ink-subtle)]',
  action:
    'rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  actionFilled:
    'rounded-[var(--radius-sm)] bg-[var(--color-ink)] px-2 py-0.5 text-[var(--color-page)] hover:opacity-90',
  levelInfo: 'text-[var(--color-ink)]',
  levelWarning: 'text-[var(--color-warning)]',
  levelError: 'text-[var(--color-danger)]',
  levelSuccess: 'text-[var(--color-success)]',
  levelRow: 'flex items-start gap-2',
  levelIcon: 'mt-0.5 size-3.5 shrink-0',
  // Prompt
  prompt: 'flex shrink-0 items-center gap-2 border-t border-[var(--color-border)] px-3 py-2',
  promptMark: 'shrink-0 font-semibold text-[var(--color-ink-accent)]',
  input:
    'min-w-0 flex-1 bg-transparent outline-none placeholder:italic placeholder:text-[var(--color-ink-subtle)]',
  suggestions:
    'flex shrink-0 flex-wrap gap-x-3 gap-y-0.5 border-t border-[var(--color-border)] px-3 py-1 text-[var(--color-ink-subtle)]',
  suggestion: 'hover:text-[var(--color-ink)]',
  suggestionPicked: 'text-[var(--color-ink)] underline',
  // Output forms
  table: 'w-full border-collapse text-left',
  th: 'border-b border-[var(--color-border-strong)] px-2 py-1 font-semibold uppercase tracking-wider text-[var(--color-ink-subtle)]',
  thSort: 'cursor-pointer hover:text-[var(--color-ink)]',
  td: 'max-w-72 truncate border-b border-[var(--color-border)] px-2 py-1 align-top',
  tableWrap: 'max-h-80 overflow-auto',
  record: 'grid grid-cols-[minmax(6rem,max-content)_1fr] gap-x-4 gap-y-0.5',
  recordKey: 'uppercase tracking-wider font-semibold text-[var(--color-ink-subtle)]',
  recordValue: 'min-w-0 break-words',
  tree: 'flex flex-col gap-0.5',
  treeChildren: 'ml-4 flex flex-col gap-0.5 border-l border-[var(--color-border)] pl-3',
  treeToggle: 'flex items-center gap-1 text-left hover:text-[var(--color-ink-accent)]',
  diffRow: 'grid grid-cols-[minmax(6rem,max-content)_1fr_1fr] gap-x-4 gap-y-0.5',
  diffBefore: 'text-[var(--color-danger)]',
  diffAfter: 'text-[var(--color-success)]',
  timeline: 'flex flex-col gap-1',
  timelineRow: 'grid grid-cols-[max-content_1fr] gap-x-3',
  metrics: 'grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-2',
  metric: 'flex flex-col gap-0.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1',
  metricLabel: 'uppercase tracking-wider text-[var(--color-ink-subtle)]',
  metricValue: 'text-sm font-semibold',
  text: 'whitespace-pre-wrap break-words',
  empty: 'italic text-[var(--color-ink-subtle)]',
  confirmRow: 'mt-1 flex flex-wrap items-center gap-2',
  confirmInput: 'min-w-32 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-transparent px-2 py-0.5 outline-none',
} as const

/**
 * Public Deban. screens, confirmation, follow-up and review
 * @type {Record<string, string>}
 */

export const UNBAN_PUBLIC_STYLES = {
  stack: 'flex flex-col gap-6',
  center: 'flex flex-col items-center gap-3 text-center',
  title: 'text-xl font-bold tracking-tight sm:text-2xl',
  // The state of the request, large
  statusBig: 'flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl',
  statusIcon: 'size-7 shrink-0',
  meta: 'flex flex-col gap-1 text-sm text-[var(--color-ink-subtle)]',
  reference: 'font-[family-name:var(--font-mono)] text-lg font-semibold tracking-wide',
  // Decision and answer of the team, set apart
  decision:
    'flex flex-col gap-2 rounded-[var(--radius-lg)] border-l-2 border-[var(--color-brand-600)] bg-[var(--color-brand-soft)] px-5 py-4',
  decisionText: 'text-sm leading-relaxed whitespace-pre-wrap',
  section: 'flex flex-col gap-3',
  sectionHead: 'flex items-center justify-between gap-3',
  label:
    'font-[family-name:var(--font-mono)] text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  answer: 'flex flex-col gap-1',
  answerText: 'text-sm whitespace-pre-wrap',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
  confirm: 'flex items-start gap-3 text-sm',
  error: 'text-sm text-[var(--color-danger)]',
  // Off screen, only a robot meets it
  trap: 'absolute -left-[9999px] size-px overflow-hidden',
} as const

/**
 * Frame of the public Deban. pages: rounded banner off the edges, portrait on its lower edge
 * @type {Record<string, string>}
 */

export const UNBAN_SHELL_STYLES = {
  page: 'mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-0 p-3 pb-20 sm:p-5',
  // Preview sits in a page, not the whole screen
  preview: 'mx-auto flex w-full max-w-5xl flex-col gap-0',
  // Photograph with deep corners, clear of the window edges
  banner:
    'relative isolate h-56 shrink-0 overflow-hidden rounded-[2rem] bg-[var(--color-surface-sunken)] text-[var(--color-on-media)] shadow-[var(--shadow-md)] sm:h-80 sm:rounded-[3rem]',
  mark: 'absolute top-5 left-6 w-24 opacity-90 brightness-0 invert sm:top-7 sm:left-9 sm:w-32',
  // Title laid over the foot of the photograph, like the dashboard pages
  bannerFoot: 'absolute inset-x-0 bottom-0 px-6 pb-4 sm:px-10 sm:pb-8',
  // Portrait on the lower edge of the photograph, name beside it
  identityRow: 'relative z-10 -mt-12 flex items-end gap-4 px-6 sm:-mt-20 sm:gap-8 sm:px-12',
  portraitWrap: 'relative size-24 shrink-0 sm:size-36',
  portrait: '!size-full shadow-[var(--shadow-md)] ring-4 ring-[var(--color-page)]',
  name: 'min-w-0 truncate pb-1 text-3xl leading-tight font-bold tracking-tight sm:pb-3 sm:text-5xl',
  eyebrow:
    'font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-ink-subtle)] uppercase',
  // Words of the team, set in the middle
  intro: 'mx-auto max-w-xl text-center text-base leading-relaxed',
  previewPage: 'flex flex-col gap-4',
  previewPageTitle: 'text-section font-bold tracking-tight',
  body: 'mx-auto mt-10 flex w-full max-w-xl flex-col gap-8 px-2 sm:mt-14',
} as const

/**
 * Staff Deban. screen, list beside the open file
 * @type {Record<string, string>}
 */

export const UNBAN_DESK_STYLES = {
  // List and file side by side from lg, one at a time below
  split: 'grid items-start gap-6 lg:grid-cols-[minmax(20rem,26rem)_minmax(0,1fr)]',
  list: 'flex min-w-0 flex-col gap-4',
  // Decision buttons under the rail, as wide as it is
  decisions: 'grid grid-cols-2 gap-2',
  // Page of one request: boxes apart
  stack: 'flex min-w-0 flex-col gap-4',
  box: 'card-surface flex min-w-0 flex-col gap-4 rounded-[var(--radius-xl)] p-5 sm:p-6',
  pickEmpty: 'min-h-[24rem] justify-center',
  more: 'flex justify-center',
  pane: 'card-surface flex min-w-0 flex-col gap-6 rounded-[var(--radius-xl)] p-5 sm:p-6',
  paneHead: 'flex flex-wrap items-start justify-between gap-3',
  paneTitle: 'flex min-w-0 items-center gap-3',
  paneName: 'truncate text-section font-bold tracking-tight',
  reference: 'font-[family-name:var(--font-mono)] text-caption text-[var(--color-ink-subtle)]',
  actions: 'flex flex-wrap items-center gap-2',
  banner:
    'flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm',
  section: 'flex flex-col gap-3',
  sectionTitle:
    'font-[family-name:var(--font-mono)] text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  answer: 'flex flex-col gap-1',
  note: 'text-sm whitespace-pre-wrap',
  lift: 'flex flex-wrap items-center gap-3 text-sm',
  // Creator choice and tabs above the board
  bar: 'flex flex-wrap items-center justify-between gap-3',
  // Form editor
  editor: 'grid items-start gap-6 xl:grid-cols-2',
  editorColumn: 'flex min-w-0 flex-col gap-4',
  // Full address in a box of its own, selectable whole
  linkBox:
    'flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-4 py-2',
  linkUrl: 'font-[family-name:var(--font-mono)] text-sm break-all select-all',
  page: 'flex flex-col gap-3',
  pageHead: 'grid items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]',
  bar2: 'flex flex-wrap items-center justify-between gap-3',
  barNote: 'text-caption text-[var(--color-ink-subtle)]',
  card: 'flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4',
  cardHead: 'flex flex-wrap items-center justify-between gap-2',
  cardTools: 'flex items-center gap-1',
  cardRow: 'grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end',
  option: 'flex items-center gap-2',
  scale: 'grid grid-cols-2 gap-3',
  preview: 'card-surface flex flex-col gap-4 rounded-[var(--radius-xl)] p-5 sm:p-6',
} as const

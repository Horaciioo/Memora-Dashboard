/**
 * Tabs of the AutoMod window
 * @type {Record<string, string>}
 */

export const MODVIEW_TABS = {
  list: 'relative flex min-w-0 flex-1 items-center gap-0.5',
  // Box gliding under the open tab
  box: 'relative flex flex-col',
  tab: 'relative flex min-w-0 items-center gap-1.5 rounded-[var(--radius-md)] px-2 py-1 text-xs font-bold tracking-tight text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]',
  // Keeps its words whole when the window narrows
  tabFixed: 'shrink-0',
  tabOn: 'text-[var(--color-ink)]',
  tabLabel: 'truncate',
  badge:
    'min-w-5 shrink-0 rounded-full bg-[var(--color-danger)] px-1.5 text-center text-micro font-bold text-[var(--color-on-solid)] tabular-nums',
} as const

/**
 * Surveillance view
 * @type {Record<string, string>}
 */

export const MODVIEW_WATCH = {
  chips: 'flex flex-wrap gap-1.5 border-b border-[var(--color-border)] px-3 py-2',
  chip: 'inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] py-0.5 pr-1 pl-2.5 text-xs font-bold',
  chipClose:
    'flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  chipIcon: 'h-2.5 w-2.5',
  lines: 'flex flex-col py-1',
  line: 'px-3 py-1 text-sm leading-relaxed break-words hover:bg-[var(--color-hover)]',
  time: 'mr-1.5 font-[family-name:var(--font-mono)] text-micro text-[var(--color-ink-subtle)]',
  name: 'cursor-pointer font-bold hover:underline',
  silent: 'px-3 py-2 text-xs text-[var(--color-ink-subtle)] italic',
  tools: 'ml-2 inline-flex items-center gap-0.5 align-middle',
  tool: 'inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-35',
  toolIcon: 'h-4 w-4',
} as const

/**
 * Suggestion window
 * @type {Record<string, string>}
 */

export const MODVIEW_SUGGEST = {
  list: 'flex flex-col gap-2',
  card: 'flex flex-col gap-2 rounded-[var(--radius-lg)] bg-[var(--twitch-head)] p-3',
  who: 'cursor-pointer self-start text-xs font-bold uppercase hover:underline',
  tag: 'shrink-0 text-xs font-bold',
  why: 'min-w-0 font-semibold',
  quote: 'border-l-2 border-[var(--color-border-strong)] pl-2.5 text-sm leading-snug break-words',
  divider: 'h-px bg-[color-mix(in_oklab,var(--color-ink)_22%,transparent)]',
  verdictBlock: 'flex min-w-0 flex-col gap-0.5',
  verdict: 'flex items-baseline gap-2 text-sm leading-tight text-[var(--color-ink)]',
  step: 'text-micro text-[var(--twitch-muted)] italic',
  command:
    'font-[family-name:var(--font-mono)] text-xs text-[var(--twitch-muted)] break-words select-all',
  none: 'text-xs text-[var(--color-ink-subtle)] italic',
  actions: 'grid grid-cols-3 gap-1',
  watch: 'h-7 min-h-0 w-full',
  accept: 'h-7 min-h-0 w-full !text-[var(--color-success)]',
  refuse: 'h-7 min-h-0 w-full !text-[var(--color-danger)]',
} as const

/**
 * Offence rail
 * @type {Record<string, string>}
 */

export const MODVIEW_RAIL = {
  root: 'surface-enter flex max-h-full min-h-0 w-72 shrink-0 flex-col self-start overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-md)]',
  head: 'flex items-center justify-between gap-2 border-b border-[var(--color-border)] py-2 pr-2 pl-4',
  title: 'min-w-0 text-base leading-tight font-bold tracking-tight',
  body: 'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4',
  foot: 'flex flex-col gap-1.5 border-t border-[var(--color-border)] p-3',
  tags: 'flex flex-wrap gap-x-2 text-sm font-bold',
  condition: 'text-xs leading-snug text-[var(--color-ink-subtle)]',
  hint: 'text-xs text-[var(--color-ink-subtle)] italic',
  ladder: 'flex flex-col',
  step: 'relative flex gap-3 pb-4 last:pb-0',
  line: 'absolute top-7 bottom-1 left-3 w-px bg-[var(--color-border-strong)]',
  number:
    'z-10 flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-[var(--color-surface-sunken)] text-xs font-bold tabular-nums',
  numberNext: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  stepBody: 'flex min-w-0 flex-col gap-0.5 pt-0.5',
  stepDone: 'line-through opacity-50',
} as const

/**
 * Suggestion title colour by measure
 * @type {Record<string, { text: string }>}
 */

export const MODVIEW_VERDICT: Record<string, { text: string }> = {
  WARN: { text: 'text-[var(--color-caution)]' },
  TIMEOUT: { text: 'text-[var(--color-apple-orange)]' },
  BAN: { text: 'text-[var(--color-danger)]' },
  DELETE: { text: 'text-[var(--color-info)]' },
}

/**
 * Viewer dossier in the viewer card
 * @type {Record<string, string>}
 */

export const MODVIEW_DOSSIER = {
  root: 'flex flex-col gap-4',
  head: 'flex items-center justify-between gap-2',
  label: 'text-xs font-bold tracking-wide text-[var(--color-ink-accent)] uppercase',
  note: 'text-xs text-[var(--color-ink-subtle)]',
  ladder: 'flex flex-col gap-1.5',
  ladderName: 'flex items-baseline justify-between gap-2 text-sm font-semibold',
  ladderStep: 'shrink-0 text-xs text-[var(--twitch-muted)] italic',
  dots: 'flex gap-1',
  dot: 'h-2 flex-1 rounded-full bg-[color-mix(in_oklab,var(--color-ink)_22%,transparent)]',
  dotOn: 'bg-[var(--color-danger)]',
  dotNext: 'bg-[var(--color-brand-400)]',
  next: 'text-xs text-[var(--twitch-muted)]',
  box: 'relative flex flex-col',
  rowTitle: 'min-w-0 text-sm font-bold',
  rowFoot: 'flex items-center justify-between gap-2',
  history:
    'flex max-h-72 flex-col overflow-y-auto rounded-[var(--radius-md)] bg-[var(--twitch-head)] px-3 py-1',
  row: 'relative flex flex-col gap-0.5 py-2.5 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[color-mix(in_oklab,var(--color-ink)_22%,transparent)] last:after:hidden',
  rowHead: 'flex items-baseline justify-between gap-2',
  rowKind: 'text-sm font-bold',
  rowDate: 'shrink-0 text-xs text-[var(--twitch-muted)]',
  rowReason: 'text-sm break-words',
  rowLine: 'text-xs text-[var(--twitch-muted)]',
  summary: 'text-sm font-semibold',
  rowBy: 'text-xs text-[var(--twitch-muted)] italic',
  line: 'text-xs text-[var(--color-ink-subtle)]',
  empty: 'text-xs text-[var(--color-ink-subtle)] italic',
  section: 'flex flex-col gap-2',
} as const

/**
 * Team window
 * @type {Record<string, string>}
 */

export const MODVIEW_TEAM = {
  list: 'flex flex-col p-2',
  member:
    'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors hover:bg-[var(--color-hover)]',
  memberFocus:
    'bg-gradient-to-r from-[var(--focus-tone)] to-[var(--focus-tone-soft)] text-white hover:bg-transparent',
  name: 'min-w-0 flex-1 truncate text-sm font-semibold',
  memberCoordinator: 'bg-[color-mix(in_srgb,var(--color-gold-400)_14%,transparent)]',
  portrait: 'relative shrink-0',
  badge:
    'absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)]',
  badgeGlyph: 'size-3',
  dot: 'size-2.5 shrink-0 rounded-full bg-[var(--color-success)]',
  offline: 'cursor-not-allowed opacity-60',
  tag: 'shrink-0 text-xs font-bold',
  reinforce: 'p-2',
  planned: 'shrink-0 text-xs text-[var(--color-ink-subtle)] italic tabular-nums',
  focus: 'px-3 py-1.5 text-xs font-semibold text-[var(--color-ink-accent)]',
} as const

/**
 * Unban requests desk
 * @type {Record<string, string>}
 */

export const MODVIEW_UNBAN = {
  // Popover from the sidebar
  iconButton:
    'flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--color-hover)]',
  icon: 'size-4',
  // List
  list: 'flex min-h-0 flex-1 flex-col',
  listHead: 'flex items-center justify-between gap-2 px-2 pb-2',
  listCount: 'text-sm font-semibold',
  sort: 'flex shrink-0 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] p-0.5',
  sortButton:
    'rounded-[var(--radius-sm)] px-2 py-1 text-xs font-bold text-[var(--color-ink-subtle)] aria-pressed:bg-[var(--color-hover)] aria-pressed:text-[var(--color-ink)]',
  rows: 'flex min-h-0 flex-1 flex-col overflow-y-auto',
  row: 'flex w-full items-center gap-2.5 px-2 py-2.5 text-left transition-colors hover:bg-[var(--color-hover)]',
  rowOn: 'bg-[var(--color-hover)]',
  rowBody: 'flex min-w-0 flex-1 flex-col',
  rowName: 'truncate text-sm font-bold',
  rowMeta: 'truncate text-xs text-[var(--color-ink-subtle)]',
  empty: 'px-3 py-6 text-center text-sm text-[var(--color-ink-subtle)] italic',
  pager:
    'flex items-center justify-between gap-2 border-t border-[var(--color-border)] px-2 py-1.5',
  pagerLabel: 'text-xs font-bold tabular-nums text-[var(--color-ink-subtle)]',
  pagerButtons: 'flex items-center gap-1',
  // Expanded desk, over the stage
  desk: 'course-pop absolute inset-0 z-40 flex min-h-0 flex-col overflow-hidden rounded-[var(--radius-sm)] bg-[var(--twitch-background)]',
  deskHead: 'flex items-center gap-2 bg-[var(--twitch-head)] px-3 py-2',
  deskTitle:
    'min-w-0 flex-1 truncate text-sm font-bold tracking-tight text-[var(--color-ink-accent)]',
  deskBody: 'flex min-h-0 flex-1',
  deskList: 'flex min-h-0 w-80 shrink-0 flex-col border-r border-[var(--color-border)] py-2',
  detail: 'flex min-h-0 min-w-0 flex-1 flex-col',
  detailScroll: 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4',
  who: 'flex items-center gap-3',
  whoName: 'text-lg font-bold',
  whoNote: 'text-xs text-[var(--color-ink-subtle)]',
  figures: 'grid grid-cols-2 gap-4 sm:grid-cols-4',
  figureLabel: 'text-xs text-[var(--color-ink-subtle)]',
  figureValue: 'text-sm font-bold',
  tabs: 'flex items-center gap-4 border-b border-[var(--color-border)]',
  tab: 'border-b-2 border-transparent pb-1.5 text-sm font-semibold text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]',
  tabOn: 'border-[var(--color-brand-600)] text-[var(--color-ink)]',
  log: 'flex flex-col gap-1.5 text-sm',
  logLine: 'break-words',
  logTime: 'mr-2 font-[family-name:var(--font-mono)] text-micro text-[var(--color-ink-subtle)]',
  comment: 'flex flex-col gap-0.5 text-sm',
  commentHead: 'text-xs text-[var(--color-ink-subtle)]',
  footer: 'flex flex-col gap-3 border-t border-[var(--color-border)] p-3',
  request: 'border-l-2 border-[var(--color-ink-subtle)] pl-3 text-sm break-words',
  actions: 'flex flex-wrap gap-2',
} as const

/**
 * Internal chat of a live
 * @type {Record<string, string>}
 */

export const MODVIEW_TEAM_CHAT = {
  box: 'relative flex flex-col',
  list: 'flex max-h-[64dvh] min-h-[50dvh] flex-col overflow-y-auto px-1 py-1.5',
  row: 'mt-3 flex gap-2 rounded-lg px-2 pt-1.5 pb-0 first:mt-0hover:bg-[var(--color-hover)]',
  follow:
    'rounded-lg py-px pr-2 pl-10 text-[0.8125rem] leading-snug break-words whitespace-pre-wrap hover:bg-[var(--color-hover)]',
  rowMentioned: 'bg-[color-mix(in_srgb,var(--color-gold-400)_14%,transparent)]',
  body: 'flex min-w-0 flex-1 flex-col text-[0.8125rem] leading-snug break-words whitespace-pre-wrap',
  meta: 'flex items-baseline gap-1.5',
  author: 'truncate text-[0.8125rem] font-bold',
  time: 'text-[0.65rem] font-medium text-[var(--color-ink-subtle)] tabular-nums',
  mention:
    'rounded bg-[color-mix(in_srgb,var(--color-ink)_14%,transparent)] px-1 font-semibold text-[var(--color-ink)]',
  older: 'self-center text-xs font-semibold text-[var(--color-ink-accent)] hover:underline',
  empty: 'px-3 py-4 text-center text-xs text-[var(--color-ink-subtle)]',
  composer: 'flex flex-col border-t border-[var(--color-border-strong)]',
  mentions:
    'flex flex-wrap items-center gap-1.5 border-b border-[var(--color-border-strong)] px-3 py-2.5',
  mentionButton:
    'cursor-pointer rounded-md bg-[color-mix(in_srgb,var(--color-ink)_10%,transparent)] px-2 py-0.5 text-[0.7rem] font-semibold whitespace-nowrap text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]',
  inputBar: 'flex items-center gap-2 px-3 py-2',
  field:
    'block max-h-28 min-h-9 min-w-0 flex-1 resize-none rounded-full bg-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] px-4 py-2 text-[0.8125rem] placeholder:text-[var(--color-ink-subtle)] focus:bg-[color-mix(in_srgb,var(--color-ink)_16%,transparent)] focus:outline-none',
  suggest:
    'popover-enter glass-panel absolute right-2 bottom-full left-2 z-10 mb-1 flex flex-col overflow-hidden rounded-xl border border-[var(--color-border-strong)] p-1 shadow-[var(--shadow-lg)]',
  suggestItem:
    'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[0.8125rem] font-semibold',
  suggestOn: 'bg-[var(--color-hover)] text-[var(--color-ink)]',
  send: 'grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] text-[var(--color-ink)] hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-40',
  // Unread point on the glyph
  unread:
    'pointer-events-none absolute top-1.5 right-1.5 size-2.5 rounded-full bg-[var(--color-danger)]',
  // Mention bubble beside the glyph
  popup:
    'popover-enter glass-panel absolute left-full z-[60] ml-4 flex w-64 cursor-pointer flex-col gap-0.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3 text-left text-sm shadow-[var(--shadow-lg)]',
  bubbleTitle: 'text-xs font-bold text-[var(--color-ink-accent)]',
  bubbleBody: 'line-clamp-3 break-words',
} as const

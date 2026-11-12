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
  tool: 'inline-flex h-6 w-6 items-center justify-center opacity-80 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-35',
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
  root: 'surface-enter flex max-h-full min-h-0 w-72 shrink-0 flex-col self-start overflow-hidden select-text rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-md)]',
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
  // Rung that writes its command once a viewer is chosen
  stepButton:
    'w-full cursor-pointer rounded-[var(--radius-sm)] text-left transition-colors hover:bg-[var(--color-hover)]',
  stepDone: 'line-through opacity-50',
} as const

/**
 * Viewer name field of the offence rail
 * @type {Record<string, string>}
 */

export const MODVIEW_PICKER = {
  root: 'relative',
  input:
    'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm outline-none placeholder:text-[var(--color-ink-subtle)] focus:border-[var(--color-ink-subtle)]',
  list: 'absolute inset-x-0 top-full z-10 mt-1 flex max-h-48 flex-col overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1 shadow-[var(--shadow-md)]',
  option:
    'w-full rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-sm font-semibold transition-colors hover:bg-[var(--color-hover)]',
  empty: 'px-2 py-1.5 text-xs text-[var(--color-ink-subtle)] italic',
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
  list: 'flex flex-col gap-3 p-2',
  section: 'flex flex-col',
  // Title centred between two rules
  sectionHead: 'flex items-center gap-3 px-2 pb-1 text-sm font-bold',
  sectionRule: 'h-px min-w-4 flex-1 bg-[var(--color-border-strong)]',
  sectionTitle: 'flex items-center gap-2',
  sectionGlyph: 'size-4 shrink-0',
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
  rows: 'relative flex min-h-0 flex-1 flex-col overflow-y-auto',
  rowsLarge: 'gap-1 p-1',
  row: 'flex w-full items-center gap-2.5 px-2 py-2.5 text-left transition-colors hover:bg-[var(--color-hover)]',
  rowOn: 'bg-[var(--color-hover)]',
  // Desk rows: roomy, the pill glides under the open one
  rowLarge:
    'relative z-10 gap-3.5 rounded-[var(--radius-lg)] px-4 py-3.5 hover:bg-[var(--color-hover)]',
  rowLargeOn: 'bg-transparent hover:bg-transparent',
  nameLarge: 'text-base',
  metaLarge: 'text-sm',
  pill: 'tab-indicator glass-pill pointer-events-none absolute top-0 left-0 rounded-[var(--radius-lg)]',
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
  deskList:
    'glass-thick m-3 flex min-h-0 w-[26rem] shrink-0 flex-col rounded-[var(--radius-xl)] border p-3',
  detail: 'flex min-h-0 min-w-0 flex-1 flex-col',
  detailScroll: 'page-swap flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4',
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
  box: 'relative flex h-[calc(55dvh-5rem)] min-h-72 flex-col',
  boxFill: 'h-full min-h-0',
  list: 'flex min-h-0 flex-1 flex-col overflow-y-auto px-1 pt-4 pb-1.5',
  line: 'group/line relative flex flex-col',
  // Bar floating over the top right corner of a hovered message
  reactBar:
    'glass-panel absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-xl border border-[var(--color-border-strong)] p-0.5 opacity-0 shadow-[var(--shadow-lg)] group-hover/line:opacity-100 focus-within:opacity-100',
  reactBarOn: 'opacity-100',
  reactDivider: 'mx-0.5 h-5 w-px bg-[var(--color-border-strong)]',
  row: 'mt-3 flex gap-2 rounded-lg px-2 pt-1.5 pb-0 first:mt-0 hover:bg-[var(--color-hover)]',
  follow:
    'rounded-lg py-px pr-2 pl-10 text-[0.8125rem] leading-snug break-words whitespace-pre-wrap hover:bg-[var(--color-hover)]',
  rowMentioned: 'bg-[color-mix(in_srgb,var(--color-gold-400)_14%,transparent)]',
  body: 'flex min-w-0 flex-1 flex-col text-[0.8125rem] leading-snug break-words whitespace-pre-wrap',
  meta: 'mb-1 flex items-center gap-1.5',
  author: 'truncate text-[0.8125rem] font-bold',
  time: 'ml-auto shrink-0 text-[0.65rem] font-medium text-[var(--color-ink-subtle)] tabular-nums',
  mention:
    'rounded bg-[color-mix(in_srgb,var(--color-ink)_14%,transparent)] px-1 font-semibold text-[var(--color-ink)]',
  // Dashed frame centred in the list
  emptyBox: 'my-auto mx-1 !border-2 !border-dashed !bg-transparent !shadow-none',
  // Filled box holding the room glyphs
  tabs: 'm-1.5 flex gap-1 rounded-xl bg-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] p-1',
  tab: 'grid flex-1 cursor-pointer place-items-center rounded-lg py-1.5 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]',
  tabOn: 'bg-[var(--color-surface-raised)] text-[var(--color-ink)] shadow-sm',
  tabUnread:
    'relative after:absolute after:top-1 after:right-2 after:size-1.5 after:rounded-full after:bg-[var(--color-danger)]',
  typing:
    'flex h-5 items-center gap-1.5 px-3 text-[0.7rem] font-medium text-[var(--color-ink-subtle)]',
  typingDots:
    'inline-flex items-center gap-0.5 [&>span]:size-1 [&>span]:rounded-full [&>span]:bg-current',
  reactions: 'mt-1 mb-0.5 flex flex-wrap items-center gap-1 pl-10',
  chip: 'inline-flex cursor-pointer items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--color-ink)_10%,transparent)] px-2 py-px text-xs font-semibold hover:bg-[var(--color-hover)]',
  chipMine: 'bg-[color-mix(in_srgb,var(--color-apple-green)_24%,transparent)]',
  picker:
    'popover-enter glass-panel absolute top-full right-0 z-20 mt-1 flex gap-0.5 rounded-xl border border-[var(--color-border-strong)] p-1 shadow-[var(--shadow-lg)]',
  pickerItem:
    'grid size-7 cursor-pointer place-items-center rounded-lg text-base hover:bg-[var(--color-hover)]',
  older: 'self-center text-xs font-semibold text-[var(--color-ink-accent)] hover:underline',
  empty: 'px-3 py-4 text-center text-xs text-[var(--color-ink-subtle)]',
  composer: 'flex flex-col border-t border-[var(--color-border-strong)]',
  mentions:
    'flex flex-wrap items-center gap-1.5 border-b border-[var(--color-border-strong)] px-3 py-2.5',
  mentionButton:
    'cursor-pointer rounded-md bg-[color-mix(in_srgb,var(--color-ink)_10%,transparent)] px-2 py-0.5 text-[0.7rem] font-semibold whitespace-nowrap text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]',
  inputBar: 'flex items-center gap-2 px-3 py-2',
  field:
    'block max-h-28 min-h-9 min-w-0 flex-1 resize-none rounded-full bg-[color-mix(in_srgb,var(--room)_16%,transparent)] px-4 py-2 text-[0.8125rem] placeholder:text-[var(--color-ink-subtle)] focus:bg-[color-mix(in_srgb,var(--room)_22%,transparent)] focus:outline-none focus-visible:!rounded-full focus-visible:!border-transparent focus-visible:!shadow-none',
  suggest:
    'popover-enter glass-panel absolute right-2 bottom-full left-2 z-10 mb-1 flex flex-col overflow-hidden rounded-xl border border-[var(--color-border-strong)] p-1 shadow-[var(--shadow-lg)]',
  suggestItem:
    'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[0.8125rem] font-semibold',
  suggestOn: 'text-[var(--color-ink)] hover:bg-transparent',
  // Glass pill gliding under the open item
  pill: 'tab-indicator glass-pill pointer-events-none absolute top-0 left-0 rounded-[var(--radius-lg)]',
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

/**
 * Custom action buttons
 * @type {Record<string, string>}
 */

export const MODVIEW_ACTION = {
  bar: 'inline-flex shrink-0 items-center gap-0.5 align-middle',
  button:
    'inline-flex h-5 min-w-5 items-center justify-center gap-1 px-0.5 text-xs font-bold whitespace-nowrap opacity-80 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-25',
  icon: 'h-4 w-4 shrink-0',
} as const

/**
 * Editor of the custom actions
 * @type {Record<string, string>}
 */

export const MODVIEW_ACTION_EDITOR = {
  preview:
    'rounded-[var(--radius-lg)] border border-[var(--glass-thick-line)] bg-[var(--twitch-head)] p-4 shadow-[var(--glass-thick-shadow)]',
  toolbar: 'flex flex-wrap items-center gap-2',
  // Phone: the three buttons share one line
  tools:
    'flex w-full items-center justify-between gap-1 whitespace-nowrap sm:justify-end sm:gap-2 [&>button]:min-w-0 [&>button]:px-2 sm:[&>button]:px-3',
  // Glass over the glow, tone only on the tile
  card: 'glass-thick flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4',
  tile: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--tone)_18%,transparent)] text-[var(--tone)]',
  tileIcon: 'h-6 w-6 shrink-0',
  // Glyph alone, in the tone of its kind
  glyph: 'h-6 w-6 shrink-0 text-[var(--tone)]',
  glyphOff: 'opacity-40',
  // Dashed box closing the list, as the other add boxes
  newBox:
    'flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border-strong)] py-4 text-sm font-bold text-[var(--color-ink-subtle)] enabled:hover:bg-[var(--color-hover)] disabled:opacity-50',
  dragging: 'opacity-40',
  cardRow: 'flex items-center gap-3',
  cardBody: 'flex min-w-0 flex-1 flex-col gap-0.5',
  cardTitle: 'text-base font-bold',
  cardLine: 'text-sm text-[var(--color-ink-subtle)]',
  cardSide: 'flex shrink-0 items-center gap-3 px-3',
  cardButtons: 'flex shrink-0 flex-col items-start',
  list: 'flex flex-col gap-2',
  item: 'flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-2',
  row: 'flex items-center gap-2',
  grip: '-mr-1 -ml-2 flex w-4 shrink-0 cursor-grab items-center justify-center self-stretch text-[var(--color-ink-subtle)] active:cursor-grabbing',
  summary: 'flex min-w-0 flex-1 items-center justify-between gap-2 text-left text-sm font-bold',
  off: 'text-[var(--color-ink-subtle)] line-through',
  turned: 'rotate-180',
  fold: 'text-xs text-[var(--color-ink-subtle)] italic',
  editor: 'flex flex-col gap-4 border-t border-[var(--color-border)] pt-3',
  field: 'flex flex-col gap-1.5',
  label: 'text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  icons: 'grid grid-cols-5 gap-1',
  iconButton:
    'flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-hover)]',
  iconOn: 'border-[var(--color-ink)] bg-[var(--color-hover)]',
  iconGlyph: 'h-4 w-4 shrink-0',
  looks: 'flex flex-wrap items-center gap-2',
} as const

/**
 * Poll banner and its form
 * @type {Record<string, string>}
 */

export const MODVIEW_POLL = {
  root: 'relative z-10 m-2 flex shrink-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] text-sm shadow-[var(--shadow-md)]',
  timer: 'h-1 w-full bg-[var(--color-hover)]',
  timerFill: 'h-full bg-[var(--color-brand-600)] transition-[width] duration-1000 ease-linear',
  body: 'flex flex-col gap-1.5 px-3 py-2',
  head: 'flex items-center gap-1.5 text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  headIcon: 'h-3.5 w-3.5 shrink-0',
  headText: 'min-w-0 truncate',
  tools: 'ml-auto flex shrink-0 items-center gap-1',
  end: 'rounded-[var(--radius-sm)] px-1.5 py-0.5 text-micro font-bold normal-case hover:bg-[var(--color-hover)]',
  fold: 'flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)]',
  foldIcon: 'h-3.5 w-3.5 transition-transform duration-[var(--motion-duration-fast)]',
  foldIconClosed: '-rotate-90',
  question: 'font-bold [overflow-wrap:anywhere]',
  questionFolded: 'truncate font-bold',
  choices: 'flex flex-col gap-1',
  choice:
    'relative flex items-center gap-2 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-hover)] px-2 py-1.5',
  choiceFill:
    'absolute inset-y-0 left-0 transition-[width] duration-[var(--motion-duration-panel)]',
  choiceFillRest: 'bg-[var(--color-brand-600)]/30',
  choiceFillTop: 'bg-[var(--color-brand-600)]/60',
  choiceName: 'relative min-w-0 flex-1 truncate font-medium',
  choiceVotes: 'relative shrink-0 text-xs text-[var(--color-ink-subtle)] tabular-nums',
  choiceShare: 'relative w-10 shrink-0 text-right font-bold tabular-nums',
  foot: 'flex items-center justify-between text-xs text-[var(--color-ink-subtle)] tabular-nums',
  form: 'flex flex-col gap-4',
  field: 'flex flex-col gap-1.5',
  label: 'text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
  choiceRow: 'flex items-center gap-2',
  addChoice:
    'rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-subtle)] hover:bg-[var(--color-hover)]',
  durations: 'flex flex-wrap gap-1.5',
  duration: 'rounded-[var(--radius-full)] px-3 py-1.5 text-sm font-medium',
  durationOff: 'bg-[var(--color-hover)]',
  durationOn: 'bg-[var(--color-brand-600)] text-[var(--color-on-brand)]',
  pointsRow: 'flex items-center justify-between gap-3',
  pointsLabel: 'text-sm font-medium',
  denied: 'text-body',
} as const

/**
 * Settings box of the Mod View
 * @type {Record<string, string>}
 */

export const MODVIEW_SETTINGS = {
  root: 'flex h-[min(34rem,70vh)] flex-col gap-4 sm:flex-row sm:gap-6',
  nav: 'glass-thick relative flex shrink-0 flex-row gap-2 self-start rounded-[var(--radius-xl)] border p-3 sm:w-56 sm:flex-col',
  item: 'relative z-10 flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3 text-left text-sm font-bold text-[var(--color-ink-subtle)] transition-[background-color,color,transform] duration-[var(--motion-duration-base)] active:scale-[0.97] hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  itemOn: 'text-[var(--color-ink)] hover:bg-transparent hover:text-[var(--color-ink)]',
  // Glass pill gliding under the open item
  pill: 'tab-indicator glass-pill pointer-events-none absolute top-0 left-0 rounded-[var(--radius-lg)]',
  icon: 'h-4 w-4 shrink-0 transition-transform duration-[var(--motion-duration-base)]',
  iconOn: 'scale-110',
  // Switches together, the choices below
  groups: 'flex flex-col gap-5',
  list: 'glass-thick flex flex-col divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border px-5',
  row: 'flex items-center justify-between gap-4 py-4 text-base font-medium',
  choice: 'w-48 shrink-0',
  gesture:
    'flex w-full items-center py-4 text-left text-base font-medium hover:text-[var(--color-ink-accent)]',
  // Scrollbar rides the dialog edge, past the body padding
  page: 'min-h-0 min-w-0 flex-1 overflow-y-auto p-1 -mr-5 pr-5 sm:-mr-8 sm:pr-8',
  swap: 'page-swap',
} as const

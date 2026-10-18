import { PROPERTY_LABEL } from '@/declarations/ui/variants/controls'

/**
 * Mod View frame
 * @type {Record<string, string>}
 */

export const MODVIEW_FRAME = {
  root: 'flex min-h-0 w-full flex-col gap-3',
  // Hook read by the page shell to drop banner room and width cap
  bleed: 'modview-bleed flex-1 flex-row gap-2',
  embedded: 'h-[clamp(26rem,64dvh,44rem)] min-h-0',
  bar: 'flex flex-wrap items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 shadow-[var(--shadow-sm)]',
  channel: 'flex items-center gap-2 font-bold',
  platform: 'h-6 w-6 shrink-0',
  status:
    'flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)] px-3 py-1.5 text-xs font-bold tracking-wide uppercase',
  livecon: 'flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase',
  liveconIcon: 'h-5 w-5',
  body: 'flex min-h-0 flex-1 gap-3',
  rail: 'hidden w-12 shrink-0 flex-col items-center gap-1.5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-2 shadow-[var(--shadow-sm)] md:flex',
  railButton:
    'flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  railButtonOff: 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0',
  railIcon: 'h-5 w-5',
  grid: 'grid grid-cols-1 min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,0.7fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden',
  column: 'flex min-h-0 flex-col gap-3',
  // Wrapper dropped in focus mode
  flat: 'contents',
  // Windows of a course focus
  focus: 'grid min-h-0 flex-1 auto-cols-fr gap-3 lg:grid-flow-col lg:grid-rows-[minmax(0,1fr)]',
  pair: 'grid grid-cols-1 min-h-0 flex-1 gap-3 sm:grid-cols-2',
} as const

/**
 * One window of the grid
 * @type {Record<string, string>}
 */

export const MODVIEW_WINDOW = {
  root: 'relative flex min-h-64 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)] transition-[box-shadow,transform] duration-[var(--motion-duration-panel)] lg:min-h-0',
  grow: 'flex-1',
  // Window of the workspace: the slot sizes it
  tiled: 'h-full min-h-0',
  headDraggable: 'cursor-grab active:cursor-grabbing',
  grip: 'h-4 w-4 shrink-0 text-[var(--color-ink-subtle)]',
  controls: 'flex shrink-0 items-center',
  control:
    'flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
  controlIcon: 'h-3.5 w-3.5',
  // Lit by a scene
  lit: 'z-20 scale-[1.01] shadow-[0_0_0_2px_var(--color-brand-600),0_0_0_8px_color-mix(in_oklab,var(--color-brand-600)_35%,transparent),var(--shadow-md)]',
  // Heading band tinted apart from the body, as on Twitch
  head: 'flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2',
  title: 'min-w-0 flex-1 truncate text-sm font-bold tracking-tight',
  headAction:
    'rounded-[var(--radius-md)] px-2 py-1 text-xs font-bold text-[var(--color-brand-800)] transition-colors hover:bg-[var(--color-hover)]',
  body: 'min-h-0 flex-1 overflow-y-auto',
  flush: 'flex min-h-0 flex-1 flex-col',
  pad: 'p-3',
  empty: 'flex h-full flex-col items-center justify-center gap-2 p-6 text-center',
  emptyIcon: 'h-10 w-10',
  emptyTitle: 'text-sm font-bold',
  emptyBody: 'max-w-64 text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Dim layer behind a lit window
 * @type {Record<string, string>}
 */

export const MODVIEW_SPOTLIGHT = {
  veil: 'pointer-events-none absolute inset-0 z-10 rounded-[var(--radius-xl)] bg-[var(--color-scrim)] backdrop-blur-[1.5px] transition-opacity duration-[var(--motion-duration-panel)]',
  stage: 'relative flex min-h-0 flex-1 flex-col overflow-hidden',
} as const

/**
 * Stream window and the title under it
 * @type {Record<string, string>}
 */

export const MODVIEW_STREAM = {
  frame: 'aspect-video w-full bg-[var(--color-surface-sunken)]',
  // In the workspace the player takes the room the title leaves
  fill: 'min-h-0 w-full flex-1 bg-[var(--color-surface-sunken)]',
  embed: 'h-full w-full border-0',
  title: 'flex items-center gap-3 px-3 py-2.5',
  art: 'h-12 w-9 shrink-0 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] object-cover',
  titleBody: 'min-w-0 flex-1',
  titleText: 'text-sm leading-snug font-semibold',
  category: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Moderator actions
 * @type {Record<string, string>}
 */

export const MODVIEW_FEED = {
  // Line of the moderator followed in Focus mode
  itemFocus:
    'rounded-[var(--radius-md)] bg-[var(--color-brand-100)] ring-2 ring-[var(--color-pick)]',
  count: 'px-3 pt-2 text-xs font-bold text-[var(--color-ink-subtle)]',
  list: 'flex flex-col divide-y divide-[var(--color-border)]',
  item: 'flex gap-2.5 px-3 py-2.5',
  itemPending: 'opacity-60',
  icon: 'mt-0.5 h-5 w-5 shrink-0',
  main: 'flex min-w-0 flex-1 flex-col gap-0.5 text-sm',
  target: 'w-fit font-bold underline underline-offset-2 hover:text-[var(--color-brand-800)]',
  line: 'text-[var(--color-ink-subtle)]',
  who: 'font-semibold text-[var(--color-ink)]',
  quote:
    'mt-1 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-2 py-1 text-xs break-words',
  flagged:
    'rounded-sm bg-[color-mix(in_oklab,var(--color-danger)_18%,transparent)] px-0.5 font-bold text-[var(--color-danger)] ring-1 ring-[var(--color-danger)]',
  category: `${PROPERTY_LABEL} text-[var(--color-ink-subtle)]`,
  actions: 'mt-1.5 flex flex-wrap gap-2',
} as const

/**
 * Chat window
 * @type {Record<string, string>}
 */

export const MODVIEW_CHAT = {
  hint: 'px-3 pt-2 text-xs font-semibold text-[var(--color-danger)]',
  root: 'lg:h-full',
  scroller: 'min-h-0 flex-1 overflow-y-auto',
  time: 'mr-1.5 font-[family-name:var(--font-mono)] text-micro text-[var(--color-ink-subtle)]',
  deletedText: 'text-[var(--color-ink-subtle)] line-through',
  deletedNote: 'ml-1.5 text-xs text-[var(--color-ink-subtle)] italic',
  triggerLit: 'ring-2 ring-[var(--color-pick)]',
  welcome: 'px-3 pt-3 pb-1 text-sm text-[var(--color-ink-subtle)]',
  list: 'flex flex-col py-1',
  line: 'group relative px-3 py-1 text-sm leading-relaxed break-words transition-colors hover:bg-[var(--color-hover)]',
  lineFirst:
    'border-l-4 border-[var(--color-brand-600)] bg-[color-mix(in_oklab,var(--color-brand-600)_8%,transparent)]',
  lineLit: 'bg-[color-mix(in_oklab,var(--color-caution)_18%,transparent)]',
  firstTag:
    'mb-0.5 block text-micro font-bold tracking-wide text-[var(--color-brand-800)] uppercase',
  badge: 'mr-1 inline-block h-4 w-4 align-[-2px]',
  name: 'cursor-pointer font-bold hover:underline',
  deleted: 'text-[var(--color-ink-subtle)] italic',
  // Gestures shown on hover
  tools:
    'absolute top-0.5 right-2 hidden items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-0.5 shadow-[var(--shadow-sm)] group-hover:flex group-focus-within:flex',
  tool: 'flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-35',
  toolIcon: 'h-4 w-4',
  resume:
    'absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-ink)] px-3 py-1 text-xs font-bold text-[var(--color-surface-raised)] shadow-[var(--shadow-md)]',
  quick:
    'flex gap-3 border-t border-[var(--color-border)] px-3 pt-2 text-xs font-bold text-[var(--color-ink-subtle)]',
  composer: 'flex flex-col gap-2 p-3 pt-2',
  input:
    'w-full rounded-[var(--radius-lg)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-ink-subtle)] disabled:cursor-not-allowed disabled:opacity-60',
  composerRow: 'flex items-center justify-end',
} as const

/**
 * Chat modes menu
 * @type {Record<string, string>}
 */

export const MODVIEW_MODES = {
  trigger:
    'flex items-center gap-1.5 rounded-[var(--radius-md)] px-2 py-1 text-xs font-bold transition-colors hover:bg-[var(--color-hover)]',
  triggerIcon: 'h-4 w-4',
  panel:
    'absolute top-11 right-2 z-30 flex w-72 flex-col gap-1 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2 shadow-[var(--shadow-md)]',
  row: 'flex items-center gap-3 rounded-[var(--radius-lg)] px-2 py-2 text-left text-sm transition-colors hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent',
  // Option a scene is setting
  rowLit: 'bg-[var(--color-brand-soft)] ring-2 ring-[var(--color-pick)]',
  rowIcon: 'h-5 w-5 shrink-0',
  rowLabel: 'min-w-0 flex-1 font-semibold',
  rowState: 'text-xs font-bold tracking-wide uppercase',
  on: 'text-[var(--color-success)]',
  off: 'text-[var(--color-ink-subtle)]',
  reason: 'px-2 pb-1 text-xs text-[var(--color-ink-subtle)]',
  terms: 'flex flex-col gap-2 px-2 pb-2',
  termList: 'flex flex-wrap gap-1.5',
  termForm: 'flex gap-2',
  termInput:
    'min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm outline-none focus:border-[var(--color-ink-subtle)]',
} as const

/**
 * Community window
 * @type {Record<string, string>}
 */

export const MODVIEW_COMMUNITY = {
  search: 'flex items-center gap-2 p-3',
  input:
    'w-full rounded-[var(--radius-lg)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-ink-subtle)]',
  group:
    'mx-2 mb-2 flex flex-col gap-1 rounded-[var(--radius-lg)] px-2 pb-2 transition-[background-color,box-shadow]',
  groupLit: 'bg-[var(--color-brand-100)] ring-2 ring-[var(--color-pick)]',
  groupHead: 'flex items-center gap-2 py-1 text-sm font-bold',
  groupIcon: 'h-5 w-5 shrink-0',
  member: 'w-fit cursor-pointer text-sm font-semibold hover:underline',
  empty: 'text-xs text-[var(--color-ink-subtle)] italic',
} as const

/**
 * Viewer card
 * @type {Record<string, string>}
 */

export const MODVIEW_USER = {
  panel:
    'course-pop absolute inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-md)]',
  head: 'flex items-center gap-3 border-b border-[var(--color-border)] p-4',
  name: 'min-w-0 flex-1 truncate text-lg font-bold tracking-tight',
  body: 'flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4',
  section: 'flex flex-col gap-2',
  label: PROPERTY_LABEL,
  messages: 'flex flex-col gap-1.5',
  message:
    'rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-2 py-1 text-sm break-words',
  actions: 'grid grid-cols-2 gap-2',
  presets: 'flex flex-wrap gap-1.5',
  preset:
    'rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 py-1 text-xs font-bold transition-colors hover:border-[var(--color-border-strong)] disabled:cursor-not-allowed disabled:opacity-40',
  reason:
    'w-full rounded-[var(--radius-lg)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-ink-subtle)]',
  lock: 'text-xs text-[var(--color-ink-subtle)]',
} as const

/**
 * Sanctions panel at hand
 * @type {Record<string, string>}
 */

export const MODVIEW_SANCTIONS = {
  root: 'flex min-h-0 shrink-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)] transition-[width] duration-[var(--motion-duration-panel)]',
  open: 'w-full lg:w-80',
  closed: 'hidden w-12 lg:flex',
  toggle:
    'flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-left text-sm font-bold transition-colors hover:bg-[var(--color-hover)]',
  toggleIcon: 'h-5 w-5 shrink-0',
  body: 'min-h-0 flex-1 overflow-y-auto p-3',
  // Offences above, sanctions history below
  split: 'flex min-h-0 flex-1 flex-col',
  top: 'min-h-0 overflow-y-auto p-3',
  bottom: 'flex min-h-0 flex-col',
  bottomTitle:
    'border-y border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm font-bold tracking-tight',
  bottomBody: 'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3',
  suggestion: 'flex flex-col gap-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)] p-2',
  suggestionTitle: PROPERTY_LABEL,
  level: 'mb-3 flex items-center gap-2 text-xs font-bold tracking-wide uppercase',
  group: 'mb-4 flex flex-col gap-1.5',
  groupTitle: `${PROPERTY_LABEL} text-[var(--accent)]`,
  offense:
    'relative flex w-full flex-col gap-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 pl-4 text-left transition-colors hover:border-[var(--color-border-strong)]',
  offenseOpen: 'border-[var(--color-brand-600)]',
  offenseRule: 'absolute inset-y-0 left-0 w-1 bg-[var(--accent)]',
  offenseName: 'text-sm font-bold tracking-tight',
  measures: 'flex flex-wrap gap-1',
  measure: 'rounded-[var(--radius-sm)] px-1.5 py-0.5 text-micro font-bold',
  detail: 'flex flex-col gap-2 px-1 pt-2 pb-1',
  condition: 'text-xs text-[var(--color-ink-subtle)]',
  apply: 'w-full',
  hint: 'text-xs text-[var(--color-ink-subtle)] italic',
  empty: 'text-sm text-[var(--color-ink-subtle)] italic',
  // Second version: centred level, search, glyph tabs, then text boxes
  head: 'flex flex-col items-center gap-1 pb-3 text-center',
  headGlyph: 'h-8 w-8',
  headName: 'text-sm font-bold tracking-wide uppercase',
  search:
    'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-ink-subtle)]',
  tabs: 'flex items-center justify-center gap-2 py-3',
  tab: 'flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-ink)]',
  tabOn: 'bg-[var(--color-surface-sunken)] text-[var(--color-ink)]',
  tabGlyph: 'h-5 w-5',
  divider: 'mb-3 border-t border-[var(--color-border)]',
  list: 'flex flex-col gap-2',
  box: 'relative flex flex-col gap-1.5 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 pl-4 text-sm',
  boxHead: 'flex items-start gap-2',
  star: 'ml-auto shrink-0 text-[var(--color-ink-subtle)] hover:text-[var(--color-caution)]',
  starOn: 'text-[var(--color-caution)]',
  starGlyph: 'h-4 w-4',
  rung: 'text-xs text-[var(--color-ink-subtle)]',
  rungDone: 'text-xs text-[var(--color-ink-subtle)] line-through opacity-60',
  rungNext: 'text-xs font-bold text-[var(--color-ink)]',
  actions: 'flex flex-wrap gap-1.5 pt-1',
} as const

// Share the offences keep when the history is dragged
export const MODVIEW_SANCTIONS_SPLIT = { min: 0.2, max: 0.8 } as const

/**
 * Preview page around the Mod View
 * @type {Record<string, string>}
 */

export const MODVIEW_PREVIEW = {
  root: 'flex min-h-0 w-full flex-1 flex-col gap-2',
  toolbar: 'flex flex-wrap items-center justify-center gap-3',
} as const

/**
 * Workspace holding the windows: columns, handles, drop marks
 * @type {Record<string, string>}
 */

export const MODVIEW_WORKSPACE = {
  root: 'flex min-h-0 min-w-0 flex-1',
  column: 'flex min-h-0 min-w-0 flex-col',
  away: 'hidden',
  slot: 'relative flex min-h-0 min-w-0 flex-col',
  // Handles between two columns or two windows
  columnHandle:
    'group relative z-10 w-2 shrink-0 cursor-col-resize touch-none outline-none focus-visible:bg-[var(--color-focus-halo)]',
  rowHandle:
    'group relative z-10 h-2 shrink-0 cursor-row-resize touch-none outline-none focus-visible:bg-[var(--color-focus-halo)]',
  columnGrip:
    'absolute inset-y-6 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-transparent transition-colors group-hover:bg-[var(--color-brand-400)] group-active:bg-[var(--color-brand-600)]',
  rowGrip:
    'absolute inset-x-6 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-transparent transition-colors group-hover:bg-[var(--color-brand-400)] group-active:bg-[var(--color-brand-600)]',
  // Where a dragged window would land
  dropLeft:
    'pointer-events-none absolute inset-y-0 left-0 z-40 w-1.5 rounded-full bg-[var(--color-brand-600)]',
  dropRight:
    'pointer-events-none absolute inset-y-0 right-0 z-40 w-1.5 rounded-full bg-[var(--color-brand-600)]',
  dropTop:
    'pointer-events-none absolute inset-x-0 top-0 z-40 h-1.5 rounded-full bg-[var(--color-brand-600)]',
  dropBottom:
    'pointer-events-none absolute inset-x-0 bottom-0 z-40 h-1.5 rounded-full bg-[var(--color-brand-600)]',
  dragging: 'opacity-50',
} as const

/**
 * Icon column on the left of a Mod View, bare on the page
 * @type {Record<string, string>}
 */

export const MODVIEW_SIDEBAR = {
  root: 'relative z-30 flex w-11 shrink-0 flex-col items-center justify-between py-1',
  stack: 'flex flex-col items-center gap-1',
  group: 'relative flex flex-col items-center gap-1',
  button:
    'flex size-10 cursor-pointer items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
  buttonOpen: 'bg-[var(--color-hover)]',
  icon: 'size-5',
  panel:
    'popover-enter glass-panel absolute left-full z-[60] ml-2 flex max-h-[80dvh] w-72 flex-col gap-1 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] p-2 text-sm shadow-[var(--shadow-lg)]',
  panelTop: 'top-0',
  panelBottom: 'bottom-0',
  subtitle: 'px-2.5 pb-1 text-xs text-[var(--color-ink-subtle)]',
  title:
    'px-2.5 pt-1.5 pb-1 text-micro font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase',
} as const

/**
 * Page holding a Mod View
 * @type {Record<string, string>}
 */

export const MODVIEW_PAGE = {
  // Named for screen readers
  title: 'sr-only',
  // Fills the screen under the shell padding
  wrapper: 'flex min-h-0 w-full flex-1 flex-col gap-2',
} as const

/**
 * History view standing where the connected list was
 * @type {Record<string, string>}
 */

export const MODVIEW_HISTORY = {
  empty: 'text-xs text-[var(--color-ink-subtle)] italic',
  viewer:
    'flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2',
  viewerHead: 'flex flex-wrap items-center gap-2',
  name: 'text-sm font-bold hover:underline',
  line: 'text-xs text-[var(--color-ink-subtle)]',
  propose: 'self-start',
  past: 'flex flex-col gap-0.5 border-t border-[var(--color-border)] pt-1.5',
  tag: 'text-micro font-bold tracking-wide uppercase',
  tagPanel: 'text-[var(--color-success)]',
  tagOff: 'text-[var(--color-caution)]',
} as const

/**
 * Inspect Mod card and Focus banner
 * @type {Record<string, string>}
 */

export const MODVIEW_INSPECT = {
  card: 'surface-enter absolute top-3 right-3 z-20 flex max-h-[80%] w-80 flex-col gap-3 overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-lg)]',
  head: 'flex items-center gap-3',
  name: 'min-w-0 flex-1 truncate text-base font-bold',
  facts: 'grid grid-cols-2 gap-2',
  fact: 'flex flex-col gap-0.5',
  factLabel: PROPERTY_LABEL,
  factValue: 'text-sm font-semibold',
  warn: 'text-sm font-semibold text-[var(--color-danger)]',
  list: 'flex flex-col gap-1',
  line: 'text-xs',
  banner:
    'flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border-2 border-[var(--color-brand-600)] bg-[var(--color-brand-100)] px-4 py-2',
  bannerText: 'flex min-w-0 flex-1 flex-col',
  bannerTitle: 'text-sm font-bold',
  bannerHint: 'text-xs text-[var(--color-ink-subtle)]',
} as const
